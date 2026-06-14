const User = require('../models/User');
const PSReminder = require('../models/PSReminder');
const CSReminder = require('../models/CSReminder');
const ReminderSchedule = require('../models/ReminderSchedule');
const CSReminderSchedule = require('../models/CSReminderSchedule');
const bcrypt = require('bcryptjs');

// @desc    One-time admin account setup
// @route   POST /api/admin/setup
// @access  Public (only works if no admin exists)
exports.setupAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const { name, email, password } = req.body;
    const admin = await User.create({
      name,
      email,
      password,
      isAdmin: true,
      isVerified: true,
    });
    res.status(201).json({ success: true, message: `Admin '${admin.email}' created successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all non-admin users with reminder counts
// @route   GET /api/admin/users
// @access  Admin only
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password').lean();

    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const psCount = await PSReminder.countDocuments({ creator: user._id });
      const csCount = await CSReminder.countDocuments({ creator: user._id });
      const psSentCount = await ReminderSchedule.countDocuments({ emailSent: true });
      return { ...user, psCount, csCount, psSentCount };
    }));

    res.status(200).json({ success: true, data: usersWithCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single user's full dashboard data
// @route   GET /api/admin/users/:id
// @access  Admin only
exports.getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // PS Reminders with schedules
    const psReminders = await PSReminder.find({ creator: req.params.id }).lean();
    for (let r of psReminders) {
      r.schedules = await ReminderSchedule.find({ reminderId: r._id }).lean();
    }

    // CS Reminders with schedules
    const csReminders = await CSReminder.find({ creator: req.params.id }).lean();
    for (let r of csReminders) {
      r.schedules = await CSReminderSchedule.find({ reminderId: r._id }).lean();
    }

    // Summary stats
    const now = new Date();
    const allPSSchedules = psReminders.flatMap(r => r.schedules || []);
    const allCSSchedules = csReminders.flatMap(r => r.schedules || []);
    const allSchedules = [...allPSSchedules, ...allCSSchedules];

    const totalEmailsSent = allSchedules.filter(s => s.emailSent).length;
    const overdue = allSchedules.filter(s => !s.emailSent && new Date(s.scheduledDate) < now).length;
    const upcoming = allSchedules.filter(s => !s.emailSent && new Date(s.scheduledDate) >= now).length;

    res.status(200).json({
      success: true,
      data: {
        user,
        psReminders,
        csReminders,
        stats: {
          totalPS: psReminders.length,
          totalCS: csReminders.length,
          totalEmailsSent,
          overdue,
          upcoming,
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
