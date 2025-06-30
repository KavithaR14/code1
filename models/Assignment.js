const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  questionType: {
    type: String,
    enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Long Answer', 'Fill in the Blanks'],
    required: [true, 'Question type is required']
  },
  options: {
    type: [String],
    required: function() {
      return this.questionType === 'Multiple Choice';
    }
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [1, 'Marks must be at least 1']
  },
  correctAnswer: {
    type: String,
    required: function() {
      return this.questionType !== 'Fill in the Blanks';
    }
  }
});

const assignmentSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Teacher reference is required']
  },
  class: {
    type: Number,
    required: [true, 'Class is required'],
    min: [1, 'Class must be at least 1'],
    max: [12, 'Class cannot be higher than 12']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    uppercase: true,
    enum: ['A', 'B', 'C', 'D']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}$/, 'Academic year must be 4 digits']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
      message: 'End date must be in the future'
    }
  },
  assignmentQuestions: {
    type: [questionSchema],
    required: [true, 'Questions are required'],
    validate: {
      validator: function(value) {
        return value.length > 0;
      },
      message: 'At least one question is required'
    }
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks are required'],
    min: [1, 'Total marks must be at least 1']
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total marks before saving
assignmentSchema.pre('save', function(next) {
  if (this.isModified('assignmentQuestions')) {
    this.totalMarks = this.assignmentQuestions.reduce((sum, question) => {
      return sum + (question.marks || 0);
    }, 0);
  }
  this.updatedAt = Date.now();
  next();
});

// Add virtual for days remaining
assignmentSchema.virtual('daysRemaining').get(function() {
  return Math.ceil((this.endDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Indexes for better performance
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ class: 1, section: 1 });
assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ endDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);