const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authenticateToken, authController.getMe);

router.post(
    '/doctor-apply', 

    upload.fields([
        { name: 'profile_pic', maxCount: 1 },
        { name: 'degree_pic', maxCount: 1 },
        { name: 'license_pic', maxCount: 1 }
    ]), 
    authController.doctorApply
);
router.get(
    '/doctor-requests',
    authController.getDoctorRequests
);

router.put(
    '/approve-doctor/:id',
    authController.approveDoctor
);

router.delete(
    '/reject-doctor/:id',
    authController.rejectDoctor
);

module.exports = router;