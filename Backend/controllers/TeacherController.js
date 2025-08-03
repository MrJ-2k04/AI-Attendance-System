import { Teacher } from "../models/index.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import Joi from "joi";

// CREATE
const create = async (req, res) => {
  // Validate request body
  const teacherSchema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]+$/)
      .required(),
  });

  const { error, value } = teacherSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return ResponseHandler.badRequest(res, errorMessages.join(", "));
  }

  // Use validated data
  const validatedData = value;

  try {
    const teacher = await Teacher.create(validatedData);
    return ResponseHandler.success(res, teacher, "Teacher created", 201);
  } catch (err) {
    return ResponseHandler.error(res, err, 400);
  }
};

// READ by ID
const getById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return ResponseHandler.notFound(res, "Teacher not found");
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
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!teacher) return ResponseHandler.notFound(res, "Teacher not found");
    return ResponseHandler.success(res, teacher, "Teacher updated");
  } catch (err) {
    return ResponseHandler.error(res, err, 400);
  }
};

// DELETE
const remove = async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);
    if (!deleted) return ResponseHandler.notFound(res, "Teacher not found");
    return ResponseHandler.success(res, null, "Teacher deleted");
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// DELETE ALL
const removeAll = async (req, res) => {
  try {
    await Teacher.deleteMany({});
    return ResponseHandler.success(res, null, "All teachers deleted");
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

export default {
  create,
  getAll,
  getById,
  removeAll,
  update,
  remove,
};
