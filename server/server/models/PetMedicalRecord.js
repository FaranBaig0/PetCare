const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PetMedicalRecord = sequelize.define('PetMedicalRecord', {
    record_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pet_id: { type: DataTypes.INTEGER, allowNull: false },
    diagnosis: { type: DataTypes.TEXT },
    treatment: { type: DataTypes.TEXT },
    vaccination_details: { type: DataTypes.TEXT },
    record_date: { type: DataTypes.DATEONLY }
}, {
    tableName: 'pet_medical_records',
    timestamps: false
});

module.exports = PetMedicalRecord;