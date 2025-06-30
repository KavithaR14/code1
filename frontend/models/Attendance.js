const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave', 'Half-Day'],
    default: 'Present'
  },
  checkIn: {
    type: String
  },
  checkOut: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Ensure one attendance record per teacher per day
AttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);