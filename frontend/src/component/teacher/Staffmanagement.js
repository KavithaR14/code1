import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './staffmanagement.css';

// ✅ Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const StaffManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    specialization: '',
    password: '',
    isActive: true,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers');
      setTeachers(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teachers');
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to fetch teachers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (currentTeacher) {
        if (!payload.password) {
          delete payload.password;
        }
        await api.put(`/teachers/${currentTeacher._id}`, payload);
        toast.success('Teacher updated successfully');
      } else {
        await api.post('/teachers', payload);
        toast.success('Teacher added successfully');
      }

      setShowModal(false);
      fetchTeachers();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving teacher');
    }
  };

  const editTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      username: teacher.username,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      isActive: teacher.isActive,
      password: '',
    });
    setShowModal(true);
  };

  const deleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/teachers/${id}`);
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting teacher');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      phone: '',
      address: '',
      qualification: '',
      specialization: '',
      password: '',
      isActive: true,
    });
    setCurrentTeacher(null);
  };

  return (
    <div className="teacher-management-container">
      <div className="header">
        <h2>Teacher Management</h2>
        <button
          className="add-button"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Teacher
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading teachers...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="teacher-table-container">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>{teacher.username}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone}</td>
                  <td>{teacher.specialization}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        teacher.isActive ? 'active' : 'inactive'
                      }`}
                    >
                      {teacher.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => editTeacher(teacher)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTeacher(teacher._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{currentTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password {currentTeacher ? '(Leave blank to keep existing)' : '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    currentTeacher ? 'Leave blank to keep current password' : 'Enter password'
                  }
                  required={!currentTeacher}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="isActive"
                />
                <label htmlFor="isActive">Active</label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {currentTeacher ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;