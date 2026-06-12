const express = require('express');
const {
  createCSReminder,
  getCSReminders,
  getCSReminder,
  updateCSReminder,
  deleteCSReminder,
  deleteAllCSReminders,
  sealCSReminder,
  getCSInbox,
  getCSAnalytics,
} = require('../controllers/csReminderController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.use(protect);

// Analytics and inbox must be before /:id
router.get('/analytics', getCSAnalytics);
router.get('/inbox', getCSInbox);

router.route('/')
  .get(getCSReminders)
  .post(createCSReminder)
  .delete(deleteAllCSReminders);

router.route('/:id')
  .get(getCSReminder)
  .put(updateCSReminder)
  .delete(deleteCSReminder);

router.post('/:id/seal', sealCSReminder);

module.exports = router;
