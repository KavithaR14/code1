import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    age: '', 
    studentClass: '', 
    section: '', 
    rollNumber: '', 
    gender: '', 
    birthdate: '', 
    address: '', 
    phoneNumber: '', 
    image: '', 
    password: '',
    role: 'student'
  });

  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const studentData = {
        ...form,
        role: 'student' // Ensure role is always set to student
      };

      if (editingId) {
        const { password, ...updateForm } = studentData; // Remove password when editing
        await axios.put(`http://localhost:5000/api/students/${editingId}`, updateForm);
      } else {
        await axios.post('http://localhost:5000/api/students', studentData);
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (student) => {
    setForm({ 
      ...student, 
      password: '' // Clear password on edit
    });
    setEditingId(student._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setIsLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setForm({ 
      username: '', 
      email: '', 
      age: '', 
      studentClass: '', 
      section: '', 
      rollNumber: '', 
      gender: '', 
      birthdate: '', 
      address: '', 
      phoneNumber: '', 
      image: '', 
      password: '',
      role: 'student'
    });
    setEditingId(null);
    setShowModal(false);
  };

 const filteredStudents = students.filter(student => {
  const searchLower = searchTerm.toLowerCase();
  return (
    (student.username && student.username.toLowerCase().includes(searchLower)) ||
    (student.email && student.email.toLowerCase().includes(searchLower)) ||
    (student.rollNumber && student.rollNumber.toString().includes(searchTerm))
  );
});

  return (
    <div className="student-management-container">
      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="student-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <input 
                    type="text" 
                    value={form.username} 
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                {!editingId && (
                  <div className="form-group">
                    <label>Password *</label>
                    <input 
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Age *</label>
                  <input 
                    type="number"
                    min="5"
                    max="25"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Class *</label>
                  <select 
                    value={form.studentClass}
                    onChange={(e) => setForm({ ...form, studentClass: e.target.value })}
                    required
                  >
                    <option value="">Select Class</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Section *</label>
                  <select 
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    required
                  >
                    <option value="">Select Section</option>
                    {['A','B','C','D'].map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Roll Number *</label>
                  <input 
                    type="number"
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select 
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Birthdate *</label>
                  <input 
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <input 
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Profile Image URL</label>
                  <input 
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : editingId ? 'Update Student' : 'Add Student'}
                </button>
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="management-header">
        <h1>Student Management System</h1>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search by username, email or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setShowModal(true)}>+ Add Student</button>
        </div>
      </header>

      {/* Table */}
      <div className="students-table-container">
        <h2>Student Records ({filteredStudents.length})</h2>
        {isLoading ? (
          <div className="loading-indicator">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="no-results">
            {searchTerm ? 'No matching students found' : 'No students available'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Username</th>
                <th>Email</th>
                <th>Password</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll No</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
             {filteredStudents.map(student => (
  <tr key={student._id}>
    <td>
      {student.image ? (
        <img src={student.image} alt="Profile" className="student-image" />
      ) : (
        <div className="student-image-placeholder">
          {(student.username && student.username.charAt(0)) || '?'}
        </div>
      )}
    </td>
    <td>{student.username || '-'}</td>
    <td>{student.email || '-'}</td>
    <td>{student.password ? student.password.replace(/./g, '*') : '-'}</td>
    <td>{student.phoneNumber || '-'}</td>
    <td>{student.gender || '-'}</td>
    <td>
      {student.birthdate ? new Date(student.birthdate).toLocaleDateString() : '-'}
    </td>
    <td>Class {student.studentClass || '-'}</td>
    <td>Sec {student.section || '-'}</td>
    <td>{student.rollNumber || '-'}</td>
    <td>{student.role || 'student'}</td>
    <td>
      <button onClick={() => handleEdit(student)}>✏️</button>
      <button onClick={() => handleDelete(student._id)}>🗑️</button>
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

export default StudentManagement;