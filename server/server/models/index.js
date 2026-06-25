const sequelize = require('../config/database');

const User = require('./User');
const Pet = require('./Pet');
const Doctor = require('./Doctor');
const DoctorRequest = require('./DoctorRequest');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const PetMedicalRecord = require('./PetMedicalRecord');
const ProductCategory = require('./ProductCategory');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const SymptomCheck = require('./SymptomCheck');
const ChatbotLog = require('./ChatbotLog');
const SystemLog = require('./SystemLog');
const Cart = require('./Cart');


User.hasMany(Pet, { foreignKey: 'owner_id', as: 'pets', onDelete: 'CASCADE' });
Pet.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.hasOne(Doctor, { foreignKey: 'doctor_id', as: 'doctorProfile', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'doctor_id', as: 'user' });

Pet.hasMany(Appointment, { foreignKey: 'pet_id' });
Appointment.belongsTo(Pet, { foreignKey: 'pet_id' });

User.hasMany(Appointment, { foreignKey: 'client_id', as: 'clientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

Appointment.hasOne(Prescription, { foreignKey: 'appointment_id' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id' });

User.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'issuedPrescriptions' });
Prescription.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

Pet.hasMany(PetMedicalRecord, { foreignKey: 'pet_id', onDelete: 'CASCADE' });
PetMedicalRecord.belongsTo(Pet, { foreignKey: 'pet_id' });

ProductCategory.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(ProductCategory, { foreignKey: 'category_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Cart, { foreignKey: 'user_id' });

Cart.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(Cart, { foreignKey: 'product_id' });

Cart.belongsTo(Product, { foreignKey: 'product_id' });

Pet.hasMany(SymptomCheck, { foreignKey: 'pet_id' });
SymptomCheck.belongsTo(Pet, { foreignKey: 'pet_id' });

User.hasMany(ChatbotLog, { foreignKey: 'user_id' });
ChatbotLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(SystemLog, { foreignKey: 'admin_id' });
SystemLog.belongsTo(User, { foreignKey: 'admin_id' });

User.hasMany(DoctorRequest, { foreignKey: 'user_id' });
DoctorRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


module.exports = {
    sequelize,
    User,
    Pet,
    Doctor,
    DoctorRequest,
    Appointment,
    Prescription,
    PetMedicalRecord,
    ProductCategory,
    Product,
    Cart,
    Order,
    OrderItem,
    SymptomCheck,
    ChatbotLog,
    SystemLog
};