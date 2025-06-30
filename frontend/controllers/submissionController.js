const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.submitAssignment = catchAsync(async (req, res, next) => {
  const { assignmentId } = req.params;
  const { answers } = req.body;
  const studentId = req.user.id;

  // 1) Check if assignment exists
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  // 2) Check if due date has passed
  if (new Date(assignment.endDate) < new Date()) {
    return next(new AppError('The due date for this assignment has passed', 400));
  }

  // 3) Check if already submitted
  const existingSubmission = await Submission.findOne({
    assignment: assignmentId,
    student: studentId
  });

  if (existingSubmission) {
    return next(new AppError('You have already submitted this assignment', 400));
  }

  // 4) Create submission
  const submission = await Submission.create({
    assignment: assignmentId,
    student: studentId,
    answers,
    submissionDate: new Date()
  });

  res.status(201).json({
    status: 'success',
    data: {
      submission
    }
  });
});

// ... rest of your controller methods

exports.getSubmission = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id)
    .populate('assignment')
    .populate('student', 'name email');

  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});

exports.getSubmissionsForAssignment = catchAsync(async (req, res, next) => {
  const submissions = await Submission.find({ assignment: req.params.assignmentId })
    .populate('student', 'name email')
    .sort('-submissionDate');

  res.status(200).json({
    status: 'success',
    results: submissions.length,
    data: {
      submissions
    }
  });
});

exports.gradeSubmission = catchAsync(async (req, res, next) => {
  const { grade, feedback } = req.body;

  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    {
      grade,
      feedback,
      graded: true,
      gradedDate: new Date()
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});