const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SymptomCheck = sequelize.define('SymptomCheck', {
    check_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pet_id: { type: DataTypes.INTEGER },
    symptoms: { type: DataTypes.TEXT },
    ai_result: { type: DataTypes.TEXT },
    urgency_level: { type: DataTypes.ENUM('low', 'medium', 'high') }
}, {
    tableName: 'symptom_checks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = SymptomCheck;