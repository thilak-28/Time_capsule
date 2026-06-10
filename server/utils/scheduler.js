const cron = require('node-cron');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');
const Capsule = require('../models/Capsule');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

const deliverCapsules = async () => {
  try {
    // Find all sealed capsules whose unlock date has passed
    const capsules = await Capsule.find({
      status: 'sealed',
      unlockDate: { $lte: new Date() },
      deliveredAt: null,
    }).populate('creator', 'name email');

    for (const capsule of capsules) {
      console.log(`Delivering capsule: ${capsule.title} (${capsule._id})`);

      // Email delivery
      if (capsule.deliveryMode === 'email' || capsule.deliveryMode === 'both') {
        for (const recipient of capsule.recipients) {
          try {
            // 1. Fetch media assets as Base64 strings (Done once per capsule if possible, but for simplicity we do it here)
            const attachments = [];
            if (capsule.media && capsule.media.length > 0) {
              for (const url of capsule.media) {
                try {
                  // Extract public_id from URL
                  const parts = url.split('/');
                  const fileName = parts.pop();
                  const folder = parts.pop();
                  const publicId = `${folder}/${fileName.split('.')[0]}`;
                  
                  // Generate Private Download URL
                  const downloadUrl = cloudinary.utils.private_download_url(publicId, fileName.split('.').pop(), {
                    resource_type: url.includes('/raw/') ? 'raw' : 'image',
                    type: 'upload'
                  });

                  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
                  const base64Content = Buffer.from(response.data).toString('base64');
                  
                  attachments.push({
                    content: base64Content,
                    name: fileName
                  });
                } catch (fetchErr) {
                  console.error(`Failed to fetch asset ${url}:`, fetchErr.message);
                }
              }
            }

            // 2. Send the Email
            await sendEmail({
              email: recipient.email,
              subject: `🎉 Your Time Capsule "${capsule.title}" has been unlocked!`,
              senderName: `${capsule.creator.name} via Time Capsule`,
              replyTo: capsule.creator.email,
              replyToName: capsule.creator.name,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">🕰️ Time Capsule Unlocked!</h1>
                  </div>
                  <div style="padding: 30px; color: #333;">
                    <h2 style="color: #1f2937;">${capsule.title}</h2>
                    <p style="color: #666;">A message from the past from <strong>${capsule.creator.name} (${capsule.creator.email})</strong>:</p>
                    <div style="background: #fdfbf7; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; font-style: italic;">
                      ${capsule.content}
                    </div>
                    <p style="font-size: 14px; color: #888;">Attached you will find your preserved media assets.</p>
                  </div>
                  <div style="background: #f9fafb; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #aaa;">
                    Created on ${capsule.createdAt.toLocaleDateString()} • Delivered by Aether Vault
                  </div>
                </div>
              `,
              attachments: attachments
            });
          } catch (emailErr) {
            console.error(`Failed to send email to ${recipient.email}:`, emailErr.message);
          }
        }
      }

      // In-app notification delivery
      if (capsule.deliveryMode === 'in-app' || capsule.deliveryMode === 'both') {
        for (const recipient of capsule.recipients) {
          if (recipient.userId) {
            await Notification.create({
              userId: recipient.userId,
              message: `Time Capsule "${capsule.title}" from ${capsule.creator.name} has been unlocked!`,
              type: 'capsule_received',
              capsuleId: capsule._id,
            });
          }
        }

        // Also notify the creator
        await Notification.create({
          userId: capsule.creator._id,
          message: `Your Time Capsule "${capsule.title}" has been delivered!`,
          type: 'capsule_delivered',
          capsuleId: capsule._id,
        });
      }

      // Mark as delivered
      capsule.status = 'delivered';
      capsule.deliveredAt = new Date();
      await capsule.save();

      // Handle recurring capsules
      if (capsule.isRecurring && capsule.recurringInterval === 'yearly') {
        const newUnlockDate = new Date(capsule.unlockDate);
        newUnlockDate.setFullYear(newUnlockDate.getFullYear() + 1);

        await Capsule.create({
          title: capsule.title,
          content: capsule.content,
          coverImage: capsule.coverImage,
          media: capsule.media,
          tags: capsule.tags,
          creator: capsule.creator._id,
          recipients: capsule.recipients,
          unlockDate: newUnlockDate,
          deliveryMode: capsule.deliveryMode,
          privacy: capsule.privacy,
          status: 'sealed',
          isRecurring: true,
          recurringInterval: 'yearly',
        });

        console.log(`Recurring capsule cloned with new unlock date: ${newUnlockDate}`);
      }

      console.log(`Capsule "${capsule.title}" delivered successfully.`);
    }

    if (capsules.length > 0) {
      console.log(`${capsules.length} capsule(s) delivered.`);
    }
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
};

// Run every 1 minute (only if configured or in development mode)
const startScheduler = () => {
  if (process.env.RUN_LOCAL_CRON === 'true' || (process.env.NODE_ENV === 'development' && process.env.RUN_LOCAL_CRON !== 'false')) {
    cron.schedule('* * * * *', () => {
      console.log('Running capsule delivery check...');
      deliverCapsules();
    });
    console.log('Capsule delivery scheduler started (runs every 1 minute)');
  } else {
    console.log('Capsule delivery scheduler bypassed (triggered via HTTP endpoint)');
  }
};

module.exports = {
  startScheduler,
  deliverCapsules
};
