// BACKEND/migrations/migratePasswords.js
require('dotenv').config();
const mongoose = require('mongoose');
const Students = require('../models/Students');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const migrate = async () => {
  try {
    const students = await Students.find({});
    let updatedCount = 0;

    for (const student of students) {
      // Skip if already hashed
      if (student.password.startsWith('$2a$')) continue;
      
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(student.password, salt);
      await student.save();
      updatedCount++;
      console.log(`Updated password for ${student.username}`);
    }

    console.log(`Migration complete. Updated ${updatedCount} students.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrate();