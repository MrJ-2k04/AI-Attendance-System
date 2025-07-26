// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
