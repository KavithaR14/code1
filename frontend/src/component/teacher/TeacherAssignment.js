import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TeacherAssignment.css';

const ACADEMIC_YEARS = ['2023', '2024', '2025'];
const CLASS_LEVELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
const  SECTION  =[' Sec A','Sec B','Sec C','Sec D']
const PERIOD =['1','2' ,'3','4','5','6','7','8'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Completed'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const QUESTION_TYPES = ['Multiple Choice', 'Short Answer', 'Long Answer', 'True/False', 'Fill in the Blanks'];

const API_BASE_URL = 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const TeacherAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const { teacherId } = useParams();

  const initialFormState = {
    teacherId: teacherId || '',
    class: '',
    subject: '',
    academicYear: new Date().getFullYear().toString(),
    section: '',
    isClassTeacher: false,
    days: [],
    period: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active',
    assignmentQuestions: [{
      questionText: '',
      questionType: 'Multiple Choice',
      marks: 1,
      options: ['', '', '', ''], // For multiple choice
      correctAnswer: ''
    }],
    totalMarks: 0
  };

  const [formData, setFormData] = useState(initialFormState);
  const [filters, setFilters] = useState({
    academicYear: '',
    class: '',
    subject: '',
    status: ''
  });

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/teachers');
      setTeachers(res.data);
    } catch {
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const endpoint = teacherId 
        ? `/api/teacherassignment/teacher/${teacherId}` 
        : `/api/teacherassignment`;

      const res = await axios.get(`${endpoint}?${params.toString()}`);
      setAssignments(res.data);
    } catch {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [teacherId, filters]);

  useEffect(() => {
    fetchTeachers();
    fetchAssignments();
  }, [fetchAssignments]);

  // Calculate total marks whenever questions change
  useEffect(() => {
    const total = formData.assignmentQuestions.reduce((sum, question) => 
      sum + (parseInt(question.marks) || 0), 0
    );
    setFormData(prev => ({ ...prev, totalMarks: total }));
  }, [formData.assignmentQuestions]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDaySelection = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      assignmentQuestions: prev.assignmentQuestions.map((question, i) =>
        i === index ? { ...question, [field]: value } : question
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      assignmentQuestions: prev.assignmentQuestions.map((question, i) =>
        i === questionIndex 
          ? { 
              ...question, 
              options: question.options.map((option, j) => 
                j === optionIndex ? value : option
              )
            }
          : question
      )
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      assignmentQuestions: [
        ...prev.assignmentQuestions,
        {
          questionText: '',
          questionType: 'Multiple Choice',
          marks: 1,
          options: ['', '', '', ''],
          correctAnswer: ''
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.assignmentQuestions.length > 1) {
      setFormData(prev => ({
        ...prev,
        assignmentQuestions: prev.assignmentQuestions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = currentAssignment 
        ? `/api/teacherassignment/${currentAssignment._id}`
        : `/api/teacherassignment`;

      const method = currentAssignment ? 'put' : 'post';

      await axios[method](endpoint, formData);
      toast.success(`Assignment ${currentAssignment ? 'updated' : 'created'} successfully`);

      setShowModal(false);
      fetchAssignments();
      resetForm();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error occurred';
      toast.error(errorMsg);
    }
  };

  const editAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setFormData({
      teacherId: assignment.teacher._id,
      class: assignment.class,
      subject: assignment.subject,
      academicYear: assignment.academicYear,
      section: assignment.section,
      isClassTeacher: assignment.isClassTeacher,
      days: assignment.days,
      period: assignment.period,
      startDate: assignment.startDate?.split('T')[0],
      endDate: assignment.endDate?.split('T')[0] || '',
      status: assignment.status,
      assignmentQuestions: assignment.assignmentQuestions || [{
        questionText: '',
        questionType: 'Multiple Choice',
        marks: 1,
        options: ['', '', '', ''],
        correctAnswer: ''
      }],
      totalMarks: assignment.totalMarks || 0
    });
    setShowModal(true);
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm('Are you sure to delete this assignment?')) return;
    try {
      await axios.delete(`/api/teacherassignment/${id}`);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setCurrentAssignment(null);
  };

  const renderFilters = () => (
    <div className="filters">
      <select name="academicYear" value={filters.academicYear} onChange={handleFilterChange}>
        <option value="">All Years</option>
        {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      {!teacherId && (
        <>
          <select name="class" value={filters.class} onChange={handleFilterChange}>
            <option value="">All Classes</option>
            {CLASS_LEVELS.map(c => <option key={c} value={c}>Grade {c}</option>)}
          </select>

          <select name="subject" value={filters.subject} onChange={handleFilterChange}>
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      <select name="status" value={filters.status} onChange={handleFilterChange}>
        <option value="">All Status</option>
        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );

  const renderQuestionForm = (question, index) => (
    <div key={index} className="question-form">
      <div className="question-header">
        <h4>Question {index + 1}</h4>
        {formData.assignmentQuestions.length > 1 && (
          <button type="button" onClick={() => removeQuestion(index)} className="remove-question-btn">
            Remove
          </button>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Question Type</label>
          <select
            value={question.questionType}
            onChange={(e) => handleQuestionChange(index, 'questionType', e.target.value)}
          >
            {QUESTION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Marks</label>
          <input
            type="number"
            min="1"
            value={question.marks}
            onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Question Text</label>
        <textarea
          value={question.questionText}
          onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
          placeholder="Enter your question here..."
          rows={3}
          required
        />
      </div>

      {question.questionType === 'Multiple Choice' && (
        <div className="form-group">
          <label>Options</label>
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="option-input">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
                required
              />
            </div>
          ))}
          <div className="form-group">
            <label>Correct Answer</label>
            <select
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
            >
              <option value="">Select correct option</option>
              {question.options.map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  Option {optionIndex + 1}: {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {question.questionType === 'True/False' && (
        <div className="form-group">
          <label>Correct Answer</label>
          <select
            value={question.correctAnswer}
            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
          >
            <option value="">Select correct answer</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </div>
      )}

      {(question.questionType === 'Short Answer' || 
        question.questionType === 'Long Answer' || 
        question.questionType === 'Fill in the Blanks') && (
        <div className="form-group">
          <label>Sample Answer/Key Points</label>
          <textarea
            value={question.correctAnswer}
            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
            placeholder="Enter sample answer or key points for evaluation..."
            rows={2}
          />
        </div>
      )}
    </div>
  );

  const renderModal = () => (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h3>{currentAssignment ? 'Edit' : 'Add'} Assignment</h3>
          <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Assignment Info */}
          <div className="form-section">
            <h4>Assignment Details</h4>
            
            <div className="form-group">
              <label>Teacher</label>
              <select name="teacherId" value={formData.teacherId} onChange={handleInputChange} required disabled={!!teacherId}>
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.username}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Class</label>
                <select name="class" value={formData.class} onChange={handleInputChange} required>
                  <option value="">Select Class</option>
                  {CLASS_LEVELS.map(c => <option key={c} value={c}>Grade {c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange} required>
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Academic Year</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleInputChange} required>
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="form-group">
  <label>Section</label>
  <select name="classSection" value={formData.classSection} onChange={handleInputChange} required>
    {SECTION.map((y) => (
      <option key={y} value={y}>
        {y}
      </option>
    ))}
  </select>
</div>



            </div>

            <div className="form-group">
              <label>Days</label>
              <div className="days-selector">
                {DAYS_OF_WEEK.map(day => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={formData.days.includes(day)}
                      onChange={() => handleDaySelection(day)}
                    /> {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
            <div className="form-group">
  <label>Period</label>
  <input
    type="text"
    name="period"
    value={formData.period}
    onChange={handleInputChange}
    placeholder="Enter period (e.g., 1st, 2nd)"
    required
  />
</div>


              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="isClassTeacher"
                  name="isClassTeacher"
                  checked={formData.isClassTeacher}
                  onChange={handleInputChange}
                />
                <label htmlFor="isClassTeacher">Class Teacher</label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Questions Section */}
          <div className="form-section">
            <div className="questions-section-header">
              <h4>Assignment Questions</h4>
              <div className="total-marks">Total Marks: {formData.totalMarks}</div>
            </div>

            {formData.assignmentQuestions.map((question, index) => 
              renderQuestionForm(question, index)
            )}

            <button type="button" onClick={addQuestion} className="add-question-btn">
              + Add Question
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit">{currentAssignment ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAssignmentTable = () => {
    if (loading) return <div>Loading...</div>;
    if (!assignments.length) return <div>No assignments found</div>;

    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              {!teacherId && <th>Teacher</th>}
              <th>Class</th>
              <th>Subject</th>
              <th>Year</th>
              <th>Section</th>
              <th>Days</th>
              <th>Period</th>
              <th>Questions</th>
              <th>Total Marks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
        {assignments.map(assignment => (
  <tr key={assignment._id}>
    {!teacherId && <td>{assignment.teacher?.username || 'N/A'}</td>}
    <td>Grade {assignment.class}</td>
    <td>{assignment.subject}</td>
    <td>{assignment.academicYear}</td>
    <td>{assignment.section || '-'}</td>
    <td>{assignment.days?.join(', ') || '-'}</td>
    <td>{assignment.period || '-'}</td>
    <td className="questions-cell">
      {assignment.assignmentQuestions?.length > 0 ? (
        <details>
          <summary>{assignment.assignmentQuestions.length} Questions</summary>
          <div className="questions-preview">
            {assignment.assignmentQuestions.map((q, index) => (
              <div key={index} className="question-preview">
                <strong>Q{index + 1} ({q.marks} marks):</strong> {q.questionText.substring(0, 100)}...
              </div>
            ))}
          </div>
        </details>
      ) : '-'}
    </td>
    <td>{assignment.totalMarks || 0}</td>
    <td>{assignment.status}</td>
    <td>
      <button onClick={() => editAssignment(assignment)}>Edit</button>
      <button onClick={() => deleteAssignment(assignment._id)}>Delete</button>
    </td>
  </tr>
))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h2>{teacherId ? 'Teacher Assignments' : 'All Assignments'}</h2>
        <div className="assignment-actions">
          {renderFilters()}
          <button onClick={() => { resetForm(); setShowModal(true); }}>
            + Add Assignment
          </button>
        </div>
      </div>

      {renderAssignmentTable()}
      {showModal && renderModal()}
    </div>
  );
};

export default TeacherAssignment;