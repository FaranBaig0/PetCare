const { Pet, PetMedicalRecord } = require('../models');

exports.createPet = async (req, res) => {
    try {
        const owner_id = req.user.user_id; 
        const { pet_name, species, breed, age, gender, weight } = req.body;

        const image_url = req.file
            ? `http://localhost:5000/uploads/${req.file.filename}`
            : null;

        const newPet = await Pet.create({
            owner_id,
            pet_name,
            species,
            breed,
            age,
            gender,
            weight,
            image_url
        });

        res.status(201).json({ message: 'Pet added successfully!', pet: newPet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while adding pet.' });
    }
};

exports.getMyPets = async (req, res) => {
    try {
        const owner_id = req.user.user_id;

        const pets = await Pet.findAll({
            where: { owner_id },
            order: [['created_at', 'DESC']]
        });

        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching pets.' });
    }
};

exports.getPetById = async (req, res) => {
    try {
        const pet_id = req.params.id;
        const owner_id = req.user.user_id;

        const pet = await Pet.findOne({
            where: { pet_id, owner_id } 
        });

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found or unauthorized.' });
        }

        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching pet details.' });
    }
};

exports.updatePet = async (req, res) => {
    try {
        const pet_id = req.params.id;
        const owner_id = req.user.user_id;
        const { pet_name, species, breed, age, gender, weight } = req.body;

        const pet = await Pet.findOne({ where: { pet_id, owner_id } });
        const image_url = req.file
  ? `http://localhost:5000/uploads/${req.file.filename}`
  : pet.image_url;

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found or unauthorized.' });
        }

        await pet.update({
            pet_name,
            species,
            breed,
            age,
            gender,
            weight,
            image_url,
        });

        res.json({ message: 'Pet updated successfully!', pet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating pet.' });
    }
};

exports.deletePet = async (req, res) => {
    try {
        const pet_id = req.params.id;
        const owner_id = req.user.user_id;

        const pet = await Pet.findOne({ where: { pet_id, owner_id } });

        if (!pet) {
            return res.status(404).json({ message: 'Pet not found or unauthorized.' });
        }

        await pet.destroy(); 

        res.json({ message: 'Pet deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting pet.' });
    }
};

exports.getPetMedicalRecords = async (req, res) => {
    try {
        const pet_id = req.params.id;
        const owner_id = req.user.user_id;

        const pet = await Pet.findOne({ where: { pet_id, owner_id } });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found or unauthorized.' });
        }

        const records = await PetMedicalRecord.findAll({
            where: { pet_id },
            order: [['record_date', 'DESC']]
        });

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching medical records.' });
    }
};