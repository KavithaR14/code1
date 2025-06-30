const express = require('express');
const router = express.Router();
const staffController = require('../controllers/teacherController');
const { protect } = require('../middleware/auth'); // Optional authentication

// Routes
router.get('/', protect, staffController.getStaff);
router.get('/:id', protect, staffController.getSingleStaff);
router.post('/', protect, staffController.createStaff);
router.put('/:id', protect, staffController.updateStaff);
router.delete('/:id', protect, staffController.deleteStaff);

module.exports = router;

