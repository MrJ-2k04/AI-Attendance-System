import express from 'express';
import { lectureController } from '../controllers/index.js';

const router = express.Router();

router.post('/', lectureController.create);
router.get('/', lectureController.getAll);
router.get('/:id', lectureController.getById);
router.put('/:id', lectureController.update);
router.delete('/:id', lectureController.remove);
router.post('/:id/generate', lectureController.generateAttendance);

export default router;
