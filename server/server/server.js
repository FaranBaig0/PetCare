const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

// ── Socket.io ────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});
app.set('socketio', io);

const { ChatMessage } = require('./models');

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Client/doctor joins an appointment room
    socket.on('join_room', ({ appointmentId }) => {
        const room = `room_${appointmentId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined ${room}`);
    });

    // New message sent
    socket.on('send_message', async ({ appointmentId, senderId, senderRole, message }) => {
        try {
            const saved = await ChatMessage.create({
                appointment_id: appointmentId,
                sender_id:      senderId,
                sender_role:    senderRole,
                message,
            });
            // Broadcast to everyone in the room (including sender)
            io.to(`room_${appointmentId}`).emit('receive_message', {
                id:             saved.id,
                appointment_id: saved.appointment_id,
                sender_id:      saved.sender_id,
                sender_role:    saved.sender_role,
                message:        saved.message,
                created_at:     saved.created_at,
            });
        } catch (err) {
            console.error('send_message error:', err);
        }
    });

    // Call signaling
    socket.on('call_user', ({ appointmentId, callerName }) => {
        socket.to(`room_${appointmentId}`).emit('incoming_call', { appointmentId, callerName });
    });

    socket.on('end_call', ({ appointmentId }) => {
        socket.to(`room_${appointmentId}`).emit('call_ended');
    });

    socket.on('join_call', ({ appointmentId }) => {
        socket.appointmentIdInCall = appointmentId;
    });

    socket.on('leave_call', () => {
        socket.appointmentIdInCall = null;
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        if (socket.appointmentIdInCall) {
            console.log(`Socket ${socket.id} disconnected abruptly during call. Ending call for room_${socket.appointmentIdInCall}`);
            io.to(`room_${socket.appointmentIdInCall}`).emit('call_ended');
            socket.appointmentIdInCall = null;
        }
    });
});

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ── Routes ───────────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const petRoutes         = require('./routes/petRoutes');
const profileRoutes     = require('./routes/profileRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const adminRoutes       = require('./routes/adminROutes');
const aiRoutes          = require('./routes/aiRoutes');
const chatRoutes        = require('./routes/chatRoutes');
const agoraRoutes       = require('./routes/agoraRoutes');

app.use('/api/auth',         authRoutes);
app.use('/api/pets',         petRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/marketplace',  marketplaceRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/agora',        agoraRoutes);

// ── Start ────────────────────────────────────────────────────
const { sequelize } = require('./models');
const port = process.env.PORT || 5000;

sequelize.sync({ alter: true })
    .then(() => {
        server.listen(port, '0.0.0.0', () => {
            console.log(`Server + Socket.io running on http://0.0.0.0:${port}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });
