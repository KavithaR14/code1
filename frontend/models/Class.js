const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  classTeacher: { type: String, required: true },
  subject: { type: String, required: true },
  room: { type: String, required: true },
  capacity: { type: Number, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', ClassSchema);