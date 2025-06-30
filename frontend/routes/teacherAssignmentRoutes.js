const express = require('express');
const router = express.Router();
// Remove this line: const auth = require('../middleware/auth');
const teacherAssignmentController = require('../controllers/teacherAssignmentController');

// Update these routes by removing the auth middleware
router.post('/', teacherAssignmentController.createAssignment);
router.put('/:id', teacherAssignmentController.updateAssignment);
router.delete('/:id', teacherAssignmentController.deleteAssignment);
router.post('/:id/submit', teacherAssignmentController.submitAssignment);

// Keep these as they don't need auth
router.get('/', teacherAssignmentController.getAllAssignments);
router.get('/stats', teacherAssignmentController.getAssignmentStats);
router.get('/teacher/:teacherId', teacherAssignmentController.getAssignmentsByTeacher);
router.get('/:id', teacherAssignmentController.getAssignmentById);

module.exports = router;