const { Product, ProductCategory, User, DoctorRequest, Doctor, SystemLog, Appointment, Prescription, sequelize, Pet } = require('../models');
const Cart = require('../models/Cart');
const OrderItem = require('../models/OrderItem');
exports.getAllProducts =
async (req, res) => {

    try {

        const products =
            await Product.findAll({

            include: [
                {
                    model:
                    ProductCategory,
                }
            ],

            order: [
                ['created_at', 'DESC']
            ]
        });

        res.json(products);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error fetching products.'
        });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { category_id, product_name, description, price, stock } = req.body;
        console.log(req.file);
        const image_url =
        req.file
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        : '';

        if (category_id) {
            const category = await ProductCategory.findByPk(category_id);
            if (!category) return res.status(400).json({ message: 'Invalid Category ID.' });
        }

        const newProduct = await Product.create({
            category_id,
            product_name,
            description,
            price,
            stock,
            image_url,
        });

        res.status(201).json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while adding product.' });
    }
};

exports.updateProduct = async (req, res) => {

    try {

        const product_id = req.params.id;

        const {
            category_id,
            product_name,
            description,
            price,
            stock
        } = req.body;

        // FIND PRODUCT FIRST
        const product =
        await Product.findByPk(product_id);

        if (!product) {

            return res.status(404).json({
                message: 'Product not found.'
            });
        }

        // IMAGE URL
        const image_url =
        req.file
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        : product.image_url;

        // UPDATE PRODUCT
        await product.update({

            category_id,

            product_name,

            description,

            price,

            stock,

            image_url,
        });

        res.json({

            message:
            'Product updated successfully!',

            product
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
            'Server error updating product.'
        });
    }
};

exports.deleteProduct = async (req, res) => {

    try {

        const product_id = req.params.id;

        // DELETE ORDER ITEMS FIRST
        await OrderItem.destroy({
            where: { product_id }
        });

        // DELETE CART ITEMS
        await Cart.destroy({
            where: { product_id }
        });

        // DELETE PRODUCT
        const deleted =
        await Product.destroy({
            where: { product_id }
        });

        if (!deleted) {

            return res.status(404).json({
                message: 'Product not found.'
            });
        }

        res.json({
            message:
            'Product deleted successfully.'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error deleting product.'
        });
    }
};


exports.getPendingDoctorRequests = async (req, res) => {
    try {
        const requests = await DoctorRequest.findAll({
            where: { status: 'pending' },
            include: [{
                model: User,
                as: 'user',
                attributes: ['full_name', 'email', 'phone']
            }],
            order: [['created_at', 'ASC']]
        });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching doctor requests.' });
    }
};

