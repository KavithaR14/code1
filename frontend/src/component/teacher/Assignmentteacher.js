import React, { useState } from 'react';
import axios from 'axios';
import './TeacherView.css';

const Assignmentteacher = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Create axios instance with base URL
    const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/teacher',
    withCredentials: true
  });

  // Assignment state
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    class: '',
    subject: '',
    maxMarks: ''
  });

  // Exam state
  const [exam, setExam] = useState({
    examName: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    class: '',
    syllabus: ''
  });

  // Material state
  const [material, setMaterial] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    file: null
  });

  // Result state
  const [result, setResult] = useState({
    examName: '',
    class: '',
    subject: '',
    file: null
  });

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage('');
  };

  // Assignment handlers
  const handleAssignmentChange = (e) => {
    setAssignment({ ...assignment, [e.target.name]: e.target.value });
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/assignments', assignment);
      setMessage('Assignment created successfully!');
      setAssignment({
        title: '',
        description: '',
        dueDate: '',
        class: '',
        subject: '',
        maxMarks: ''
      });
    } catch (error) {
      setMessage(`Failed to create assignment: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Exam handlers
  const handleExamChange = (e) => {
    setExam({ ...exam, [e.target.name]: e.target.value });
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/exams', exam);
      setMessage('Exam scheduled successfully!');
      setExam({
        examName: '',
        subject: '',
        date: '',
        startTime: '',
        endTime: '',
        class: '',
        syllabus: ''
      });
    } catch (error) {
      setMessage(`Failed to schedule exam: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Material handlers
  const handleMaterialChange = (e) => {
    if (e.target.name === 'file') {
      setMaterial({ ...material, file: e.target.files[0] });
    } else {
      setMaterial({ ...material, [e.target.name]: e.target.value });
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!material.file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', material.title);
    formData.append('description', material.description);
    formData.append('class', material.class);
    formData.append('subject', material.subject);
    formData.append('file', material.file);

    try {
      const response = await api.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Material uploaded successfully!');
      setMaterial({
        title: '',
        description: '',
        class: '',
        subject: '',
        file: null
      });
    } catch (error) {
      setMessage(`Failed to upload material: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Result handlers
  const handleResultChange = (e) => {
    if (e.target.name === 'file') {
      setResult({ ...result, file: e.target.files[0] });
    } else {
      setResult({ ...result, [e.target.name]: e.target.value });
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!result.file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('examName', result.examName);
    formData.append('class', result.class);
    formData.append('subject', result.subject);
    formData.append('file', result.file);

    try {
      const response = await api.post('/results', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Results uploaded successfully!');
      setResult({
        examName: '',
        class: '',
        subject: '',
        file: null
      });
    } catch (error) {
      setMessage(`Failed to upload results: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-portal">
      <h1>Teacher Portal</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => handleTabChange('assignments')}
        >
          Create Assignment
        </button>
        <button 
          className={activeTab === 'exams' ? 'active' : ''}
          onClick={() => handleTabChange('exams')}
        >
          Schedule Exam
        </button>
        <button 
          className={activeTab === 'materials' ? 'active' : ''}
          onClick={() => handleTabChange('materials')}
        >
          Upload Materials
        </button>
        <button 
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => handleTabChange('results')}
        >
          Upload Results
        </button>
      </div>
      
      {message && <div className="message">{message}</div>}
      
      <div className="tab-content">
        {activeTab === 'assignments' && (
          <form onSubmit={handleAssignmentSubmit}>
            <h2>Create Assignment</h2>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={assignment.title}
                onChange={handleAssignmentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={assignment.description}
                onChange={handleAssignmentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Due Date:</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={assignment.dueDate}
                onChange={handleAssignmentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Class:</label>
              <input
                type="text"
                name="class"
                value={assignment.class}
                onChange={handleAssignmentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={assignment.subject}
                onChange={handleAssignmentChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Max Marks:</label>
              <input
                type="number"
                name="maxMarks"
                value={assignment.maxMarks}
                onChange={handleAssignmentChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </form>
        )}
        
        {activeTab === 'exams' && (
          <form onSubmit={handleExamSubmit}>
            <h2>Schedule Exam</h2>
            <div className="form-group">
              <label>Exam Name:</label>
              <input
                type="text"
                name="examName"
                value={exam.examName}
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={exam.subject}
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={exam.date}
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="time"
                name="startTime"
                value={exam.startTime}
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input
                type="time"
                name="endTime"
                value={exam.endTime}
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Class:</label>
              <input
                type="text"
                name="class"
                value={exam.class}
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Syllabus:</label>
              <textarea
                name="syllabus"
                value={exam.syllabus}
                onChange={handleExamChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Exam'}
            </button>
          </form>
        )}
        
        {activeTab === 'materials' && (
          <form onSubmit={handleMaterialSubmit} encType="multipart/form-data">
            <h2>Upload Study Material</h2>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={material.title}
                onChange={handleMaterialChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={material.description}
                onChange={handleMaterialChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Class:</label>
              <input
                type="text"
                name="class"
                value={material.class}
                onChange={handleMaterialChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={material.subject}
                onChange={handleMaterialChange}
                required
              />
            </div>
            <div className="form-group">
              <label>File:</label>
              <input
                type="file"
                name="file"
                onChange={handleMaterialChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </form>
        )}
        
        {activeTab === 'results' && (
          <form onSubmit={handleResultSubmit} encType="multipart/form-data">
            <h2>Upload Exam Results</h2>
            <div className="form-group">
              <label>Exam Name:</label>
              <input
                type="text"
                name="examName"
                value={result.examName}
                onChange={handleResultChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Class:</label>
              <input
                type="text"
                name="class"
                value={result.class}
                onChange={handleResultChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={result.subject}
                onChange={handleResultChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Result File (CSV/Excel):</label>
              <input
                type="file"
                name="file"
                onChange={handleResultChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Results'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Assignmentteacher;