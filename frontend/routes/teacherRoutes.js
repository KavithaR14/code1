const express = require('express');
const router = express.Router();
const { 
  getTeachers, 
  getTeacher, 
  addTeacher, 
  updateTeacher, 
  deleteTeacher 
} = require('../controllers/teacherController');

// Routes
router.get('/', getTeachers);
router.get('/:id', getTeacher);
router.post('/', addTeacher);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;