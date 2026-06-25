const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('client', 'doctor', 'admin'),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    reset_otp: { 
        type: DataTypes.STRING(10), 
        allowNull: true 
    },
    otp_expiry: { 
        type: DataTypes.DATE, 
        allowNull: true 
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false 
});

module.exports = User;