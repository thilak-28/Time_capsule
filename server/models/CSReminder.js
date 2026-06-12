const mongoose = require('mongoose');

const csReminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description/details'],
  },
  csFilingDate: {
    type: Date,
    required: [true, 'Please add a CS filing date'],
  },
  recipientEmails: [
    {
      type: String,
      required: [true, 'Please add at least one recipient email'],
      trim: true,
    }
  ],
  selectedIntervals: [
    {
      type: Number, // days: 5, 10, 15, 20
    }
  ],
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CSReminder', csReminderSchema);
