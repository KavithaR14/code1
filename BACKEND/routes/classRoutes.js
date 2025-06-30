const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new class
router.post('/', async (req, res) => {
  const { name, teacher, capacity, currentStudents } = req.body;

  if (!name || !teacher || !capacity || !currentStudents) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newClass = new Class({ name, teacher, capacity, currentStudents });
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete class by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Class.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
