// models/Student.js
import mongoose from 'mongoose';
import { imageSchema } from './OtherModels.js';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  division: { type: String, required: true },
  embeddings: {
    type: [
      {
        _id: false, // disable _id for each embedding object
        image: { type: String, required: true },
        embedding: { type: [Number], required: true },
      }
    ],
    default: undefined // make the embeddings array itself optional
  },
  images: [imageSchema]
}, { timestamps: true, skipVersioning: true });

export default mongoose.model('Student', studentSchema);

