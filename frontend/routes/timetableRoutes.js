const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// Get timetable for a class
router.get('/:classId', timetableController.getTimetable);

// Create or update timetable
router.put('/:classId', timetableController.updateTimetable);

// Delete timetable
router.delete('/:classId', timetableController.deleteTimetable);

module.exports = router;