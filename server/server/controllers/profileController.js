const { User, Doctor } = require('../models');

exports.updateProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const {
            full_name,
            phone,
            availability,
            specialization,
            license_number,
            experience_years
        } = req.body;

        await User.update(
            { full_name, phone },
            { where: { user_id } }
        );

        if (req.user.role === 'doctor' && availability) {
            await Doctor.update(
                {
                    availability,
                    specialization,
                    license_number,
                    experience_years
                },
                { where: { doctor_id: user_id } }
            );
        }

        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};

exports.getDoctorProfile = async (req, res) => {

    try {
        console.log(req.user);

        const user_id =
            req.user.user_id;

            console.log(user_id);

            const doctor =
            await Doctor.findOne({
        
                where: {
                    doctor_id: user_id
                },
        
                include: [
                    {
                        model: User,
                        as: 'user',
        
                        attributes: [
                            'full_name',
                            'email',
                            'phone'
                        ]
                    }
                ]
            });

            console.log(doctor);

        if (!doctor) {

            return res.status(404).json({
                message: 'Doctor profile not found'
            });
        }

        res.json(doctor);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Error fetching doctor profile'
        });
    }
};
exports.getProfile = async (req, res) => {

    try {

        const user =
            await User.findByPk(
                req.user.user_id
            );

        if (!user) {

            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json(user);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Error fetching profile'
        });
    }
};