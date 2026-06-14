const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { setupAdmin, getAllUsers, getUserDashboard } = require('../controllers/adminController');

// One-time setup (public - only works if no admin exists)
router.post('/setup', setupAdmin);

// Protected admin routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserDashboard);

module.exports = router;
