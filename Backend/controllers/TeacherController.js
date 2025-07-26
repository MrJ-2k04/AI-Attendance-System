import { Teacher } from '../models/index.js';
import ResponseHandler from '../utils/ResponseHandler.js';

// CREATE
const create = async (req, res) => {
    try {
        const teacher = await Teacher.create(req.body);
        return ResponseHandler.success(res, teacher, 'Teacher created', 201);
    } catch (err) {
        return ResponseHandler.error(res, err, 400);
    }
}

// READ by ID
const getById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return ResponseHandler.notFound(res, 'Teacher not found');
        return ResponseHandler.success(res, teacher);
    } catch (err) {
        return ResponseHandler.error(res, err);
    }
};

// READ ALL
const getAll = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        return ResponseHandler.success(res, teachers);
    } catch (err) {
        return ResponseHandler.error(res, err);
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!teacher) return ResponseHandler.notFound(res, 'Teacher not found');
        return ResponseHandler.success(res, teacher, 'Teacher updated');
    } catch (err) {
        return ResponseHandler.error(res, err, 400);
    }
};

// DELETE
const remove = async (req, res) => {
    try {
        const deleted = await Teacher.findByIdAndDelete(req.params.id);
        if (!deleted) return ResponseHandler.notFound(res, 'Teacher not found');
        return ResponseHandler.success(res, null, 'Teacher deleted');
    } catch (err) {
        return ResponseHandler.error(res, err);
    }
};


export default {
    create,
    getAll,
    getById,
    update,
    remove
};
