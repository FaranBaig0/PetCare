const { Appointment, User, Doctor, Pet, Prescription } = require('../models');
const Sequelize = require('sequelize');
const sendEmail = require('../utils/sendEmail');

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.findAll({
            where: { role: 'doctor', status: 'active' },
            attributes: ['user_id', 'full_name', 'email', 'phone'],
            include: [{
                model: Doctor,
                as: 'doctorProfile', 
                attributes: ['specialization', 'experience_years', 'availability', 'profile_pic']
            }]
        });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching doctors.' });
    }
};

exports.getBookedSlots = async (req, res) => {
    try {
        const { doctor_id, date } = req.query;
        if (!doctor_id || !date) {
            return res.status(400).json({ message: 'doctor_id and date are required.' });
        }
        const { Op } = require('sequelize');
        const appointments = await Appointment.findAll({
            where: {
                doctor_id,
                appointment_date: date,
                status: { [Op.notIn]: ['rejected'] }
            },
            attributes: ['appointment_time']
        });
        const bookedSlots = appointments.map(a => a.appointment_time);
        const serverTime = new Date().toISOString();
        res.json({ bookedSlots, serverTime });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching booked slots.' });
    }
};

exports.bookAppointment = async (req, res) => {
    try {
        const client_id = req.user.user_id;
        const {
            doctor_id,
            pet_id,
            appointment_date,
            appointment_time,
            issue,
            urgency,
        } = req.body;

        // Handle multiple uploaded images (up to 5)
        const image_path = req.files && req.files.length > 0
            ? req.files.map(f => f.filename).join(',')
            : null;

        const pet = await Pet.findOne({ where: { pet_id, owner_id: client_id } });
        if (!pet) return res.status(403).json({ message: 'Unauthorized pet access.' });

        // Prevent booking past appointments
        const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
        const now = new Date();
        if (appointmentDateTime < now) {
            return res.status(400).json({ message: 'Cannot book appointments in the past.' });
        }

        const appointment = await Appointment.create({
            client_id,
            doctor_id,
            pet_id,
            appointment_date,
            appointment_time,
            issue,
            urgency,
            image_path,
            status: 'pending'
        });

        res.status(201).json({ message: 'Appointment booked successfully!', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error booking appointment.' });
    }
};

exports.getClientAppointments = async (req, res) => {
    try {
        const client_id = req.user.user_id;

        const appointments = await Appointment.findAll({
            where: { client_id },
            include: [
                { model: Pet, attributes: ['pet_name', 'species', 'image_url'] },
                { model: User, as: 'doctor', attributes: ['full_name'] }
            ],
            order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
        });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching appointments.' });
    }
};


exports.getDoctorAppointments = async (req, res) => {
    try {
        const doctor_id = req.user.user_id;

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Doctors only.' });
        }

        const appointments = await Appointment.findAll({
            where: { doctor_id },
            include: [
                { model: Pet, attributes: ['pet_name', 'species', 'age', 'weight', 'image_url'] },
                { model: User, as: 'client', attributes: ['full_name', 'phone'] }
            ],
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching doctor appointments.' });
    }
};

exports.uploadPrescription = async (req, res) => {
    try {
        const doctor_id = req.user.user_id;
        const appointment_id = req.params.id;
        const { notes } = req.body;
        
        const file_path = req.file ? req.file.filename : null;

        const appointment = await Appointment.findOne({ where: { appointment_id, doctor_id } });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
        if (appointment.status !== 'accepted') return res.status(400).json({ message: 'Can only prescribe for completed appointments.' });

        const prescription = await Prescription.create({
            appointment_id,
            doctor_id,
            notes,
            file_path
        });
        await appointment.update({
            status: 'completed'
        });
        res.status(201).json({ message: 'Prescription uploaded successfully!', prescription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error uploading prescription.' });
    }
};
exports.getPrescription = async (req, res) => {
    try {
        const appointment_id = req.params.id;
        const user_id = req.user.user_id;

        // Verify caller is owner or doctor of this appointment
        const appointment = await Appointment.findOne({
            where: {
                appointment_id,
                [Sequelize.Op.or]: [{ client_id: user_id }, { doctor_id: user_id }]
            }
        });
        if (!appointment) {
            return res.status(403).json({ message: 'Access denied or appointment not found.' });
        }

        const prescription = await Prescription.findOne({
            where: { appointment_id },
            include: [{
                model: Appointment,
                include: [{
                    model: User,
                    as: 'doctor',
                    attributes: ['full_name']
                }]
            }]
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found.' });
        }

        res.json(prescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching prescription.' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const doctor_id = req.user.user_id;
        const appointment_id = req.params.id;
        const { status } = req.body; 

        const appointment = await Appointment.findOne({ 
            where: { appointment_id, doctor_id },
            include: [{ model: User, as: 'client', attributes: ['email', 'full_name'] }] 
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

        await appointment.update({ status });

        //if (status === 'accepted' || status === 'rejected') {
            //const message = `Hello ${appointment.client.full_name}, your appointment on ${appointment.appointment_date} has been ${status} by the doctor.`;
            //await sendEmail({ email: appointment.client.email, subject: `Appointment ${status.toUpperCase()}`, message });
        //}

        res.json({ message: `Appointment marked as ${status} and client notified.`, appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating appointment.' });
    }
};
exports.deleteAppointment = async (req, res) => {

    try {

        const appointment_id =
            req.params.id;

        const client_id =
            req.user.user_id;

        const appointment =
            await Appointment.findOne({

            where: {
                appointment_id,
                client_id
            }
        });

        if (!appointment) {

            return res.status(404).json({
                message:
                'Appointment not found.'
            });
        }

        await Prescription.destroy({
            where: {
                appointment_id: appointment_id
            }
        });

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

exports.getPetMedicalHistory = async (req, res) => {

    try {

        const pet_id = req.params.petId;

        const prescriptions = await Prescription.findAll({

            include: [{

                model: Appointment,

                where: { pet_id },

                include: [

                    {
                        model: User,
                        as: 'doctor',
                        attributes: ['full_name']
                    }
                ]
            }],

            order: [['created_at', 'DESC']]
        });

        res.json(prescriptions);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error fetching medical history.'
        });
    }
};

exports.getAllPrescriptions = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const role = req.user.role;

        let prescriptions;
        if (role === 'doctor') {
            prescriptions = await Prescription.findAll({
                where: { doctor_id: user_id },
                include: [
                    { 
                        model: Appointment, 
                        include: [
                            { model: Pet, attributes: ['pet_name', 'species'] },
                            { model: User, as: 'client', attributes: ['full_name'] }
                        ] 
                    }
                ],
                order: [['created_at', 'DESC']]
            });
        } else {
            prescriptions = await Prescription.findAll({
                include: [
                    { 
                        model: Appointment, 
                        where: { client_id: user_id },
                        include: [
                            { model: Pet, attributes: ['pet_name', 'species'] },
                            { model: User, as: 'doctor', attributes: ['full_name'] }
                        ] 
                    }
                ],
                order: [['created_at', 'DESC']]
            });
        }

        res.json(prescriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching all prescriptions.' });
    }
};