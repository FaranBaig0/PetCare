const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/symptom-checker', aiController.checkSymptoms);
router.post('/chatbot', aiController.chatWithBot);
router.get('/chatbot/history', aiController.getChatHistory);

module.exports = router;