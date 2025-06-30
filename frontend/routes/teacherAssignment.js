const express = require('express');
const router = express.Router();
const { getAssignment, submitAssignment } = require('../controllers/assignmentteachercontroller');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', submitAssignment);
router.get('/:id', getAssignment);

module.exports = router;
