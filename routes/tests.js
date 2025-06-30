const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/auth');

// Staff routes
router.post('/', authMiddleware, testController.createTest);
router.get('/', authMiddleware, testController.getAllTests);

// Student routes
router.get('/available', authMiddleware, testController.getAvailableTests);
router.get('/:id', authMiddleware, testController.getTestForStudent);

module.exports = router;