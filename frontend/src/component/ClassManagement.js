import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClassManagement.css';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    className: '',
    gradeLevel: '',
    academicYear: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        // Update existing class
        const response = await axios.put(`/api/classes/${selectedClass._id}`, formData);
        setClasses(classes.map(cls => cls._id === selectedClass._id ? response.data : cls));
      } else {
        // Create new class
        const response = await axios.post('/api/classes', formData);
        setClasses([...classes, response.data]);
      }
      setShowForm(false);
      setFormData({ className: '', gradeLevel: '', academicYear: '' });
      setSelectedClass(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/classes/${id}`);
      setClasses(classes.filter(cls => cls._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (cls) => {
    setSelectedClass(cls);
    setFormData({
      className: cls.className,
      gradeLevel: cls.gradeLevel,
      academicYear: cls.academicYear
    });
    setShowForm(true);
  };

  if (isLoading) return <div className="loading">Loading classes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="class-management">
      <h1>Class Management System</h1>
      
      <button 
        className="toggle-form-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Add New Class'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="class-form">
          <h2>{selectedClass ? 'Edit Class' : 'Create New Class'}</h2>
          <div className="form-group">
            <label>Class Name:</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Grade Level:</label>
            <input
              type="text"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Academic Year:</label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {selectedClass ? 'Update Class' : 'Create Class'}
          </button>
        </form>
      )}

      <div className="class-list">
        <h2>Class List</h2>
        {classes.length === 0 ? (
          <p>No classes found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Grade Level</th>
                <th>Academic Year</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => (
                <tr key={cls._id}>
                  <td>{cls.className}</td>
                  <td>{cls.gradeLevel}</td>
                  <td>{cls.academicYear}</td>
                  <td>{cls.studentCount || 0}</td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(cls)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(cls._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClassManagement;