const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const multer = require('multer');
const { authenticateToken } = require('../middleware/authMiddleware');


router.use(authenticateToken); 
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
  
      cb(null, 'uploads/');
    },
  
    filename: (req, file, cb) => {
  
      cb(
        null,
        Date.now() + '-' + file.originalname
      );
    },
  });
  
  const upload = multer({ storage });

router.post('/', upload.single('pet_image'), petController.createPet);                   
router.get('/', petController.getMyPets);                    
router.get('/:id', petController.getPetById);                
router.put(

    '/:id',
  
    upload.single('pet_image'),
  
    petController.updatePet,
  );               
router.delete('/:id', petController.deletePet);            
router.get('/:id/medical-records', petController.getPetMedicalRecords); 

module.exports = router;