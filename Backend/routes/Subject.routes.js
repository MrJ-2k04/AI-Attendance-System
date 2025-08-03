import express from 'express';
import { subjectController } from '../controllers/index.js';
import idValidator from '../middlewares/idValidator.js';

const router = express.Router();

router.post('/', subjectController.create);
router.get('/', subjectController.getAll);
router.get('/:id', idValidator, subjectController.getById);
router.put('/:id', idValidator, subjectController.update);
router.delete('/:id', idValidator, subjectController.remove);

export default router;
