const express = require('express');
const router = express.Router();
const seatingController = require('../controllers/seatingController');

// Get seating arrangement for a class
router.get('/:classId', seatingController.getSeatingArrangement);

// Create or update seating arrangement
router.put('/:classId', seatingController.updateSeatingArrangement);

// Clear seating arrangement
router.delete('/:classId', seatingController.clearSeatingArrangement);

module.exports = router;