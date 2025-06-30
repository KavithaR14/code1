const Teacher = require('../models/Staff');
const asyncHandler = require('express-async-handler');

// Get all teachers
const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().sort({ createdAt: -1 });
  res.json(teachers);
});

// Get single teacher by ID
const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.json(teacher);
});

// Add teacher
const addTeacher = asyncHandler(async (req, res) => {
  const { username, email, phone, address, qualification, specialization, password, isActive } = req.body;

  const teacherExists = await Teacher.findOne({ email });
  if (teacherExists) {
    res.status(400);
    throw new Error('Teacher already exists');
  }

  const teacher = await Teacher.create({
    username,
    email,
    phone,
    address,
    qualification,
    specialization,
    password,
    isActive
  });

  res.status(201).json(teacher);
});

// Update teacher
const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json(updatedTeacher);
});

// Delete teacher
const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  await teacher.deleteOne();
  res.json({ message: 'Teacher removed' });
});

module.exports = {
  getTeachers,
  getTeacher,
  addTeacher,
  updateTeacher,
  deleteTeacher
};