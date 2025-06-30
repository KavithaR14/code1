const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

exports.getAssignments = async (req, res) => {
  const { academicYear, class: classFilter, subject, status } = req.query;

  const filter = {};
  if (academicYear) filter.academicYear = academicYear;
  if (classFilter) filter.class = classFilter;
  if (subject) filter.subject = subject;

  try {
    const assignments = await Assignment.find(filter).populate('teacher', 'username');

    const submissions = await Submission.find({ studentId: req.user._id });
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assignmentId.toString()] = 'Submitted';
    });

    const enrichedAssignments = assignments.map(assign => ({
      ...assign.toObject(),
      submissionStatus: submissionMap[assign._id.toString()] || 'Not Submitted'
    }));

    res.json({ assignments: enrichedAssignments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

exports.submitAssignment = async (req, res) => {
  const { assignmentId, answers, submissionDate } = req.body;

  try {
    const alreadySubmitted = await Submission.findOne({ assignmentId, studentId: req.user._id });
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    const submission = new Submission({
      assignmentId,
      studentId: req.user._id,
      answers,
      submissionDate
    });

    await submission.save();
    res.status(200).json({ message: 'Submission successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting assignment' });
  }
};
