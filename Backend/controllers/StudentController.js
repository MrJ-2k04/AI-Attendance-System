import AWS from "aws-sdk";
import Joi from "joi";
import path from "path";
import { AWS_CONFIG } from "../config.js";
import { Student } from "../models/index.js";
import { generateEmbeddings } from "../services/index.js";
import ResponseHandler from "../utils/ResponseHandler.js";

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: AWS_CONFIG.accessKeyId,
  secretAccessKey: AWS_CONFIG.secretAccessKey,
  region: AWS_CONFIG.region,
});

// CREATE
const create = async (req, res) => {
  // Validate request body
  const StudentSchema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]+$/)
      .required(),

    rollNumber: Joi.string().trim().alphanum().min(1).max(20).required(),

    division: Joi.string().trim().min(1).max(10).required(),

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

  const { error, value } = StudentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return ResponseHandler.badRequest(res, errorMessages.join(", "));
  }

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
  const files = [];
  try {
    for (const file of req.files) {
      const extension = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}${extension}`;
      const params = {
        Bucket: AWS_CONFIG.bucketName,
        Key: `students/${value.rollNumber}/${fileName}`,
        Body: file.buffer,
      };

      const s3Response = await s3.upload(params).promise();
      // const s3Response = {
      //   Key: `students/${value.rollNumber}/${fileName}`,
      // }
      const uploadedImage = {
        fileName: file.originalname,
        fileSize: file.size,
        key: s3Response.Key,
        // url: s3Response.Location,
        uploadedAt: new Date(),
      }

      uploadedImages.push(uploadedImage);
      files.push({
        originalname: fileName,
        buffer: file.buffer
      })
    }

    const studentData = {
      ...value,
      images: uploadedImages,
    };

    const student = await Student.create(studentData);
    // const student = { ...studentData };

    // Call external API to generate embeddings
    const apiResponse = await generateEmbeddings(files);
    // console.log("API Response:", apiResponse.data);
    // console.log("API Response:", apiResponse.data.embeddings);

    if (apiResponse.data.embeddings) {
      student.embeddings = apiResponse.data.embeddings;
      await student.save();
    }

    return ResponseHandler.success(
      res,
      student,
      "Student created successfully",
      201
    );
  } catch (err) {
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
      new Error(err.message || "Failed to create student"),
      400
    );
  }
};

// READ ALL
const getAll = async (req, res) => {
  try {
    const students = await Student.find().select("-images.url");
    return ResponseHandler.success(
      res,
      students,
      "Students retrieved successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// READ BY ID
const getById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-images.url");
    if (!student) {
      return ResponseHandler.notFound(res, "Student not found");
    }
    return ResponseHandler.success(
      res,
      student,
      "Student retrieved successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) {
      return ResponseHandler.notFound(res, "Student not found");
    }
    return ResponseHandler.success(
      res,
      student,
      "Student updated successfully"
    );
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

// DELETE
const remove = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return ResponseHandler.notFound(res, "Student not found");
    }

    // Delete associated images from S3
    if (student.images && student.images.length > 0) {
      try {
        await Promise.all(
          student.images.map((image) =>
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
        // Continue with student deletion even if S3 cleanup fails
      }
    }

    await Student.findByIdAndDelete(req.params.id);
    return ResponseHandler.success(res, null, "Student deleted successfully");
  } catch (err) {
    return ResponseHandler.error(res, err);
  }
};

export default { create, getAll, getById, update, remove };
