const mongoose = require('mongoose');

const reminderScheduleSchema = new mongoose.Schema({
  reminderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'PSReminder',
    required: true,
  },
  intervalMonths: {
    type: Number,
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'overdue'],
    default: 'upcoming',
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
  },
});

module.exports = mongoose.model('ReminderSchedule', reminderScheduleSchema);
