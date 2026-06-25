const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    total_amount: { type: DataTypes.DECIMAL(10, 2) },
    order_status: { type: DataTypes.ENUM('placed', 'cancelled', 'completed'), defaultValue: 'placed' },
    address: {
        type: DataTypes.TEXT,
    },
    
    phone: {
        type: DataTypes.STRING,
    },
    
    payment_method: {
        type: DataTypes.STRING,
    },
    
    tracking_number: {
        type: DataTypes.STRING,
    },
    
    estimated_delivery: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Order;
