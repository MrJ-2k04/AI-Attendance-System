import express from 'express';
import { lectureController } from '../controllers/index.js';
import idValidator from '../middlewares/idValidator.js';

const router = express.Router();

router.post('/', lectureController.create);
router.get('/', lectureController.getAll);
router.get('/:id', idValidator, lectureController.getById);
router.put('/:id', idValidator, lectureController.update);
router.delete('/:id', idValidator, lectureController.remove);
router.post('/:id/generate', idValidator, lectureController.generateAttendance);
router.delete('/', lectureController.removeAll);

export default router;
