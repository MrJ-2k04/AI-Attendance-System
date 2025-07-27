import { Lecture } from "../models/index.js";
import AWS from "aws-sdk";
import { AWS_CONFIG } from "../config.js";
import ResponseHandler from "../utils/ResponseHandler.js";
import path from "path";
import Joi from "joi";

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: AWS_CONFIG.accessKeyId,
  secretAccessKey: AWS_CONFIG.secretAccessKey,
  region: AWS_CONFIG.region,
});

// CREATE
const create = async (req, res) => {
  // Validate request body
  const lectureSchema = Joi.object({
    subjectId: Joi.string().trim().required(),

    division: Joi.string().trim().min(1).max(10).required(),

    attendance: Joi.array()
      .items(
        Joi.object({
          rollNumber: Joi.string().trim().required(),
          present: Joi.boolean().default(true),
        })
      )
      .optional()
      .default([]),
    images: Joi.array()
      .items(
        Joi.object({
          fileName: Joi.string().required(),
          fileSize: Joi.number().positive().required(),
          key: Joi.string().required(),
          url: Joi.string().uri().optional(),
          uploadedAt: Joi.date().default(Date.now),
        })
      )
      .optional()
      .default([]),
  });

  const { error, value } = lectureSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return ResponseHandler.badRequest(res, errorMessages.join(", "));
  }

  // Use validated data instead of req.body
  const validatedData = value;

  // Check if files are provided
  if (!req.files || req.files.length === 0) {
    return ResponseHandler.badRequest(res, "At least one image is required");
  }

  // Validate file types (only images allowed)
  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  for (const file of req.files) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return ResponseHandler.badRequest(
        res,
        `Invalid file type: ${extension}. Only image files are allowed.`
      );
    }

    if (file.size > maxFileSize) {
      return ResponseHandler.badRequest(
        res,
        `File ${file.originalname} is too large. Maximum size is 50MB.`
      );
    }
  }

  const uploadedImages = [];
  let lecture;
  try {
    // Create lecture with validated data
    lecture = await Lecture.create(validatedData);
    const subjectId = validatedData.subjectId;

    for (const file of req.files) {
      const extension = path.extname(file.originalname).toLowerCase();
      const params = {
        Bucket: AWS_CONFIG.bucketName,
        Key: `lectures/${subjectId}/${
          lecture.id
        }/images/${Date.now()}${extension}`,
        Body: file.buffer,
      };

      const s3Response = await s3.upload(params).promise();

      uploadedImages.push({
        fileName: file.originalname,
        fileSize: file.size,
        key: s3Response.Key,
        url: s3Response.Location,
        uploadedAt: new Date(),
      });
    }

    // Update lecture with uploaded images
    lecture.images = uploadedImages;
    await lecture.save();

    return ResponseHandler.success(
      res,
      lecture,
      "Lecture created successfully",
      201
    );
  } catch (err) {
    // Clean up: delete lecture if it was created
    if (lecture && lecture.id) {
      try {
        await Lecture.findByIdAndDelete(lecture.id);
      } catch (deleteError) {
        console.error("Error deleting lecture during cleanup:", deleteError);
      }
    }

    // Delete uploaded files from S3 in case of error
    if (uploadedImages.length > 0) {
      try {
        await Promise.all(
          uploadedImages.map((image) =>
            s3
              .deleteObject({
                Bucket: AWS_CONFIG.bucketName,
                Key: image.key,
              })
              .promise()
          )
        );
      } catch (deleteError) {
        console.error("Error deleting uploaded files:", deleteError);
      }
    }

    return ResponseHandler.error(
      res,
      new Error(err.message || "Failed to create lecture"),
      400
    );
  }
};

// READ ALL
const getAll = async (req, res) => {
  try {
    const lectures = await Lecture.find()
      .populate("subjectId")
      .populate("attendance.studentId");
    return ResponseHandler.success(
      res,
      lectures,
      "Lectures retrieved successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// READ BY ID
const getById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate("subjectId")
      .populate("attendance.studentId");
    if (!lecture) {
      return ResponseHandler.notFound(res, "Lecture not found");
    }
    return ResponseHandler.success(
      res,
      lecture,
      "Lecture retrieved successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!lecture) {
      return ResponseHandler.notFound(res, "Lecture not found");
    }
    return ResponseHandler.success(
      res,
      lecture,
      "Lecture updated successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// DELETE
const remove = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return ResponseHandler.notFound(res, "Lecture not found");
    }

    // Delete associated images from S3
    if (lecture.images && lecture.images.length > 0) {
      try {
        await Promise.all(
          lecture.images.map((image) =>
            s3
              .deleteObject({
                Bucket: AWS_CONFIG.bucketName,
                Key: image.key,
              })
              .promise()
          )
        );
      } catch (deleteError) {
        console.error("Error deleting S3 files:", deleteError);
        // Continue with lecture deletion even if S3 cleanup fails
      }
    }

    await Lecture.findByIdAndDelete(req.params.id);
    return ResponseHandler.success(res, null, "Lecture deleted successfully");
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// GENERATE ATTENDANCE
const generateAttendance = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return ResponseHandler.notFound(res, "Lecture not found");
    }

    // Simulate attendance marking (can add face recognition logic later)
    lecture.present = lecture.images?.length > 0 ? true : false;

    await lecture.save();
    return ResponseHandler.success(
      res,
      lecture,
      "Attendance generated successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

export default { create, getAll, getById, update, remove, generateAttendance };
