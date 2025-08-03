import { Subject } from "../models/index.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import Joi from "joi";

// CREATE
const create = async (req, res) => {
  // Validate request body
  const subjectSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    teacherId: Joi.string().trim().required(),
  });

  const { error, value } = subjectSchema.validate(req.body, {
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
    const subject = await Subject.create(validatedData);
    return ResponseHandler.success(
      res,
      subject,
      "Subject created successfully",
      201
    );
  } catch (err) {
    return ResponseHandler.error(res, err, 400);
  }
};

// READ ALL
const getAll = async (req, res) => {
  try {
    const subjects = await Subject.find().populate("teacherId");
    return ResponseHandler.success(
      res,
      subjects,
      "Subjects retrieved successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// READ BY ID
const getById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate("teacherId");
    if (!subject) {
      return ResponseHandler.notFound(res, "Subject not found");
    }
    return ResponseHandler.success(
      res,
      subject,
      "Subject retrieved successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!subject) {
      return ResponseHandler.notFound(res, "Subject not found");
    }
    return ResponseHandler.success(
      res,
      subject,
      "Subject updated successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err, 400);
  }
};

// DELETE
const remove = async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return ResponseHandler.notFound(res, "Subject not found");
    }
    return ResponseHandler.success(res, null, "Subject deleted successfully");
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// DELETE ALL
const removeAll = async (req, res) => {
  try {
    await Subject.deleteMany({});
    return ResponseHandler.success(res, null, "All subjects deleted");
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

export default { create, getAll, getById, update, remove, removeAll };
