const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
    doctor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    specialization: { 
        type: DataTypes.STRING(100) 
    },
    license_number: {
         type: DataTypes.STRING(50),
          unique: true
         },
    experience_years: { 
        type: DataTypes.INTEGER 
    },
    availability: { 
        type: DataTypes.TEXT
     },
    profile_pic: { 
        type: DataTypes.STRING(255)
     },
    degree_pic: { 
        type: DataTypes.STRING(255) 
    },
    license_pic: { 
        type: DataTypes.STRING(255) 
    }
}, {
    tableName: 'doctors',
    timestamps: false
});

module.exports = Doctor;