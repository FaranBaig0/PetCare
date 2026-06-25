const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pet = sequelize.define('Pet', {
    pet_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pet_name: {
        type: DataTypes.STRING(50)
    },
    species: {
        type: DataTypes.STRING(50)
    },
    breed: {
        type: DataTypes.STRING(50)
    },
    age: {
        type: DataTypes.INTEGER
    },
    gender: {
        type: DataTypes.ENUM('male', 'female')
    },
    weight: {
        type: DataTypes.DECIMAL(5, 2)
    },
    image_url: {
        type: DataTypes.STRING(255)
    },
}, {
    tableName: 'pets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Pet;