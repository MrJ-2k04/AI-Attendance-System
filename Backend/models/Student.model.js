// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  division: { type: String, required: true },
  embedding: { type: [Number], required: true }, // 128-d face encoding
  images: [
    {
      fileName: { type: String, required: true },
      fileSize: { type: Number, required: true }, // in bytes
      key: { type: String, required: true },      // S3 object key
      url: { type: String },                      // optional: S3 public URL or presigned URL
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
