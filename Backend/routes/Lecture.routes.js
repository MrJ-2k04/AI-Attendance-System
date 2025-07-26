const express = require('express');
const router = express.Router();
const { lectureController } = require('../controllers');

router.post('/', lectureController.create);
router.get('/', lectureController.getAll);
router.get('/:id', lectureController.getById);
router.put('/:id', lectureController.update);
router.delete('/:id', lectureController.remove);
router.post('/:id/generate', lectureController.generateAttendance);

module.exports = router;
