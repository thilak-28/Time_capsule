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
              subject: `Your Time Capsule "${capsule.title}" has been unlocked!`,
              senderName: `${capsule.creator.name} via Time Capsule`,
              replyTo: capsule.creator.email,
              replyToName: capsule.creator.name,
              html: `
                <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 2px dashed #E7E1B1; background-color: #FBF5DD; color: #0D530E;">
                  <div style="text-align: center; border-bottom: 1px solid #E7E1B1; padding-bottom: 20px; margin-bottom: 24px;">
                    <h1 style="color: #0D530E; font-size: 28px; margin: 0; font-family: Georgia, serif; font-weight: bold; letter-spacing: 1px;">DIGITAL TIME CAPSULE</h1>
                    <p style="color: #306D29; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Time Capsule Unlocked</p>
                  </div>
                  <div style="color: #0D530E;">
                    <h2 style="font-family: Georgia, serif; color: #0D530E; font-size: 22px; margin-top: 0; border-bottom: 1px solid rgba(231,225,177,0.5); padding-bottom: 8px;">${capsule.title}</h2>
                    <p style="font-size: 15px; line-height: 1.5;">A message from the past from <strong>${capsule.creator.name} (${capsule.creator.email})</strong>:</p>
                    <div style="background-color: #fdfdf9; padding: 25px; border-radius: 4px; border-left: 4px solid #306D29; border-top: 1px solid #E7E1B1; border-right: 1px solid #E7E1B1; border-bottom: 1px solid #E7E1B1; margin: 24px 0; font-family: 'Courier New', Courier, monospace; font-size: 15px; line-height: 1.6; color: #0D530E; white-space: pre-wrap;">
                      ${capsule.content}
                    </div>
                    ${capsule.media && capsule.media.length > 0 ? '<p style="font-size: 13px; color: #306D29; font-style: italic; margin-top: 15px;">Attached you will find your preserved media assets.</p>' : ''}
                  </div>
                  <div style="border-top: 1px solid #E7E1B1; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 11px; color: #306D29; opacity: 0.7;">
                    Created on ${capsule.createdAt.toLocaleDateString()} • Delivered by Digital Time Capsule
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
