const cron = require('node-cron');
const PSReminder = require('../models/PSReminder');
const ReminderSchedule = require('../models/ReminderSchedule');
const CSReminder = require('../models/CSReminder');
const CSReminderSchedule = require('../models/CSReminderSchedule');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

const scanAndSendReminders = async () => {
  try {
    const now = new Date();
    const schedules = await ReminderSchedule.find({
      scheduledDate: { $lte: now },
      emailSent: false
    }).populate({
      path: 'reminderId',
      populate: { path: 'creator', select: 'name email' }
    });

    // Process ALL schedules in parallel
    await Promise.all(schedules.map(async (schedule) => {
      const reminder = schedule.reminderId;
      if (!reminder) {
        await schedule.deleteOne();
        return;
      }

      console.log(`Processing schedule for reminder: ${reminder.title} (Interval: ${schedule.intervalMonths} months)`);

      const filingDateFormatted = new Date(reminder.psFilingDate).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      const scheduledDateFormatted = new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      // Send all recipient emails in parallel
      await Promise.all(reminder.recipientEmails.map(async (email) => {
        try {
          await sendEmail({
            email,
            subject: 'PS Reminder Notification',
            senderName: 'LextrAI Research',
            replyTo: reminder.creator.email,
            replyToName: reminder.creator.name,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 35px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; border-bottom: 2px solid #edf2f7; padding-bottom: 20px; margin-bottom: 25px;">
                  <h1 style="color: #2b6cb0; font-size: 22px; margin: 0; font-weight: bold; letter-spacing: 0.5px;">LextrAI Research</h1>
                  <p style="color: #4a5568; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">PS Reminder Management System</p>
                </div>
                <div style="font-size: 15px; line-height: 1.6; color: #2d3748;">
                  <p style="margin-top: 0;">Hello,</p>
                  <p>This is an automated reminder from <strong>LextrAI Research</strong> regarding the following PS record.</p>
                  <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce; margin: 24px 0; border-top: 1px solid #edf2f7; border-right: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; width: 40%; font-size: 13px; text-transform: uppercase;">PS Title:</td><td style="padding: 6px 0; color: #1a202c; font-weight: bold;">${reminder.title}</td></tr>
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; font-size: 13px; text-transform: uppercase;">PS Filing Date:</td><td style="padding: 6px 0; color: #1a202c;">${filingDateFormatted}</td></tr>
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; font-size: 13px; text-transform: uppercase;">Reminder Interval:</td><td style="padding: 6px 0; color: #1a202c;">${schedule.intervalMonths} months</td></tr>
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; font-size: 13px; text-transform: uppercase;">Scheduled Date:</td><td style="padding: 6px 0; color: #2b6cb0; font-weight: bold;">${scheduledDateFormatted}</td></tr>
                    </table>
                  </div>
                  <p>Please take the necessary action.</p>
                  <p style="margin-top: 35px; border-top: 1px solid #edf2f7; padding-top: 20px; line-height: 1.5;">
                    Regards,<br><strong>LextrAI Research</strong><br>
                    <span style="color: #718096; font-size: 13px;">PS Reminder Management System</span>
                  </p>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px; text-align: center; font-size: 11px; color: #a0aec0;">
                  This is an automated notification. Please do not reply directly to this message.
                </div>
              </div>
            `
          });
        } catch (emailErr) {
          console.error(`Failed to send email to ${email}:`, emailErr.message);
        }
      }));

      // Mark schedule as completed
      schedule.emailSent = true;
      schedule.sentAt = new Date();
      schedule.status = 'completed';
      await schedule.save();

      await Notification.create({
        userId: reminder.creator._id,
        message: `PS Reminder "${reminder.title}" notification (Interval: ${schedule.intervalMonths} months) has been sent to recipients.`,
        type: 'reminder',
        capsuleId: reminder._id
      });

      console.log(`Schedule completed successfully for reminder "${reminder.title}"`);
    }));

    if (schedules.length > 0) {
      console.log(`Processed ${schedules.length} reminder schedule(s).`);
    }
  } catch (err) {
    console.error('Reminder scheduler error:', err.message);
  }
};

const scanAndSendCSReminders = async () => {
  try {
    const now = new Date();
    const schedules = await CSReminderSchedule.find({
      scheduledDate: { $lte: now },
      emailSent: false,
    }).populate({
      path: 'reminderId',
      populate: { path: 'creator', select: 'name email' },
    });

    // Process ALL CS schedules in parallel
    await Promise.all(schedules.map(async (schedule) => {
      const reminder = schedule.reminderId;
      if (!reminder) {
        await schedule.deleteOne();
        return;
      }

      console.log(`Processing CS schedule for reminder: ${reminder.title} (Interval: ${schedule.intervalDays} days)`);

      const filingDateFormatted = new Date(reminder.csFilingDate).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const scheduledDateFormatted = new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      // Send all recipient emails in parallel
      await Promise.all(reminder.recipientEmails.map(async (email) => {
        try {
          await sendEmail({
            email,
            subject: 'CS Reminder Notification',
            senderName: 'LextrAI Research',
            replyTo: reminder.creator.email,
            replyToName: reminder.creator.name,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 35px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; border-bottom: 2px solid #edf2f7; padding-bottom: 20px; margin-bottom: 25px;">
                  <h1 style="color: #6b46c1; font-size: 22px; margin: 0; font-weight: bold; letter-spacing: 0.5px;">LextrAI Research</h1>
                  <p style="color: #4a5568; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">CS Reminder Management System</p>
                </div>
                <div style="font-size: 15px; line-height: 1.6; color: #2d3748;">
                  <p style="margin-top: 0;">Hello,</p>
                  <p>This is an automated reminder from <strong>LextrAI Research</strong> regarding the following CS record.</p>
                  <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #6b46c1; margin: 24px 0; border-top: 1px solid #edf2f7; border-right: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; width: 40%; font-size: 13px; text-transform: uppercase;">CS Title:</td><td style="padding: 6px 0; color: #1a202c; font-weight: bold;">${reminder.title}</td></tr>
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; font-size: 13px; text-transform: uppercase;">CS Filing Date:</td><td style="padding: 6px 0; color: #1a202c;">${filingDateFormatted}</td></tr>
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; font-size: 13px; text-transform: uppercase;">Reminder Interval:</td><td style="padding: 6px 0; color: #1a202c;">${schedule.intervalDays} days</td></tr>
                      <tr><td style="padding: 6px 0; font-weight: bold; color: #4a5568; font-size: 13px; text-transform: uppercase;">Scheduled Date:</td><td style="padding: 6px 0; color: #6b46c1; font-weight: bold;">${scheduledDateFormatted}</td></tr>
                    </table>
                  </div>
                  <p>Please take the necessary action.</p>
                  <p style="margin-top: 35px; border-top: 1px solid #edf2f7; padding-top: 20px; line-height: 1.5;">
                    Regards,<br><strong>LextrAI Research</strong><br>
                    <span style="color: #718096; font-size: 13px;">CS Reminder Management System</span>
                  </p>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px; text-align: center; font-size: 11px; color: #a0aec0;">
                  This is an automated notification. Please do not reply directly to this message.
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error(`Failed to send CS email to ${email}:`, emailErr.message);
        }
      }));

      schedule.emailSent = true;
      schedule.sentAt = new Date();
      schedule.status = 'completed';
      await schedule.save();

      await Notification.create({
        userId: reminder.creator._id,
        message: `CS Reminder "${reminder.title}" notification (Interval: ${schedule.intervalDays} days) has been sent to recipients.`,
        type: 'reminder',
        capsuleId: reminder._id,
      });

      console.log(`CS Schedule completed for reminder "${reminder.title}"`);
    }));

    if (schedules.length > 0) {
      console.log(`Processed ${schedules.length} CS reminder schedule(s).`);
    }
  } catch (err) {
    console.error('CS Reminder scheduler error:', err.message);
  }
};

const startScheduler = () => {
  if (process.env.RUN_LOCAL_CRON === 'true' || (process.env.NODE_ENV === 'development' && process.env.RUN_LOCAL_CRON !== 'false')) {
    cron.schedule('* * * * *', () => {
      console.log('Running PS & CS Reminder schedule scanner...');
      scanAndSendReminders();
      scanAndSendCSReminders();
    });
    console.log('PS & CS Reminder scheduler started (runs every 1 minute)');
  } else {
    console.log('PS & CS Reminder scheduler bypassed (triggered via HTTP endpoint)');
  }
};

module.exports = {
  startScheduler,
  scanAndSendReminders,
  scanAndSendCSReminders,
};
