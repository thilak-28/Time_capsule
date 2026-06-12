const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['capsule_received', 'capsule_delivered', 'reminder'],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  capsuleId: {
    type: mongoose.Schema.ObjectId,
    ref: 'PSReminder',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
