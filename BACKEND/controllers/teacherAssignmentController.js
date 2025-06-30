const TeacherAssignment = require('../models/TeacherAssignment');
const Staff = require('../models/Staff');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Create Assignment
const createAssignment = asyncHandler(async (req, res) => {
  const { 
    teacherId, 
    class: className, 
    subject, 
    academicYear, 
    section, 
    isClassTeacher, 
    days, 
    period, 
    startDate, 
    endDate, 
    status,
    assignmentQuestions,
    totalMarks
  } = req.body;

  // Validate required fields
  if (!teacherId || !className || !subject || !academicYear || !startDate) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    res.status(400);
    throw new Error('Invalid teacher ID format');
  }

  const teacher = await Staff.findById(teacherId);    // This is correct
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  // Validate assignment questions if provided
  if (assignmentQuestions && assignmentQuestions.length > 0) {
    for (let question of assignmentQuestions) {
      if (!question.questionText || !question.questionType) {
        res.status(400);
        throw new Error('Each question must have questionText and questionType');
      }
      
      if (question.questionType === 'Multiple Choice' && 
          (!question.options || question.options.length < 2)) {
        res.status(400);
        throw new Error('Multiple choice questions must have at least 2 options');
      }
    }
  }

  const assignment = await TeacherAssignment.create({
    teacher: teacherId,
    class: className,
    subject,
    academicYear,
    section,
    isClassTeacher: isClassTeacher || false,
    days: days || [],
    period,
    startDate,
    endDate,
    status: status || 'Active',
    assignmentQuestions: assignmentQuestions || [],
    totalMarks: totalMarks || 0
  });

  await assignment.populate('teacher', 'username');
  res.status(201).json(assignment);
});

// Update Assignment
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await TeacherAssignment.findById(req.params.id);
  
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  if (req.body.assignmentQuestions && req.body.assignmentQuestions.length > 0) {
    for (let question of req.body.assignmentQuestions) {
      if (!question.questionText || !question.questionType) {
        res.status(400);
        throw new Error('Each question must have questionText and questionType');
      }
      
      if (question.questionType === 'Multiple Choice' && 
          (!question.options || question.options.length < 2)) {
        res.status(400);
        throw new Error('Multiple choice questions must have at least 2 options');
      }
    }
  }

  Object.assign(assignment, req.body);
  const updatedAssignment = await assignment.save();
  await updatedAssignment.populate('teacher', 'username');
  res.json(updatedAssignment);
});

// Get Assignments by Teacher
const getAssignmentsByTeacher = asyncHandler(async (req, res) => {
  const teacherId = req.params.teacherId;
  const { academicYear, class: className, subject, status, section } = req.query;

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    res.status(400);
    throw new Error('Invalid teacher ID');
  }

  let filter = { teacher: teacherId };
  if (academicYear) filter.academicYear = academicYear;
  if (className) filter.class = className;
  if (subject) filter.subject = subject;
  if (status) filter.status = status;
  if (section) filter.section = section;

  const assignments = await TeacherAssignment.find(filter)
    .populate('teacher', 'username')
    .sort({ academicYear: -1, class: 1, subject: 1 });

  res.json(assignments);
});

// Get All Assignments with filtering
const getAllAssignments = asyncHandler(async (req, res) => {
  const { academicYear, class: className, subject, status, section } = req.query;
  
  let filter = {};
  if (academicYear) filter.academicYear = academicYear;
  if (className) filter.class = className;
  if (subject) filter.subject = subject;
  if (status) filter.status = status;
  if (section) filter.section = section;

  const assignments = await TeacherAssignment.find(filter)
    .populate('teacher', 'username')
    .sort({ academicYear: -1, class: 1, subject: 1 });

  res.json(assignments);
});

// Get Assignment by ID
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await TeacherAssignment.findById(req.params.id)
    .populate('teacher', 'username');
    
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  res.json(assignment);
});

// Delete Assignment
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await TeacherAssignment.findById(req.params.id);
  
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  await assignment.deleteOne();
  res.json({ message: 'Assignment removed', id: req.params.id });
});

// Get Assignment Statistics
const getAssignmentStats = asyncHandler(async (req, res) => {
  const stats = await TeacherAssignment.aggregate([
    {
      $group: {
        _id: null,
        totalAssignments: { $sum: 1 },
        activeAssignments: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        completedAssignments: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        inactiveAssignments: {
          $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
        },
        totalMarks: { $sum: '$totalMarks' },
        averageMarks: { $avg: '$totalMarks' }
      }
    }
  ]);

  const subjectStats = await TeacherAssignment.aggregate([
    {
      $group: {
        _id: '$subject',
        count: { $sum: 1 },
        totalMarks: { $sum: '$totalMarks' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const classStats = await TeacherAssignment.aggregate([
    {
      $group: {
        _id: '$class',
        count: { $sum: 1 },
        totalMarks: { $sum: '$totalMarks' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    overall: stats[0] || {
      totalAssignments: 0,
      activeAssignments: 0,
      completedAssignments: 0,
      inactiveAssignments: 0,
      totalMarks: 0,
      averageMarks: 0
    },
    bySubject: subjectStats,
    byClass: classStats
  });
});

// Submit Assignment
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await TeacherAssignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  if (assignment.submittedStudents.includes(req.body.studentUsername)) {
    res.status(400);
    throw new Error('Already submitted');
  }

  assignment.submittedStudents.push(req.body.studentUsername);
  assignment.submissions.push({
    student: req.body.studentUsername,
    answers: req.body.answers,
    submittedAt: new Date()
  });

  await assignment.save();
  res.json({ message: 'Assignment submitted successfully' });
});

module.exports = {
  createAssignment,
  updateAssignment,
  getAssignmentsByTeacher,
  getAllAssignments,
  getAssignmentById,
  deleteAssignment,
  getAssignmentStats,
  submitAssignment
};