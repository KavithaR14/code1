import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSearch, FiEdit, FiUser, FiUsers, FiHome } from 'react-icons/fi';
import { FaChalkboardTeacher, FaPercentage } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import './ClassManagement.css';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    teacher: '',
    capacity: 30,
    currentStudents: 25
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalCapacity: 0,
    totalStudents: 0,
    utilizationRate: 0
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/class');
      const data = await res.json();
      setClasses(data);
      
      // Calculate statistics
      const totalClasses = data.length;
      const totalCapacity = data.reduce((sum, cls) => sum + cls.capacity, 0);
      const totalStudents = data.reduce((sum, cls) => sum + cls.currentStudents, 0);
      const utilizationRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
      
      setStats({
        totalClasses,
        totalCapacity,
        totalStudents,
        utilizationRate
      });
      
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch classes');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'currentStudents' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddClass = async () => {
    try {
      if (!formData.name || !formData.teacher) {
        toast.error('Class name and teacher are required');
        return;
      }
      
      if (formData.currentStudents > formData.capacity) {
        toast.error('Students cannot exceed capacity');
        return;
      }

      const res = await fetch('http://localhost:5000/api/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setClasses([...classes, data]);
        resetForm();
        toast.success('Class added successfully');
        fetchClasses(); // Refresh data to update stats
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to add class');
      }
    } catch (err) {
      toast.error('Error adding class');
    }
  };

  const handleEditClass = async () => {
    try {
      if (!formData.name || !formData.teacher) {
        toast.error('Class name and teacher are required');
        return;
      }
      
      if (formData.currentStudents > formData.capacity) {
        toast.error('Students cannot exceed capacity');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/class/${currentClassId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedClass = await res.json();
        setClasses(classes.map(cls => cls._id === currentClassId ? updatedClass : cls));
        resetForm();
        toast.success('Class updated successfully');
        fetchClasses(); // Refresh data to update stats
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update class');
      }
    } catch (err) {
      toast.error('Error updating class');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/class/${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setClasses(classes.filter(cls => cls._id !== id));
          toast.success('Class deleted successfully');
          fetchClasses(); // Refresh data to update stats
        } else {
          toast.error('Failed to delete class');
        }
      } catch (err) {
        toast.error('Error deleting class');
      }
    }
  };

  const handleEditClick = (cls) => {
    setFormData({
      name: cls.name,
      teacher: cls.teacher,
      capacity: cls.capacity,
      currentStudents: cls.currentStudents
    });
    setCurrentClassId(cls._id);
    setIsEditing(true);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      teacher: '',
      capacity: 30,
      currentStudents: 25
    });
    setIsAdding(false);
    setIsEditing(false);
    setCurrentClassId(null);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCapacityStatus = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'high';
    if (percentage >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className="container-scrol" >
    <div className="class-management-container">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="header">
        <h1>
          <FiHome className="header-icon" /> Class Management Dashboard
        </h1>
        <div className="breadcrumb">Admin Panel / Class Management</div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon total-classes">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.totalClasses}</h3>
            <p>Total Classes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon total-capacity">
            <FiUser />
          </div>
          <div className="stat-info">
            <h3>{stats.totalCapacity}</h3>
            <p>Total Capacity</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon total-students">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon utilization">
            <FaPercentage />
          </div>
          <div className="stat-info">
            <h3>{stats.utilizationRate}%</h3>
            <p>Utilization Rate</p>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search classes or teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="add-btn"
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
        >
          <FiPlus /> Add New Class
        </button>
      </div>

      {isAdding && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{isEditing ? 'Edit Class' : 'Add New Class'}</h2>
            
            <div className="form-group">
              <label>Class Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Mathematics 101"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Teacher</label>
              <input
                type="text"
                name="teacher"
                placeholder="Teacher's name"
                value={formData.teacher}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Current Students</label>
                <input
                  type="number"
                  name="currentStudents"
                  min="0"
                  max="50"
                  value={formData.currentStudents}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  max="50"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={isEditing ? handleEditClass : handleAddClass}
              >
                {isEditing ? 'Update Class' : 'Add Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading classes...</p>
        </div>
      ) : (
        <div className="table-container">
          {filteredClasses.length === 0 ? (
            <div className="no-results">
              <img src="/images/no-data.svg" alt="No classes found" />
              <h3>No classes found</h3>
              <p>Try adjusting your search or add a new class</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Capacity</th>
                  <th>Utilization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map(cls => {
                  const utilization = Math.round((cls.currentStudents / cls.capacity) * 100);
                  const status = getCapacityStatus(cls.currentStudents, cls.capacity);
                  
                  return (
                    <tr key={cls._id}>
                      <td>
                        <div className="class-name">
                          <div className="class-icon">
                            <FaChalkboardTeacher />
                          </div>
                          {cls.name}
                        </div>
                      </td>
                      <td>{cls.teacher}</td>
                      <td>{cls.currentStudents}</td>
                      <td>{cls.capacity}</td>
                      <td>
                        <div className="utilization-bar">
                          <div 
                            className={`fill ${status}`}
                            style={{ width: `${Math.min(100, utilization)}%` }}
                          ></div>
                          <span>{utilization}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${status}`}>
                          {status === 'high' ? 'Full' : status === 'medium' ? 'Moderate' : 'Available'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditClick(cls)}
                          >
                            <FiEdit />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(cls._id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default ClassManagement;