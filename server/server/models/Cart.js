const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {

    cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    user_id: {
        type: DataTypes.INTEGER,
    },

    product_id: {
        type: DataTypes.INTEGER,
    },

    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },

}, {

    tableName: 'cart',

    timestamps: true,

    createdAt: 'created_at',

    updatedAt: false,
});

module.exports = Cart;