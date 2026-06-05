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
} = require('../controllers/capsuleController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/public', getPublicCapsules);
router.post('/trigger-delivery', triggerDelivery);

// Protected routes
router.use(protect);

router.route('/')
  .get(getCapsules)
  .post(createCapsule);

router.get('/inbox', getInbox);

router.route('/:id')
  .get(getCapsule)
  .put(updateCapsule)
  .delete(deleteCapsule);

router.post('/:id/seal', sealCapsule);

// File upload — up to 5 files at once
router.post('/:id/upload', upload.array('media', 5), uploadMedia);

module.exports = router;
