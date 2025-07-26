const express = require('express');
const router = express.Router();
const { teacherController } = require('../controllers');

router.post('/', teacherController.create);
router.get('/', teacherController.getAll);
router.get('/:id', teacherController.getById);
router.put('/:id', teacherController.update);
router.delete('/:id', teacherController.remove);

module.exports = router;
