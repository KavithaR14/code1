// // models/Students.js
// const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose);
// const bcrypt = require('bcryptjs');

// const studentsSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   age: { type: Number, required: true, min: 5, max: 25 },
//   studentClass: { type: String, required: true },
//   section: { type: String, required: true },
//   rollNumber: { type: Number, required: true },
//   gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
//   birthdate: { type: Date, required: true },
//   address: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   image: { type: String },
//   password: { type: String, required: true },
//   role: { type: String, default: 'student', enum: ['student', 'admin'] },
//   studentId: { type: Number, unique: true }
// });

// // Hash password before saving
// studentsSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// // Method to compare passwords
// studentsSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Add validation for unique rollNumber per class and section
// studentsSchema.index({ studentClass: 1, section: 1, rollNumber: 1 }, { unique: true });

// studentsSchema.plugin(AutoIncrement, { inc_field: 'studentId' });

// module.exports = mongoose.model('Students', studentsSchema);

const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const studentsSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  age: { type: Number, required: true, min: 5, max: 25 },
  studentClass: { type: String, required: true },
  section: { type: String, required: true },
  rollNumber: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  birthdate: { type: Date, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  image: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'student', enum: ['student', 'admin'] },
  studentId: { type: Number, unique: true }
}, { timestamps: true });

// Hash password before saving
studentsSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
studentsSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add validation for unique rollNumber per class and section
studentsSchema.index({ studentClass: 1, section: 1, rollNumber: 1 }, { unique: true });

studentsSchema.plugin(AutoIncrement, { inc_field: 'studentId' });

module.exports = mongoose.model('Students', studentsSchema);