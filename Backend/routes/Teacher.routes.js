import express from 'express';
import { teacherController } from '../controllers/index.js';
import idValidator from '../middlewares/idValidator.js';

const router = express.Router();

router.post('/', teacherController.create);
router.get('/', teacherController.getAll);
router.get('/:id', idValidator, teacherController.getById);
router.put('/:id', idValidator, teacherController.update);
router.delete('/:id', idValidator, teacherController.remove);

export default router;
