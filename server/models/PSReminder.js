const mongoose = require('mongoose');

const psReminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description/details'],
  },
  psFilingDate: {
    type: Date,
    required: [true, 'Please add a filing date'],
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
      type: Number,
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

module.exports = mongoose.model('PSReminder', psReminderSchema);
