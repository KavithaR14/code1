import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StudentAssignment.css';

// Constants
const API_BASE_URL = 'http://localhost:5000/api/teacherassignment';
const FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const StudentAssignment = () => {
  // State management
  const [state, setState] = useState({
    assignments: [],
    loading: true,
    showModal: false,
    selectedAssignment: null,
    answers: {},
    submissionStatus: {},
    uploadedFiles: {},
    uploading: false,
    error: null
  });

  const [filters, setFilters] = useState({
    academicYear: '',
    class: '',
    subject: '',
    status: ''
  });

  // Memoized filtered assignments
  const filteredAssignments = useMemo(() => {
    return state.assignments.filter(assignment => {
      return (
        (!filters.academicYear || assignment.academicYear === filters.academicYear) &&
        (!filters.class || assignment.class == filters.class) &&
        (!filters.subject || assignment.subject === filters.subject) &&
        (!filters.status || 
          (filters.status === 'Active' ? new Date(assignment.endDate) >= new Date() : 
           filters.status === 'Completed' ? new Date(assignment.endDate) < new Date() : true))
      );
    });
  }, [state.assignments, filters]);

  // Fetch assignments with error handling
  const fetchAssignments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await axiosInstance.get(`/?${params.toString()}`);
      const assignments = res.data.assignments || res.data;

      // Initialize state
      const initialAnswers = {};
      const initialSubmissionStatus = {};
      const initialUploadedFiles = {};
      
      assignments.forEach(assignment => {
        initialSubmissionStatus[assignment._id] = assignment.submissionStatus || 'Not Submitted';
        assignment.assignmentQuestions?.forEach((question, qIndex) => {
          initialAnswers[`${assignment._id}_${qIndex}`] = '';
          initialUploadedFiles[`${assignment._id}_${qIndex}`] = null;
        });
      });

      setState(prev => ({
        ...prev,
        assignments,
        answers: initialAnswers,
        submissionStatus: initialSubmissionStatus,
        uploadedFiles: initialUploadedFiles,
        loading: false
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch assignments';
      toast.error(errorMsg);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (assignmentId, questionIndex, value) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [`${assignmentId}_${questionIndex}`]: value
      }
    }));
  };

  const handleFileUpload = async (assignmentId, questionIndex, file) => {
    if (!file) {
      setState(prev => ({
        ...prev,
        uploadedFiles: {
          ...prev.uploadedFiles,
          [`${assignmentId}_${questionIndex}`]: null
        }
      }));
      return;
    }

    if (!FILE_TYPES.includes(file.type)) {
      toast.error('Please upload only images, PDF, text, or Word documents');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setState(prev => ({ ...prev, uploading: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignmentId);
      formData.append('questionIndex', questionIndex);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setState(prev => ({
        ...prev,
        uploadedFiles: {
          ...prev.uploadedFiles,
          [`${assignmentId}_${questionIndex}`]: {
            fileName: file.name,
            filePath: response.data.filePath,
            fileUrl: response.data.fileUrl
          }
        },
        uploading: false
      }));

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
      setState(prev => ({ ...prev, uploading: false }));
    }
  };

  const removeFile = (assignmentId, questionIndex) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: {
        ...prev.uploadedFiles,
        [`${assignmentId}_${questionIndex}`]: null
      }
    }));
  };

  const viewAssignmentDetails = (assignment) => {
    setState(prev => ({ ...prev, selectedAssignment: assignment, showModal: true }));
  };

  const submitAssignment = async (assignmentId) => {
    try {
      const assignment = state.assignments.find(a => a._id === assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      const submissionData = {
        assignmentId,
        answers: assignment.assignmentQuestions.map((question, index) => {
          const fileKey = `${assignmentId}_${index}`;
          const uploadedFile = state.uploadedFiles[fileKey];
          
          return {
            questionIndex: index,
            answer: state.answers[fileKey] || '',
            attachedFile: uploadedFile ? {
              fileName: uploadedFile.fileName,
              filePath: uploadedFile.filePath,
              fileUrl: uploadedFile.fileUrl
            } : null
          };
        }),
        submissionDate: new Date().toISOString()
      };

      const response = await axiosInstance.post('/submit', submissionData);
      
      if (response.status === 200) {
        toast.success('Assignment submitted successfully');
        setState(prev => ({
          ...prev,
          submissionStatus: {
            ...prev.submissionStatus,
            [assignmentId]: 'Submitted'
          },
          showModal: false
        }));
        fetchAssignments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    }
  };

  // Render functions
  const renderFilters = () => (
    <div className="filters">
      <select name="academicYear" value={filters.academicYear} onChange={handleFilterChange}>
        <option value="">All Years</option>
        {['2023', '2024', '2025'].map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <select name="class" value={filters.class} onChange={handleFilterChange}>
        <option value="">All Classes</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
          <option key={grade} value={grade}>Grade {grade}</option>
        ))}
      </select>

      <select name="subject" value={filters.subject} onChange={handleFilterChange}>
        <option value="">All Subjects</option>
        {['Math', 'Science', 'English', 'History', 'Geography'].map(subject => (
          <option key={subject} value={subject}>{subject}</option>
        ))}
      </select>

      <select name="status" value={filters.status} onChange={handleFilterChange}>
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Completed">Completed</option>
      </select>
    </div>
  );

  const renderAssignmentTable = () => {
    if (state.loading) return <div className="loading">Loading assignments...</div>;
    if (state.error) return <div className="error">{state.error}</div>;
    if (!filteredAssignments.length) return <div className="no-assignments">No assignments found</div>;

    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Class</th>
              <th>Due Date</th>
              <th>Questions</th>
              <th>Total Marks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map(assignment => (
              <tr key={assignment._id}>
                <td>{assignment.subject}</td>
                <td>{assignment.teacher?.username || 'N/A'}</td>
                <td>Grade {assignment.class} {assignment.section}</td>
                <td>
                  {assignment.endDate ? 
                    new Date(assignment.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 
                    'No due date'}
                </td>
                <td>{assignment.assignmentQuestions?.length || 0}</td>
                <td>{assignment.totalMarks || 0}</td>
                <td>
                  <span className={`status-badge ${state.submissionStatus[assignment._id]?.toLowerCase().replace(' ', '-')}`}>
                    {state.submissionStatus[assignment._id]}
                  </span>
                </td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => viewAssignmentDetails(assignment)}
                  >
                    View
                  </button>
                  {state.submissionStatus[assignment._id] !== 'Submitted' && (
                    <button 
                      className="submit-btn"
                      onClick={() => submitAssignment(assignment._id)}
                    >
                      Submit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderQuestionItem = (question, index, assignmentId) => {
    const answerKey = `${assignmentId}_${index}`;
    const fileKey = `${assignmentId}_${index}`;
    const uploadedFile = state.uploadedFiles[fileKey];
    const isSubmitted = state.submissionStatus[assignmentId] === 'Submitted';
    
    return (
      <div key={index} className="question-item">
        <div className="question-header">
          <h4>Question {index + 1} ({question.marks} marks)</h4>
          <div className={`question-type ${question.questionType.toLowerCase().replace(' ', '-')}`}>
            {question.questionType}
          </div>
        </div>
        
        <div className="question-text">{question.questionText}</div>
        
        {question.questionType === 'Multiple Choice' && (
          <div className="options">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="option">
                <input
                  type="radio"
                  id={`${answerKey}_${optIndex}`}
                  name={answerKey}
                  value={option}
                  checked={state.answers[answerKey] === option}
                  onChange={() => handleAnswerChange(assignmentId, index, option)}
                  disabled={isSubmitted}
                />
                <label htmlFor={`${answerKey}_${optIndex}`}>{option}</label>
              </div>
            ))}
          </div>
        )}
        
        {question.questionType === 'True/False' && (
          <div className="options">
            {['True', 'False'].map((value) => (
              <div key={value} className="option">
                <input
                  type="radio"
                  id={`${answerKey}_${value.toLowerCase()}`}
                  name={answerKey}
                  value={value}
                  checked={state.answers[answerKey] === value}
                  onChange={() => handleAnswerChange(assignmentId, index, value)}
                  disabled={isSubmitted}
                />
                <label htmlFor={`${answerKey}_${value.toLowerCase()}`}>{value}</label>
              </div>
            ))}
          </div>
        )}
        
        {(question.questionType === 'Short Answer' || 
          question.questionType === 'Long Answer' || 
          question.questionType === 'Fill in the Blanks') && (
          <div className="answer-section">
            <textarea
              value={state.answers[answerKey] || ''}
              onChange={(e) => handleAnswerChange(assignmentId, index, e.target.value)}
              placeholder="Type your answer here..."
              rows={question.questionType === 'Long Answer' ? 4 : 2}
              disabled={isSubmitted}
            />
            
            {(question.questionType === 'Short Answer' || question.questionType === 'Long Answer') && (
              <div className="file-upload-section">
                <div className="file-upload-header">
                  <span>📎 Attach File (Optional)</span>
                  <span className="file-info">Max 5MB - Images, PDF, Word, Text files</span>
                </div>
                
                {!uploadedFile ? (
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id={`file_${fileKey}`}
                      accept={FILE_TYPES.map(type => `.${type.split('/')[1]}`).join(',')}
                      onChange={(e) => handleFileUpload(assignmentId, index, e.target.files[0])}
                      disabled={isSubmitted || state.uploading}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor={`file_${fileKey}`} className="file-upload-label">
                      {state.uploading ? (
                        <span>🔄 Uploading...</span>
                      ) : (
                        <span>📁 Choose File</span>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="uploaded-file">
                    <div className="file-info-display">
                      <span className="file-icon">📄</span>
                      <span className="file-name" title={uploadedFile.fileName}>
                        {uploadedFile.fileName.length > 20 
                          ? `${uploadedFile.fileName.substring(0, 20)}...` 
                          : uploadedFile.fileName}
                      </span>
                      {!isSubmitted && (
                        <button 
                          type="button"
                          onClick={() => removeFile(assignmentId, index)}
                          className="remove-file-btn"
                          aria-label="Remove file"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                    <div className="file-actions">
                      <a 
                        href={uploadedFile.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-file-btn"
                      >
                        👁️ View File
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAssignmentModal = () => {
    if (!state.selectedAssignment) return null;

    const isSubmitted = state.submissionStatus[state.selectedAssignment._id] === 'Submitted';

    return (
      <div className="modal-overlay">
        <div className="modal-content large-modal">
          <div className="modal-header">
            <h3>{state.selectedAssignment.subject} Assignment</h3>
            <button 
              className="close-btn" 
              onClick={() => setState(prev => ({ ...prev, showModal: false }))}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          <div className="assignment-details">
            <div className="detail-row">
              <span className="detail-label">Teacher:</span>
              <span>{state.selectedAssignment.teacher?.username || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Class:</span>
              <span>Grade {state.selectedAssignment.class} {state.selectedAssignment.section}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Due Date:</span>
              <span>
                {state.selectedAssignment.endDate ? 
                  new Date(state.selectedAssignment.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'No due date'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Marks:</span>
              <span>{state.selectedAssignment.totalMarks || 0}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${state.submissionStatus[state.selectedAssignment._id]?.toLowerCase().replace(' ', '-')}`}>
                {state.submissionStatus[state.selectedAssignment._id]}
              </span>
            </div>
          </div>

          <div className="questions-section">
            <h4>Questions</h4>
            {state.selectedAssignment.assignmentQuestions?.map((question, index) => 
              renderQuestionItem(question, index, state.selectedAssignment._id)
            )}
          </div>

          <div className="modal-actions">
            <button 
              className="close-modal-btn"
              onClick={() => setState(prev => ({ ...prev, showModal: false }))}
            >
              Close
            </button>
            {!isSubmitted && (
              <button 
                onClick={() => submitAssignment(state.selectedAssignment._id)}
                className="submit-assignment-btn"
                disabled={state.uploading}
              >
                {state.uploading ? (
                  <>
                    <span className="spinner"></span> Uploading...
                  </>
                ) : (
                  'Submit Assignment'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="student-assignment-container">
      <div className="assignment-header">
        <h2>My Assignments</h2>
        <div className="assignment-actions">
          {renderFilters()}
        </div>
      </div>

      {renderAssignmentTable()}
      {state.showModal && renderAssignmentModal()}
    </div>
  );
};

export default StudentAssignment;