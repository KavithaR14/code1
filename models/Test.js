const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionType: { type: String, enum: ['mcq', 'short-answer', 'essay'], required: true },
  questionText: { type: String, required: true },
  options: [{ text: String, isCorrect: Boolean }],
  points: { type: Number, default: 1 },
  correctAnswer: String
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  duration: { type: Number, required: true }, // in minutes
  availableFrom: { type: Date, required: true },
  availableTo: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', testSchema);