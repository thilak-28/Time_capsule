const PSReminder = require('../models/PSReminder');
const ReminderSchedule = require('../models/ReminderSchedule');
const Notification = require('../models/Notification');
const { scanAndSendReminders } = require('../utils/scheduler');

// Helper to generate schedules for a reminder
const generateSchedules = async (reminder) => {
  // Delete existing schedules first
  await ReminderSchedule.deleteMany({ reminderId: reminder._id });

  const schedules = [];
  const filingDate = new Date(reminder.psFilingDate);

  for (const interval of reminder.selectedIntervals) {
    // Add intervalMonths to filingDate
    const scheduledDate = new Date(filingDate);
    scheduledDate.setMonth(scheduledDate.getMonth() + interval);

    schedules.push({
      reminderId: reminder._id,
      intervalMonths: interval,
      scheduledDate,
      status: 'upcoming',
      emailSent: false
    });
  }

  if (schedules.length > 0) {
    await ReminderSchedule.insertMany(schedules);
  }
};

// @desc    Create a new PS Reminder
// @route   POST /api/capsules
// @access  Private
exports.createCapsule = async (req, res) => {
  try {
    const { title, description, psFilingDate, recipientEmails, selectedIntervals, status } = req.body;

    const reminder = await PSReminder.create({
      title,
      description,
      psFilingDate,
      recipientEmails,
      selectedIntervals,
      status: status || 'draft',
      creator: req.user.id
    });

    if (reminder.status === 'active') {
      await generateSchedules(reminder);
      // Fire-and-forget: immediately send any overdue/today schedules
      scanAndSendReminders().catch(err => console.error('Immediate scan error:', err.message));
    }

    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all PS Reminders for current user
// @route   GET /api/capsules
// @access  Private
exports.getCapsules = async (req, res) => {
  try {
    const reminders = await PSReminder.find({ creator: req.user.id }).lean();

    // Attach schedules to each reminder
    for (let r of reminders) {
      r.schedules = await ReminderSchedule.find({ reminderId: r._id });
    }

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single PS Reminder
// @route   GET /api/capsules/:id
// @access  Private
exports.getCapsule = async (req, res) => {
  try {
    const reminder = await PSReminder.findById(req.params.id).lean();

    if (!reminder) {
      return res.status(404).json({ message: 'PS Reminder not found' });
    }

    // Check ownership
    const isCreator = reminder.creator.toString() === req.user.id;
    const isRecipient = reminder.recipientEmails.includes(req.user.email);

    if (!isCreator && !isRecipient) {
      return res.status(401).json({ message: 'Not authorized to view this reminder' });
    }

    // Attach schedules
    reminder.schedules = await ReminderSchedule.find({ reminderId: reminder._id });

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update PS Reminder
// @route   PUT /api/capsules/:id
// @access  Private
exports.updateCapsule = async (req, res) => {
  try {
    let reminder = await PSReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'PS Reminder not found' });
    }

    // Check ownership
    if (reminder.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this reminder' });
    }

    const { title, description, psFilingDate, recipientEmails, selectedIntervals, status } = req.body;

    reminder.title = title || reminder.title;
    reminder.description = description !== undefined ? description : reminder.description;
    reminder.psFilingDate = psFilingDate || reminder.psFilingDate;
    reminder.recipientEmails = recipientEmails || reminder.recipientEmails;
    reminder.selectedIntervals = selectedIntervals || reminder.selectedIntervals;
    if (status) {
      reminder.status = status;
    }

    await reminder.save();

    // Regenerate schedules if the reminder is active
    if (reminder.status === 'active') {
      await generateSchedules(reminder);
    }

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete PS Reminder
// @route   DELETE /api/capsules/:id
// @access  Private
exports.deleteCapsule = async (req, res) => {
  try {
    const reminder = await PSReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'PS Reminder not found' });
    }

    // Check ownership
    if (reminder.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this reminder' });
    }

    // Delete schedules first
    await ReminderSchedule.deleteMany({ reminderId: reminder._id });
    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Activate/Seal a PS Reminder
// @route   POST /api/capsules/:id/seal
// @access  Private
exports.sealCapsule = async (req, res) => {
  try {
    let reminder = await PSReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'PS Reminder not found' });
    }

    if (reminder.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    reminder.status = 'active';
    await reminder.save();

    // Generate schedules
    await generateSchedules(reminder);
    // Fire-and-forget: immediately send any overdue/today schedules
    scanAndSendReminders().catch(err => console.error('Immediate scan error:', err.message));

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get received reminders (inbox)
// @route   GET /api/capsules/inbox
// @access  Private
exports.getInbox = async (req, res) => {
  try {
    // Return reminders where the current user's email is in the recipient list and reminder is active
    const reminders = await PSReminder.find({
      recipientEmails: req.user.email,
      status: 'active'
    }).lean();

    for (let r of reminders) {
      r.schedules = await ReminderSchedule.find({ reminderId: r._id });
    }

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get public reminders (Returns empty to prevent UI crashes)
// @route   GET /api/capsules/public
// @access  Public
exports.getPublicCapsules = async (req, res) => {
  res.status(200).json({
    success: true,
    count: 0,
    data: []
  });
};

// @desc    Upload media (Deprecated for PS Reminders)
// @route   POST /api/capsules/:id/upload
// @access  Private
exports.uploadMedia = async (req, res) => {
  res.status(400).json({ message: 'Media uploads are not supported in PS Reminder System' });
};

// @desc    Trigger manual delivery check
// @route   POST /api/capsules/trigger-delivery
// @access  Public (Protected by API token)
exports.triggerDelivery = async (req, res) => {
  try {
    const token = req.headers['x-scheduler-token'];
    const expectedToken = process.env.SCHEDULER_TOKEN;

    if (!expectedToken) {
      return res.status(500).json({ message: 'Scheduler token not configured on server' });
    }

    if (token !== expectedToken) {
      return res.status(401).json({ message: 'Unauthorized trigger' });
    }

    console.log('Filing reminder execution check triggered via API...');
    const { scanAndSendReminders } = require('../utils/scheduler');
    await scanAndSendReminders();

    res.status(200).json({
      success: true,
      message: 'Reminder schedule check completed'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete all reminders for current user
// @route   DELETE /api/capsules
// @access  Private
exports.deleteAllCapsules = async (req, res) => {
  try {
    const reminders = await PSReminder.find({ creator: req.user.id });
    const reminderIds = reminders.map(r => r._id);

    await ReminderSchedule.deleteMany({ reminderId: { $in: reminderIds } });
    await PSReminder.deleteMany({ creator: req.user.id });

    res.status(200).json({
      success: true,
      message: 'All your PS Reminders have been deleted successfully',
      data: {}
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get dashboard analytics metrics and charts
// @route   GET /api/capsules/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const reminders = await PSReminder.find({ creator: req.user.id }).lean();
    const reminderIds = reminders.map(r => r._id);

    // Get all schedules for these reminders
    const schedules = await ReminderSchedule.find({ reminderId: { $in: reminderIds } }).populate('reminderId');

    const now = new Date();

    // 1. Calculate Metrics
    const totalReminders = reminders.length;
    
    // Completed Reminders: count of schedules where emailSent is true
    const completedReminders = schedules.filter(s => s.emailSent).length;

    // Total Emails Sent: Sum of recipientEmails for each sent schedule
    let totalEmailsSent = 0;
    schedules.forEach(s => {
      if (s.emailSent && s.reminderId) {
        totalEmailsSent += s.reminderId.recipientEmails.length;
      }
    });

    // Start & End of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Upcoming This Month: scheduled in current calendar month and not sent
    const upcomingThisMonth = schedules.filter(s => {
      return !s.emailSent && s.scheduledDate >= startOfMonth && s.scheduledDate <= endOfMonth;
    }).length;

    // Due Within 7 Days: scheduled within next 7 days and not sent
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueWithin7Days = schedules.filter(s => {
      return !s.emailSent && s.scheduledDate >= now && s.scheduledDate <= sevenDaysFromNow;
    }).length;

    // 2. Upcoming PS Reminders List for table
    const upcomingList = [];
    schedules.forEach(s => {
      if (!s.emailSent && s.reminderId) {
        const timeDiff = s.scheduledDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let status = 'upcoming';
        if (s.scheduledDate < now) {
          status = 'overdue';
        }

        upcomingList.push({
          _id: s._id,
          reminderId: s.reminderId._id,
          title: s.reminderId.title,
          recipients: s.reminderId.recipientEmails.join(', '),
          nextReminderDate: s.scheduledDate,
          daysRemaining,
          status
        });
      }
    });

    // Sort upcoming by date ascending
    upcomingList.sort((a, b) => a.nextReminderDate - b.nextReminderDate);

    // 3. Monthly Reminder Count (Bar chart data) for current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCount = months.map((m, index) => {
      const count = schedules.filter(s => {
        const d = new Date(s.scheduledDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === index;
      }).length;
      return { month: m, count };
    });

    // 4. Reminder Status Distribution (Pie chart data)
    let statusUpcoming = 0;
    let statusCompleted = 0;
    let statusOverdue = 0;

    schedules.forEach(s => {
      if (s.emailSent) {
        statusCompleted++;
      } else if (s.scheduledDate < now) {
        statusOverdue++;
      } else {
        statusUpcoming++;
      }
    });

    const statusDistribution = [
      { name: 'Upcoming', value: statusUpcoming },
      { name: 'Completed', value: statusCompleted },
      { name: 'Overdue', value: statusOverdue }
    ];

    // 5. Emails Sent Over Time (Line chart data)
    // We group by month of the current year for email activity
    const emailsSentOverTime = months.map((m, index) => {
      let count = 0;
      schedules.forEach(s => {
        const d = new Date(s.scheduledDate);
        if (s.emailSent && d.getFullYear() === now.getFullYear() && d.getMonth() === index && s.reminderId) {
          count += s.reminderId.recipientEmails.length;
        }
      });
      return { month: m, count };
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalReminders,
          upcomingThisMonth,
          dueWithin7Days,
          completedReminders,
          totalEmailsSent
        },
        upcomingReminders: upcomingList,
        charts: {
          monthlyCount,
          statusDistribution,
          emailsSentOverTime
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
