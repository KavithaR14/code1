const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

const studentRoutes = require('./routes/studentRoutes.js');
const teacherRoutes = require('./routes/teacherRoutes.js');
const authRoutes = require('./routes/UserRoutes.js');
const teacherAssignmentRoutes = require('./routes/teacherAssignmentRoutes.js');
const submissionRoutes = require('./routes/submissionRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');


dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teacherassignment', teacherAssignmentRoutes);
app.use('/api/submissions', submissionRoutes);
// app.use('/api/upload', uploadRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



