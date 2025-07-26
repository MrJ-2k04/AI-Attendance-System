const { Subject } = require('../models');

// CREATE
const create = async (req, res) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// READ ALL
const getAll = async (req, res) => {
    try {
        const subjects = await Subject.find().populate('teacher');
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ BY ID
const getById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('teacher');
        if (!subject) return res.status(404).json({ message: 'Not found' });
        res.json(subject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const remove = async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { create, getAll, getById, update, remove };
