const express = require('express');
const {
  createCapsule,
  getCapsules,
  getCapsule,
  updateCapsule,
  deleteCapsule,
  sealCapsule,
  getInbox,
  getPublicCapsules,
  uploadMedia,
  triggerDelivery,
  deleteAllCapsules,
  getAnalytics,
} = require('../controllers/psReminderController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/public', getPublicCapsules);
router.post('/trigger-delivery', triggerDelivery);

// Protected routes
router.use(protect);

// Analytics route needs to be defined BEFORE /:id
router.get('/analytics', getAnalytics);
router.get('/inbox', getInbox);

router.route('/')
  .get(getCapsules)
  .post(createCapsule)
  .delete(deleteAllCapsules);

router.route('/:id')
  .get(getCapsule)
  .put(updateCapsule)
  .delete(deleteCapsule);

router.post('/:id/seal', sealCapsule);

module.exports = router;
