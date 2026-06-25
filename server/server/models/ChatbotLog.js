const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatbotLog = sequelize.define('ChatbotLog', {
    chat_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    user_message: { type: DataTypes.TEXT },
    bot_response: { type: DataTypes.TEXT }
}, {
    tableName: 'chatbot_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ChatbotLog;