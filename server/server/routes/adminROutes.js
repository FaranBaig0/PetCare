const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateToken, isAdmin);

router.get(
    '/products',
    adminController.getAllProducts
  );
  
  router.post(

    '/products',
  
    upload.single('image'),
  
    adminController.addProduct
  );
  router.put(
    '/products/:id',
    upload.single('image'),
    adminController.updateProduct
  );
router.delete('/products/:id', adminController.deleteProduct);

router.get('/doctor-requests', adminController.getPendingDoctorRequests);
router.put('/doctor-requests/:id', adminController.processDoctorRequest);

router.get('/users', adminController.getAllUsers);
router.delete(
    '/users/:id',
    adminController.deleteUser
  );
router.put('/users/:id', adminController.updateUser);
router.get('/logs', adminController.getSystemLogs);
router.get(
    '/dashboard-stats',
    adminController.getDashboardStats
  );
  router.get(
    '/appointments',
    adminController.getAllAppointments
  );
  
  router.delete(
    '/appointments/:id',
    adminController.deleteAppointment
  );

// ── Doctor management ──
router.get('/doctors', adminController.getAllDoctors);
router.put(
  '/doctors/:id',
  upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'degree_pic', maxCount: 1 },
    { name: 'license_pic', maxCount: 1 }
  ]),
  adminController.updateDoctor
);

module.exports = router;