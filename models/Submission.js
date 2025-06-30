const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    answer: {
      type: String
    },
    attachedFile: {
      fileName: String,
      filePath: String,
      fileUrl: String
    }
  }],
  submissionDate: {
    type: Date,
    default: Date.now
  },
  graded: {
    type: Boolean,
    default: false
  },
  grade: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String
  },
  gradedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SubmissionSchema.index({ assignment: 1 });
SubmissionSchema.index({ student: 1 });
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);