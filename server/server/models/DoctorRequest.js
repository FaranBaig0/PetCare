const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorRequest = sequelize.define('DoctorRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    specialization: { type: DataTypes.STRING(100), allowNull: false },
    experience: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT },
    license_number: { type: DataTypes.STRING(100), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    profile_pic: { type: DataTypes.STRING(255) },
    degree_pic: { type: DataTypes.STRING(255) },
    license_pic: { type: DataTypes.STRING(255) }
}, {
    tableName: 'doctor_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = DoctorRequest;