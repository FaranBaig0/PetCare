const express = require('express');
const router  = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/:appointmentId', chatController.getMessages);
router.post('/:appointmentId', chatController.sendMessage);

module.exports = router;
