const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
// Public endpoints
router.get('/doctors', appointmentController.getAllDoctors);
router.get('/booked-slots', appointmentController.getBookedSlots);

// Authenticated endpoints below
router.use(authenticateToken);

router.post('/', upload.array('pet_images', 5), appointmentController.bookAppointment);
router.get('/client', appointmentController.getClientAppointments);

router.get('/doctor', appointmentController.getDoctorAppointments);
router.get('/prescriptions/all', appointmentController.getAllPrescriptions);
router.put('/:id/status', appointmentController.updateAppointmentStatus);
router.get(
  '/:id/prescriptions',
  appointmentController.getPrescription
);
router.post(
    '/:id/prescriptions', 
    upload.single('prescription_file'), 
    appointmentController.uploadPrescription
);
router.delete(
    '/:id',
    appointmentController.deleteAppointment
  );
router.get(
    '/pet/:petId/history',
    appointmentController.getPetMedicalHistory
  );

module.exports = router;