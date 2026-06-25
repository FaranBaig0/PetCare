const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// 🔥 PUT /doctor FIRST
router.get(
    '/doctor',
    profileController.getDoctorProfile
);

router.get(
    '/',
    profileController.getProfile
);

router.put(
    '/',
    profileController.updateProfile
);

module.exports = router;