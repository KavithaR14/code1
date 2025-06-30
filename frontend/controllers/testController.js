const Test = require('../models/Test');

// Create a new test
exports.createTest = async (req, res) => {
  try {
    const { title, description, duration, availableFrom, availableTo, questions } = req.body;
    
    const test = new Test({
      title,
      description,
      duration,
      availableFrom: new Date(availableFrom),
      availableTo: new Date(availableTo),
      createdBy: req.user._id,
      questions
    });

    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all tests for staff view
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user._id });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available tests for students
exports.getAvailableTests = async (req, res) => {
  try {
    const now = new Date();
    const tests = await Test.find({
      isPublished: true,
      availableFrom: { $lte: now },
      availableTo: { $gte: now }
    }).select('-questions.options.isCorrect -questions.correctAnswer');
    
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single test for student view
exports.getTestForStudent = async (req, res) => {
  try {
    const test = await Test.findOne({
      _id: req.params.id,
      isPublished: true,
      availableFrom: { $lte: new Date() },
      availableTo: { $gte: new Date() }
    }).select('-questions.options.isCorrect -questions.correctAnswer');
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found or not available' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};