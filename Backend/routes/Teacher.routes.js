import express from 'express';
import { teacherController } from '../controllers/index.js';

const router = express.Router();

router.post('/', teacherController.create);
router.get('/', teacherController.getAll);
router.get('/:id', teacherController.getById);
router.put('/:id', teacherController.update);
router.delete('/:id', teacherController.remove);

export default router;
