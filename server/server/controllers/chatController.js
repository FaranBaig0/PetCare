const { ChatMessage, Appointment } = require('../models');
const { Op } = require('sequelize');

// GET /api/chat/:appointmentId — fetch message history
exports.getMessages = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const user_id = req.user.user_id;

        // Only allow participants (client or doctor of this appointment)
        const appt = await Appointment.findOne({
            where: {
                appointment_id: appointmentId,
                [Op.or]: [{ client_id: user_id }, { doctor_id: user_id }],
            },
        });
        if (!appt) return res.status(403).json({ message: 'Access denied to this chat.' });

        const messages = await ChatMessage.findAll({
            where: { appointment_id: appointmentId },
            order: [['created_at', 'ASC']],
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching messages.' });
    }
};

// POST /api/chat/:appointmentId — send message
exports.sendMessage = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { message } = req.body;
        const user_id = req.user.user_id;
        const sender_role = req.user.role; // 'client' or 'doctor'

        // Only allow participants (client or doctor of this appointment)
        const appt = await Appointment.findOne({
            where: {
                appointment_id: appointmentId,
                [Op.or]: [{ client_id: user_id }, { doctor_id: user_id }],
            },
        });
        if (!appt) return res.status(403).json({ message: 'Access denied to this chat.' });

        const saved = await ChatMessage.create({
            appointment_id: appointmentId,
            sender_id:      user_id,
            sender_role:    sender_role === 'doctor' ? 'doctor' : 'client',
            message,
        });

        // Broadcast to everyone in the room via Socket.io
        const io = req.app.get('socketio');
        const roomName = `room_${appointmentId}`;
        console.log(`[Socket] Broadcasting message to ${roomName}. io is defined: ${!!io}`);
        if (io) {
            io.to(roomName).emit('receive_message', {
                id:             saved.id,
                appointment_id: saved.appointment_id,
                sender_id:      saved.sender_id,
                sender_role:    saved.sender_role,
                message:        saved.message,
                created_at:     saved.created_at,
            });
            console.log(`[Socket] Broadcast complete for message ID: ${saved.id}`);
        } else {
            console.warn('[Socket] WARNING: Socket.io instance (io) not found in app settings!');
        }

        res.status(201).json(saved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message.' });
    }
};

