const Class = require('../models/Class');
const Student = require('../models/Students');

// Get all classes with student count
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'classId',
          as: 'students'
        }
      },
      {
        $project: {
          className: 1,
          gradeLevel: 1,
          academicYear: 1,
          studentCount: { $size: '$students' }
        }
      }
    ]);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get class details with students
exports.getClassDetails = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('students', 'firstName lastName studentId email');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  const { className, gradeLevel, academicYear } = req.body;
  
  try {
    const newClass = new Class({
      className,
      gradeLevel,
      academicYear
    });
    
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(updatedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    // Remove class reference from students
    await Student.updateMany(
      { classId: req.params.id },
      { $unset: { classId: "" } }
    );
    
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};