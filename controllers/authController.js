// const Students = require('../models/Students');
// const Admin = require('../models/User');
// const Staff = require('../models/Staff');
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken');

// const login = async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({
//       success: false,
//       message: 'Username and password are required'
//     });
//   }

//   try {
//     let user = null;
//     let role = '';

//     user = await Admin.findOne({ username });
//     if (user) role = 'admin';

//     if (!user) {
//       user = await Staff.findOne({ username });
//       if (user) role = 'teacher';
//     }

//     if (!user) {
//       user = await Students.findOne({ username });
//       if (user) role = 'student';
//     }

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     const token = jwt.sign(
//       {
//         id: user._id,
//         username: user.username,
//         role,
//         studentId: user.studentId || null
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     const userData = user.toObject();
//     delete userData.password;

//     res.json({
//       success: true,
//       token,
//       user: {
//         ...userData,
//         role
//       },
//       message: 'Login successful'
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during authentication'
//     });
//   }
// };

// module.exports = { login };
const Students = require('../models/Students');
const Admin = require('../models/User');
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  try {
    let user = null;
    let role = '';

    // Search for user in all collections with case-insensitive username
    user = await Admin.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (user) role = 'admin';

    if (!user) {
      user = await Staff.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (user) role = 'teacher';
    }

    if (!user) {
      user = await Students.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (user) role = 'student';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this username'
      });
    }

    // Compare passwords (handles both hashed and plaintext during development)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Password is hashed
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Password is plaintext (for development only)
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role,
        studentId: user.studentId || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from user data
    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      token,
      user: {
        ...userData,
        role
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = { login };