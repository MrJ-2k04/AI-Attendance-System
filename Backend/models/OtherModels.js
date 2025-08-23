import mongoose from "mongoose";

export const presentStudentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  present: { type: Boolean, default: true }
}, { _id: false });

export const imageSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true }, // in bytes
  key: { type: String, required: true },      // S3 object key
  uploadedAt: { type: Date, default: Date.now },
  url: { type: String, required: false }
}, { _id: false });