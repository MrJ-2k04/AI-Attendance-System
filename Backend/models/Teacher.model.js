// models/Teacher.js
import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true, skipVersioning: true });

export default mongoose.model('Teacher', teacherSchema);
