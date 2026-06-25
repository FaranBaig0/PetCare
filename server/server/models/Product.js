const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: DataTypes.INTEGER },
    product_name: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2) },
    stock: { type: DataTypes.INTEGER },
    image_url: {type: DataTypes.STRING},
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Product;