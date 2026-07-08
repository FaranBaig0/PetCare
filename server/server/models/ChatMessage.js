const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appointment_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_id:      { type: DataTypes.INTEGER, allowNull: false },
    sender_role:    { type: DataTypes.ENUM('client', 'doctor'), allowNull: false },
    message:        { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName:  'chat_messages',
    timestamps: true,
    createdAt:  'created_at',
    updatedAt:  false,
});

module.exports = ChatMessage;
