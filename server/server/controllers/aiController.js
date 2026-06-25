const { SymptomCheck, ChatbotLog, Pet } = require('../models');
// const axios = require('axios'); // You will need this later to call your Python API

// --- 1. AI Symptom Checker ---
exports.checkSymptoms = async (req, res) => {
    try {
        const client_id = req.user.user_id;
        const { pet_id, symptoms } = req.body;

        if (!symptoms) {
            return res.status(400).json({ message: 'Symptoms are required.' });
        }

        // Verify the pet belongs to the logged-in client
        const pet = await Pet.findOne({ where: { pet_id, owner_id: client_id } });
        if (!pet) {
            return res.status(403).json({ message: 'Unauthorized. Pet not found.' });
        }

        // ==========================================
        // TODO: Call your actual Python AI Microservice here
        // ==========================================
        // const aiResponse = await axios.post('http://localhost:8000/predict-symptom', { symptoms });
        // const ai_result = aiResponse.data.diagnosis;
        // const urgency_level = aiResponse.data.urgency; // 'low', 'medium', or 'high'

        // MOCK AI LOGIC (Replace this when Python is ready)
        let ai_result = "Possible mild gastrointestinal upset.";
        let urgency_level = "low";
        
        if (symptoms.toLowerCase().includes("vomiting") && symptoms.toLowerCase().includes("blood")) {
            ai_result = "Potential severe internal issue or toxicity. Seek emergency vet care immediately.";
            urgency_level = "high";
        }

        const symptomLog = await SymptomCheck.create({
            pet_id,
            symptoms,
            ai_result,
            urgency_level
        });

        res.status(200).json({ 
            message: 'Symptoms analyzed successfully.',
            diagnosis: ai_result,
            urgency: urgency_level,
            log_id: symptomLog.check_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error processing symptoms.' });
    }
};

exports.chatWithBot = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        // ==========================================
        // TODO: Call your actual Python NLP Chatbot here
        // ==========================================
        // const aiResponse = await axios.post('http://localhost:8000/chat', { user_id, message });
        // const bot_response = aiResponse.data.reply;

        // MOCK BOT LOGIC (Replace this when Python is ready)
        let bot_response = "I am the PetCare+ virtual assistant. How can I help you and your pet today?";
        if (message.toLowerCase().includes("appointment")) {
            bot_response = "You can book an appointment by navigating to the 'Doctors' tab on your dashboard.";
        }

        const chatLog = await ChatbotLog.create({
            user_id,
            user_message: message,
            bot_response
        });

        res.status(200).json({
            reply: bot_response,
            log_id: chatLog.chat_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error processing chatbot message.' });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const history = await ChatbotLog.findAll({
            where: { user_id },
            order: [['created_at', 'ASC']] 
        });

        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching chat history.' });
    }
};