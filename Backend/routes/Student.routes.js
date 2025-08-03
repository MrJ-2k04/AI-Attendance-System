import express from 'express';
import { studentController } from '../controllers/index.js';
import idValidator from '../middlewares/idValidator.js';

const router = express.Router();

router.post('/', studentController.create);
router.get('/', studentController.getAll);
router.get('/:id', idValidator, studentController.getById);
router.put('/:id', idValidator, studentController.update);
router.delete('/:id', idValidator, studentController.remove);
router.delete('/', studentController.removeAll);

export default router;
