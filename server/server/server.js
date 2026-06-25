const express = require('express');
let app= express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    '/uploads',
    express.static('uploads')
  );

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const profileRoutes =
    require('./routes/profileRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const adminRoutes = require('./routes/adminROutes');
const aiRoutes = require('./routes/aiRoutes');




app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use(
    '/api/profile',
    profileRoutes
  );
app.use('/api/appointments', appointmentRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

let port= process.env.PORT;
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})