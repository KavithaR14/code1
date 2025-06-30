const Salary = require('../models/Salary');
const Teacher = require('../models/Staff');
const asyncHandler = require('express-async-handler');

// @desc    Create salary record
// @route   POST /api/salaries
// @access  Private/Admin
const createSalary = asyncHandler(async (req, res) => {
  const { teacherId, month, year, basicSalary, allowances, deductions, bonus, tax } = req.body;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  // Check if salary already exists for this month/year
  const existingSalary = await Salary.findOne({ 
    teacher: teacherId, 
    month, 
    year 
  });

  if (existingSalary) {
    res.status(400);
    throw new Error('Salary record already exists for this month/year');
  }

  const salary = await Salary.create({
    teacher: teacherId,
    month,
    year,
    basicSalary,
    allowances,
    deductions,
    bonus,
    tax
  });

  res.status(201).json(salary);
});

// @desc    Update salary record
// @route   PUT /api/salaries/:id
// @access  Private/Admin
const updateSalary = asyncHandler(async (req, res) => {
  const { basicSalary, allowances, deductions, bonus, tax, status, paymentDate, paymentMethod } = req.body;

  const salary = await Salary.findById(req.params.id);
  if (!salary) {
    res.status(404);
    throw new Error('Salary record not found');
  }

  salary.basicSalary = basicSalary || salary.basicSalary;
  salary.allowances = allowances || salary.allowances;
  salary.deductions = deductions || salary.deductions;
  salary.bonus = bonus || salary.bonus;
  salary.tax = tax || salary.tax;
  salary.status = status || salary.status;
  salary.paymentDate = paymentDate || salary.paymentDate;
  salary.paymentMethod = paymentMethod || salary.paymentMethod;

  const updatedSalary = await salary.save();

  res.json(updatedSalary);
});

// @desc    Get salary by teacher
// @route   GET /api/salaries/teacher/:teacherId
// @access  Private
const getSalaryByTeacher = asyncHandler(async (req, res) => {
  const { year } = req.query;

  let query = { teacher: req.params.teacherId };

  if (year) {
    query.year = year;
  }

  const salaries = await Salary.find(query)
    .sort({ year: -1, month: -1 })
    .populate('teacher', 'firstName lastName');

  res.json(salaries);
});

// @desc    Get all salaries
// @route   GET /api/salaries
// @access  Private/Admin
const getAllSalaries = asyncHandler(async (req, res) => {
  const { month, year, status } = req.query;

  let query = {};

  if (month) {
    query.month = month;
  }

  if (year) {
    query.year = year;
  }

  if (status) {
    query.status = status;
  }

  const salaries = await Salary.find(query)
    .sort({ year: -1, month: -1 })
    .populate('teacher', 'firstName lastName');

  res.json(salaries);
});

// @desc    Process salary payment
// @route   PUT /api/salaries/:id/pay
// @access  Private/Admin
const processSalaryPayment = asyncHandler(async (req, res) => {
  const { paymentDate, paymentMethod } = req.body;

  const salary = await Salary.findById(req.params.id);
  if (!salary) {
    res.status(404);
    throw new Error('Salary record not found');
  }

  salary.status = 'Paid';
  salary.paymentDate = paymentDate || Date.now();
  salary.paymentMethod = paymentMethod || 'Bank Transfer';

  const updatedSalary = await salary.save();

  res.json(updatedSalary);
});

module.exports = {
  createSalary,
  updateSalary,
  getSalaryByTeacher,
  getAllSalaries,
  processSalaryPayment
};