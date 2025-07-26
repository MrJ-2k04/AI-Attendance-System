import express from 'express';
import { subjectController } from '../controllers/index.js';

const router = express.Router();

router.post('/', subjectController.create);
router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.remove);

export default router;
