const mongoose = require('mongoose');

const teacherAssignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  section: {
    type: String
  },
  isClassTeacher: {
    type: Boolean,
    default: false
  },
  days: {
    type: [String],
    default: []
  },
  period: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed'],
    default: 'Active'
  },
  assignmentQuestions: [{
    questionText: String,
    questionType: {
      type: String,
      enum: ['Multiple Choice', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blanks']
    },
    marks: Number,
    options: [String],
    correctAnswer: String
  }],
  totalMarks: {
    type: Number,
    default: 0
  },
  submittedStudents: [String],
  submissions: [{
    student: String,
    answers: mongoose.Schema.Types.Mixed,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('TeacherAssignment', teacherAssignmentSchema);