exports.processDoctorRequest = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const request_id = req.params.id;
        const { status } = req.body; 

        const request = await DoctorRequest.findByPk(request_id, { transaction: t });

        if (!request) {
            await t.rollback();
            return res.status(404).json({ message: 'Request not found.' });
        }

        if (request.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: `Request is already ${request.status}.` });
        }

        await request.update({ status }, { transaction: t });

        if (status === 'approved') {
            await User.update(
                { role: 'doctor' },
                { where: { user_id: request.user_id }, transaction: t }
            );

            await Doctor.create({
                doctor_id: request.user_id, 
                specialization: request.specialization,
                license_number: request.license_number,
                experience_years: request.experience,
                profile_pic: request.profile_pic,
                degree_pic: request.degree_pic,
                license_pic: request.license_pic
            }, { transaction: t });
        }

        await SystemLog.create({
            admin_id: req.user.user_id,
            action: `${status === 'approved' ? 'Approved' : 'Rejected'} doctor request ID: ${request_id}`
        }, { transaction: t });

        await t.commit();
        res.json({ message: `Doctor request ${status} successfully.` });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error processing request.' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] }, 
            order: [['created_at', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
};

exports.getSystemLogs = async (req, res) => {
    try {
        const logs = await SystemLog.findAll({
            include: [{ model: User, attributes: ['full_name', 'email'] }],
            order: [['log_time', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching logs.' });
    }
};
exports.getDashboardStats = async (req, res) => {
    try {

        const totalUsers = await User.count({
            where: { role: 'client' }
        });

        const totalDoctors = await Doctor.count();

        const totalAppointments =
            await require('../models').Appointment.count();

        res.json({
            totalUsers,
            totalDoctors,
            totalAppointments
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error fetching dashboard stats.'
        });
    }
};
exports.deleteUser = async (req, res) => {

    try {

        const userId =
            req.params.id;

        const user =
            await User.findByPk(userId);

        if (!user) {

            return res.status(404).json({
                message: 'User not found.'
            });
        }

        await user.destroy();

        res.json({
            message:
            'User deleted successfully.'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error deleting user.'
        });
    }
};
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { full_name, email, phone } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use.' });
            }
        }

        await user.update({
            full_name: full_name || user.full_name,
            email: email || user.email,
            phone: phone || user.phone
        });

        res.json({
            message: 'User updated successfully.',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating user.' });
    }
};
exports.getAllAppointments =
async (req, res) => {

    try {

        const appointments =
            await Appointment.findAll({

            include: [
                {
                    model: require('../models').Pet,
                    attributes: ['pet_name', 'species', 'breed', 'image_url']
                },
                {
                    model: require('../models').User,
                    as: 'doctor',
                    attributes: ['full_name', 'email', 'phone']
                },
                {
                    model: require('../models').User,
                    as: 'client',
                    attributes: ['full_name', 'email', 'phone']
                },
                {
                    model: require('../models').Prescription
                }
            ],

            order: [
              ['created_at', 'DESC']
            ]
        });

        res.json(appointments);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error fetching appointments.'
        });
    }
};

exports.deleteAppointment =
async (req, res) => {

    try {

        const appointmentId =
            req.params.id;

        const appointment =
            await Appointment.findByPk(
                appointmentId
            );

        if (!appointment) {

            return res.status(404).json({
                message:
                'Appointment not found.'
            });
        }

        // 🔥 DELETE PRESCRIPTION FIRST
        await Prescription.destroy({

            where: {
                appointment_id:
                appointmentId
            }
        });

        // 🔥 THEN DELETE APPOINTMENT
        await appointment.destroy();

        res.json({

            message:
            'Appointment deleted successfully.'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
            'Server error deleting appointment.'
        });
    }
};

// ── GET all approved doctors (with user profile) ──
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['full_name', 'email', 'phone']
            }],
            order: [['doctor_id', 'ASC']]
        });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching doctors.' });
    }
};

// ── PUT update doctor profile ──
exports.updateDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const { name, email, phone, specialization, license_number, experience_years, availability } = req.body;

        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        const profile_pic = req.files && req.files['profile_pic'] ? req.files['profile_pic'][0].filename : undefined;
        const degree_pic = req.files && req.files['degree_pic'] ? req.files['degree_pic'][0].filename : undefined;
        const license_pic = req.files && req.files['license_pic'] ? req.files['license_pic'][0].filename : undefined;

        const updateData = {
            specialization,
            license_number,
            experience_years,
            availability
        };
        if (profile_pic !== undefined) updateData.profile_pic = profile_pic;
        if (degree_pic !== undefined) updateData.degree_pic = degree_pic;
        if (license_pic !== undefined) updateData.license_pic = license_pic;

        await doctor.update(updateData);

        const user = await User.findByPk(doctor.doctor_id);
        if (user) {
            const userUpdateData = {};
            if (name !== undefined) userUpdateData.full_name = name;
            if (email !== undefined) userUpdateData.email = email;
            if (phone !== undefined) userUpdateData.phone = phone;
            await user.update(userUpdateData);
        }

        // Return updated doctor with user details
        const updatedDoctor = await Doctor.findByPk(doctorId, {
            include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'phone'] }]
        });

        res.json({ message: 'Doctor updated successfully.', doctor: updatedDoctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating doctor.' });
    }
};

// GET /api/admin/pets/pending
exports.getPendingPets = async (req, res) => {
    try {
        const pets = await Pet.findAll({
            where: { status: 'pending' },
            include: [{ model: User, as: 'owner', attributes: ['full_name', 'email'] }],
            order: [['created_at', 'ASC']]
        });
        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching pending pets.' });
    }
};

// PUT /api/admin/pets/:id/status
exports.processPetApproval = async (req, res) => {
    try {
        const pet_id = req.params.id;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
        }

        const pet = await Pet.findByPk(pet_id);
        if (!pet) return res.status(404).json({ message: 'Pet not found.' });

        await pet.update({ status });
        res.json({ message: `Pet successfully ${status}!`, pet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error processing pet approval.' });
    }
};