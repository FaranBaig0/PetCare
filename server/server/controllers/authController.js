const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Doctor } = require('../models');
const { User, DoctorRequest } = require('../models');
const sendEmail = require('../utils/sendEmail');


exports.register = async (req, res) => {
    try {
        const { full_name, email, password, phone, role } = req.body;

        // ── Validation ────────────────────────────────────────────
        const nameRegex  = /^[a-zA-Z\s]{2,}$/;
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[0-9]{11}$/;

        if (!full_name || !nameRegex.test(full_name.trim())) {
            return res.status(400).json({
                message: 'Full name must contain only letters and spaces (min 2 characters).'
            });
        }

        if (!email || !emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: 'Please provide a valid email address (e.g. user@example.com).'
            });
        }

        if (!phone || !phoneRegex.test(phone.trim())) {
            return res.status(400).json({
                message: 'Phone number must be exactly 11 digits (numbers only).'
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long.'
            });
        }
        // ─────────────────────────────────────────────────────────

        const existingUser = await User.findOne({ where: { email: email.trim() } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            full_name: full_name.trim(),
            email: email.trim(),
            password_hash,
            role: role || 'client',
            phone: phone.trim(),
            status:
               role === 'doctor'
                  ? 'inactive'
                  : 'active'
        });

        res.status(201).json({ message: 'User registered successfully!', userId: newUser.user_id });
    } catch (error) {

        console.log("REGISTER ERROR:");
        console.log(error);
    
        res.status(500).json({
            message: 'Server error during registration.',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        if (
            user.role === 'doctor' &&
            user.status !== 'active'
        ) {
            return res.status(403).json({
                message:
                  'Your doctor application is still pending approval.'
            });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.user_id,
                name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

exports.doctorApply = async (req, res) => {
    try {
        const { user_id } = req.body;
        const { specialization, experience, description, license_number } = req.body;

        const profile_pic = req.files['profile_pic'] ? req.files['profile_pic'][0].filename : null;
        const degree_pic = req.files['degree_pic'] ? req.files['degree_pic'][0].filename : null;
        const license_pic = req.files['license_pic'] ? req.files['license_pic'][0].filename : null;

        const request = await DoctorRequest.create({
            user_id,
            specialization,
            experience,
            description,
            license_number,
            profile_pic,
            degree_pic,
            license_pic,
            status: 'pending' 
        });

        res.status(201).json({ message: 'Doctor application submitted successfully!', request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during application submission.' });
    }
};

exports.getDoctorRequests = async (req, res) => {

    try {

        const requests =
            await DoctorRequest.findAll({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['full_name', 'email', 'phone']
                }],
                order: [['created_at', 'DESC']]
            });

        res.json(requests);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Error fetching requests'
        });
    }
};

exports.approveDoctor = async (req, res) => {

    try {

        const { id } = req.params;

        const request =
            await DoctorRequest.findByPk(id);

        if (!request) {

            return res.status(404).json({
                message: 'Request not found'
            });
        }

        request.status = 'approved';

        await request.save();

        // ACTIVATE USER LOGIN
        await User.update(
            { status: 'active' },
            {
                where: {
                    user_id: request.user_id
                }
            }
        );

        await Doctor.create({

            doctor_id:
                request.user_id,
        
            specialization:
                request.specialization,
        
            license_number:
                request.license_number,
        
            experience_years:
                request.experience,
        
            availability:
                'Available',
        
            profile_pic:
                request.profile_pic,
        
            degree_pic:
                request.degree_pic,
        
            license_pic:
                request.license_pic,
        });

        await DoctorRequest.destroy({
            where: {
                id: id
            }
        });

        res.json({
            message: 'Doctor approved successfully'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Approval failed'
        });
    }
};

exports.rejectDoctor = async (req, res) => {

    try {

        const { id } = req.params;

        await DoctorRequest.destroy({
            where: {
                id: id
            }
        });

        res.json({
            message: 'Doctor rejected'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Reject failed'
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: { exclude: ['password_hash'] } 
        });
        
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) return res.status(404).json({ message: 'No user found with that email.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.reset_otp = otp;
        user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const message = `Your password reset code is: ${otp}. It is valid for 10 minutes.`;
        await sendEmail({ email: user.email, subject: 'PetCare+ Password Reset', message });

        res.status(200).json({ message: 'OTP sent to email!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending OTP.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || user.reset_otp !== otp || user.otp_expiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        
        user.reset_otp = null;
        user.otp_expiry = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password.' });
    }
};