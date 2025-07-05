const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  completeOnboarding
} = require('../controllers/profileController');

// Apply authentication middleware to all routes
router.use(authenticateUser);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/complete-onboarding', completeOnboarding);

module.exports = router;