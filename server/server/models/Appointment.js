const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    appointment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pet_id: { type: DataTypes.INTEGER },
    client_id: { type: DataTypes.INTEGER },
    doctor_id: { type: DataTypes.INTEGER },
    appointment_date: { type: DataTypes.DATEONLY },
    appointment_time: { type: DataTypes.TIME },
    issue: { type: DataTypes.TEXT },

urgency: {
  type: DataTypes.ENUM(
    'low',
    'medium',
    'high'
  ),
},

image_path: {
  type: DataTypes.STRING,
},

    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'), defaultValue: 'pending' }
}, {
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Appointment;