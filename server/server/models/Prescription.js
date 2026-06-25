const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
    prescription_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appointment_id: { type: DataTypes.INTEGER },
    doctor_id: { type: DataTypes.INTEGER },
    notes: { type: DataTypes.TEXT },
    file_path: { type: DataTypes.STRING(255) }
}, {
    tableName: 'prescriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Prescription;
