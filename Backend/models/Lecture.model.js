// models/Lecture.js
import mongoose from 'mongoose';
import { imageSchema, presentStudentSchema } from './OtherModels.js';

const lectureSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  division: { type: String, required: true },
  attendance: [presentStudentSchema],
  images: [imageSchema],
  annotatedImages: [imageSchema]
}, { timestamps: true, skipVersioning: true });

export default mongoose.model('Lecture', lectureSchema);

