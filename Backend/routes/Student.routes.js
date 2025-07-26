import express from 'express';
import { studentController } from '../controllers/index.js';

const router = express.Router();

router.post('/', studentController.create);
router.get('/', studentController.getAll);
router.get('/:id', studentController.getById);
router.put('/:id', studentController.update);
router.delete('/:id', studentController.remove);

export default router;
