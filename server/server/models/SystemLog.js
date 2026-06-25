const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemLog = sequelize.define('SystemLog', {
    log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    admin_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.TEXT },
    log_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'system_logs',
    timestamps: false
});

module.exports = SystemLog;