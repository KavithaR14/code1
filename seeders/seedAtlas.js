require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ Sample users with unique emails
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin'
  }
 
];

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');

    // 2. Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // 3. Hash passwords and insert users
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          username: user.username,
          email: user.email,
          password: hashedPassword,
          role: user.role
        };
      })
    );

    await User.insertMany(usersWithHashedPasswords);
    console.log('✅ Successfully seeded users:');
    console.table(sampleUsers.map(u => ({ username: u.username, email: u.email, role: u.role })));

    // 4. Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
