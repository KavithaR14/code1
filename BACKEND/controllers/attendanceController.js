const Attendance = require('../models/Attendance');
const Teacher = require('../models/Staff');
const asyncHandler = require('express-async-handler');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = asyncHandler(async (req, res) => {
  const { teacherId, date, status, checkIn, checkOut, notes } = req.body;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  // Check if attendance already marked for this date
  const existingAttendance = await Attendance.findOne({ 
    teacher: teacherId, 
    date: new Date(date).setHours(0, 0, 0, 0) 
  });

  if (existingAttendance) {
    res.status(400);
    throw new Error('Attendance already marked for this date');
  }

  const attendance = await Attendance.create({
    teacher: teacherId,
    date,
    status,
    checkIn,
    checkOut,
    notes
  });

  res.status(201).json(attendance);
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private
const updateAttendance = asyncHandler(async (req, res) => {
  const { status, checkIn, checkOut, notes } = req.body;

  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    res.status(404);
    throw new Error('Attendance record not found');
  }

  attendance.status = status || attendance.status;
  attendance.checkIn = checkIn || attendance.checkIn;
  attendance.checkOut = checkOut || attendance.checkOut;
  attendance.notes = notes || attendance.notes;

  const updatedAttendance = await attendance.save();

  res.json(updatedAttendance);
});

// @desc    Get attendance by teacher
// @route   GET /api/attendance/teacher/:teacherId
// @access  Private
const getAttendanceByTeacher = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let query = { teacher: req.params.teacherId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const attendance = await Attendance.find(query)
    .sort({ date: -1 })
    .populate('teacher', 'firstName lastName');

  res.json(attendance);
});

// @desc    Get all attendance
// @route   GET /api/attendance
// @access  Private
const getAllAttendance = asyncHandler(async (req, res) => {
  const { date, status } = req.query;

  let query = {};

  if (date) {
    query.date = new Date(date).setHours(0, 0, 0, 0);
  }

  if (status) {
    query.status = status;
  }

  const attendance = await Attendance.find(query)
    .sort({ date: -1 })
    .populate('teacher', 'firstName lastName');

  res.json(attendance);
});

module.exports = {
  markAttendance,
  updateAttendance,
  getAttendanceByTeacher,
  getAllAttendance
};