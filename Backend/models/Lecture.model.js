// models/Lecture.js
const mongoose = require('mongoose');

const presentStudentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  present: { type: Boolean, default: true }
}, { _id: false });

const lectureSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  division: { type: String, required: true },
  attendance: [presentStudentSchema],
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

module.exports = mongoose.model('Lecture', lectureSchema);
