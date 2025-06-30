const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .post(protect, attendanceController.markAttendance)
  .get(protect, attendanceController.getAllAttendance);

router.route('/:id')
  .put(protect, attendanceController.updateAttendance);

router.route('/teacher/:teacherId')
  .get(protect, attendanceController.getAttendanceByTeacher);

module.exports = router;