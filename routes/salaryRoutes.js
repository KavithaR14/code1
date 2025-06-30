const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { protect, admin } = require('../middlewares/auth');

router.route('/')
  .post(protect, admin, salaryController.createSalary)
  .get(protect, admin, salaryController.getAllSalaries);

router.route('/:id')
  .put(protect, admin, salaryController.updateSalary);

router.route('/:id/pay')
  .put(protect, admin, salaryController.processSalaryPayment);

router.route('/teacher/:teacherId')
  .get(protect, salaryController.getSalaryByTeacher);

module.exports = router;