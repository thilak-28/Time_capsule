const CSReminder = require('../models/CSReminder');
const CSReminderSchedule = require('../models/CSReminderSchedule');
const Notification = require('../models/Notification');
const { scanAndSendCSReminders } = require('../utils/scheduler');

// Helper to generate day-based schedules for a CS reminder
const generateSchedules = async (reminder) => {
  await CSReminderSchedule.deleteMany({ reminderId: reminder._id });

  const schedules = [];
  const filingDate = new Date(reminder.csFilingDate);

  for (const intervalDays of reminder.selectedIntervals) {
    const scheduledDate = new Date(filingDate);
    scheduledDate.setDate(scheduledDate.getDate() + intervalDays);

    schedules.push({
      reminderId: reminder._id,
      intervalDays,
      scheduledDate,
      status: 'upcoming',
      emailSent: false,
    });
  }

  if (schedules.length > 0) {
    await CSReminderSchedule.insertMany(schedules);
  }
};

// @desc    Create a new CS Reminder
// @route   POST /api/cs-reminders
// @access  Private
exports.createCSReminder = async (req, res) => {
  try {
    const { title, description, csFilingDate, recipientEmails, selectedIntervals, status } = req.body;

    const reminder = await CSReminder.create({
      title,
      description,
      csFilingDate,
      recipientEmails,
      selectedIntervals,
      status: status || 'draft',
      creator: req.user.id,
    });

    if (reminder.status === 'active') {
      await generateSchedules(reminder);
      // Fire-and-forget: immediately send any overdue/today schedules
      scanAndSendCSReminders().catch(err => console.error('Immediate CS scan error:', err.message));
    }

    res.status(201).json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all CS Reminders for current user
// @route   GET /api/cs-reminders
// @access  Private
exports.getCSReminders = async (req, res) => {
  try {
    const reminders = await CSReminder.find({ creator: req.user.id }).lean();

    for (let r of reminders) {
      r.schedules = await CSReminderSchedule.find({ reminderId: r._id });
    }

    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single CS Reminder
// @route   GET /api/cs-reminders/:id
// @access  Private
exports.getCSReminder = async (req, res) => {
  try {
    const reminder = await CSReminder.findById(req.params.id).lean();

    if (!reminder) {
      return res.status(404).json({ message: 'CS Reminder not found' });
    }

    const isCreator = reminder.creator.toString() === req.user.id;
    const isRecipient = reminder.recipientEmails.includes(req.user.email);

    if (!isCreator && !isRecipient) {
      return res.status(401).json({ message: 'Not authorized to view this reminder' });
    }

    reminder.schedules = await CSReminderSchedule.find({ reminderId: reminder._id });

    res.status(200).json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update CS Reminder
// @route   PUT /api/cs-reminders/:id
// @access  Private
exports.updateCSReminder = async (req, res) => {
  try {
    let reminder = await CSReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'CS Reminder not found' });
    }

    if (reminder.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this reminder' });
    }

    const { title, description, csFilingDate, recipientEmails, selectedIntervals, status } = req.body;

    reminder.title = title || reminder.title;
    reminder.description = description !== undefined ? description : reminder.description;
    reminder.csFilingDate = csFilingDate || reminder.csFilingDate;
    reminder.recipientEmails = recipientEmails || reminder.recipientEmails;
    reminder.selectedIntervals = selectedIntervals || reminder.selectedIntervals;
    if (status) reminder.status = status;

    await reminder.save();

    if (reminder.status === 'active') {
      await generateSchedules(reminder);
    }

    res.status(200).json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete CS Reminder
// @route   DELETE /api/cs-reminders/:id
// @access  Private
exports.deleteCSReminder = async (req, res) => {
  try {
    const reminder = await CSReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'CS Reminder not found' });
    }

    if (reminder.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this reminder' });
    }

    await CSReminderSchedule.deleteMany({ reminderId: reminder._id });
    await reminder.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete all CS Reminders for current user
// @route   DELETE /api/cs-reminders
// @access  Private
exports.deleteAllCSReminders = async (req, res) => {
  try {
    const reminders = await CSReminder.find({ creator: req.user.id });
    const reminderIds = reminders.map(r => r._id);

    await CSReminderSchedule.deleteMany({ reminderId: { $in: reminderIds } });
    await CSReminder.deleteMany({ creator: req.user.id });

    res.status(200).json({
      success: true,
      message: 'All your CS Reminders have been deleted successfully',
      data: {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Seal/Activate a CS Reminder
// @route   POST /api/cs-reminders/:id/seal
// @access  Private
exports.sealCSReminder = async (req, res) => {
  try {
    let reminder = await CSReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'CS Reminder not found' });
    }

    if (reminder.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    reminder.status = 'active';
    await reminder.save();
    await generateSchedules(reminder);

    res.status(200).json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get received CS reminders (inbox)
// @route   GET /api/cs-reminders/inbox
// @access  Private
exports.getCSInbox = async (req, res) => {
  try {
    const reminders = await CSReminder.find({
      recipientEmails: req.user.email,
      status: 'active',
    }).lean();

    for (let r of reminders) {
      r.schedules = await CSReminderSchedule.find({ reminderId: r._id });
    }

    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get CS dashboard analytics
// @route   GET /api/cs-reminders/analytics
// @access  Private
exports.getCSAnalytics = async (req, res) => {
  try {
    const reminders = await CSReminder.find({ creator: req.user.id }).lean();
    const reminderIds = reminders.map(r => r._id);

    const schedules = await CSReminderSchedule.find({ reminderId: { $in: reminderIds } }).populate('reminderId');

    const now = new Date();

    const totalReminders = reminders.length;
    const completedReminders = schedules.filter(s => s.emailSent).length;

    let totalEmailsSent = 0;
    schedules.forEach(s => {
      if (s.emailSent && s.reminderId) {
        totalEmailsSent += s.reminderId.recipientEmails.length;
      }
    });

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const upcomingThisMonth = schedules.filter(s =>
      !s.emailSent && s.scheduledDate >= startOfMonth && s.scheduledDate <= endOfMonth
    ).length;

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueWithin7Days = schedules.filter(s =>
      !s.emailSent && s.scheduledDate >= now && s.scheduledDate <= sevenDaysFromNow
    ).length;

    // Upcoming list
    const upcomingList = [];
    schedules.forEach(s => {
      if (!s.emailSent && s.reminderId) {
        const timeDiff = s.scheduledDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const status = s.scheduledDate < now ? 'overdue' : 'upcoming';

        upcomingList.push({
          _id: s._id,
          reminderId: s.reminderId._id,
          title: s.reminderId.title,
          recipients: s.reminderId.recipientEmails.join(', '),
          nextReminderDate: s.scheduledDate,
          intervalDays: s.intervalDays,
          daysRemaining,
          status,
        });
      }
    });

    upcomingList.sort((a, b) => a.nextReminderDate - b.nextReminderDate);

    // Monthly count chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCount = months.map((m, index) => {
      const count = schedules.filter(s => {
        const d = new Date(s.scheduledDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === index;
      }).length;
      return { month: m, count };
    });

    // Status distribution
    let statusUpcoming = 0, statusCompleted = 0, statusOverdue = 0;
    schedules.forEach(s => {
      if (s.emailSent) statusCompleted++;
      else if (s.scheduledDate < now) statusOverdue++;
      else statusUpcoming++;
    });

    const statusDistribution = [
      { name: 'Upcoming', value: statusUpcoming },
      { name: 'Completed', value: statusCompleted },
      { name: 'Overdue', value: statusOverdue },
    ];

    // Emails sent over time
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
        metrics: { totalReminders, upcomingThisMonth, dueWithin7Days, completedReminders, totalEmailsSent },
        upcomingReminders: upcomingList,
        charts: { monthlyCount, statusDistribution, emailsSentOverTime },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
