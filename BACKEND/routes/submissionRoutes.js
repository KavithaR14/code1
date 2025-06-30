const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authController = require('../controllers/authController');

// Protect all routes
router.use(authController.protect);

// Student submission route
router.post(
  '/:assignmentId/submit',
  submissionController.submitAssignment
);

// Teacher routes
router.use(authController.restrictTo('teacher'));

router.get(
  '/assignment/:assignmentId',
  submissionController.getSubmissionsForAssignment
);

router.patch(
  '/:id/grade',
  submissionController.gradeSubmission
);

module.exports = router;