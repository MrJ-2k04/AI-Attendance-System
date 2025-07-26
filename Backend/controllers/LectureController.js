const { Lecture } = require('../models');

// CREATE
const create = async (req, res) => {
    try {
        const lecture = await Lecture.create(req.body);
        res.status(201).json(lecture);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// READ ALL
const getAll = async (req, res) => {
    try {
        const lectures = await Lecture.find()
            .populate('subj_id')
            .populate('stu_id');
        res.json(lectures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ BY ID
const getById = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id)
            .populate('subj_id')
            .populate('stu_id');
        if (!lecture) return res.status(404).json({ message: 'Not found' });
        res.json(lecture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(lecture);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const remove = async (req, res) => {
    try {
        await Lecture.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GENERATE ATTENDANCE
const generateAttendance = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        // Simulate attendance marking (can add face recognition logic later)
        lecture.present = lecture.gen_images?.length > 0 ? true : false;

        await lecture.save();
        res.json(lecture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { create, getAll, getById, update, remove, generateAttendance };
