import React, { useState, useEffect } from 'react';
import {
  FaHome, FaClipboardCheck, FaBullhorn, FaUserGraduate, FaPoll,
  FaChalkboardTeacher, FaUserFriends, FaSchool, FaBell,
  FaSearch, FaCog, FaBook, FaMoneyBillWave,
  FaChevronDown, FaChevronRight, FaList, FaSignOutAlt
} from 'react-icons/fa';
import './Sidebar.css';

import Academicinfo from '../students/Academicinfo';
import StudentManagement from '../students/StudentManagement';
import Assignmentteacher from '../teacher/Assignmentteacher';
import TeacherAssignment from '../teacher/TeacherAssignment';
import StaffManagement from '../teacher/Staffmanagement';
import StudentAssignment from '../students/StudentAssignment';
import TestForm from '../teacher/TestForm';
import ClassManagement from '../ClassManagement';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userData, setUserData] = useState({ username: '', role: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    setUserData({ username: username || 'User', role: role || 'student' });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const getMenuItems = () => {
    const studentItems = [
      { name: 'Dashboard', icon: <FaHome /> },
      { name: 'Academic Information', icon: <FaPoll />, component: Academicinfo },
      {
        name: 'Assignments & Exams',
        icon: <FaClipboardCheck />,
        subItems: [
          { name: 'Assignment', component: StudentAssignment },
        ]
      },
      { name: 'Communication', icon: <FaBullhorn /> },
      { name: 'Personal Profile', icon: <FaUserGraduate /> },
      { name: 'Fee & Payment', icon: <FaMoneyBillWave /> },
      { name: 'Parent Portal', icon: <FaUserFriends /> },
    ];

    const adminItems = [
      { name: 'Dashboard', icon: <FaHome /> },
      {
        name: 'Student Management',
        icon: <FaUserGraduate />,
        subItems: [
          { name: 'Add Student', component: StudentManagement },
          { name: 'Student List', component: StudentManagement },
          { name: 'Attendance' }
        ]
      },
      {
        name: 'Staff Management',
        icon: <FaChalkboardTeacher />,
        subItems: [
          { name: 'Add Teacher', component: StaffManagement },
          { name: 'Add Test', component: TestForm }
        ]
      },
      {
        name: 'Academic Management',
        icon: <FaPoll />,
        subItems: [
          { name: 'Classes' },
          { name: 'Subjects' },
          { name: 'Timetable' }
        ]
      },
      { name: 'Financial Management', icon: <FaMoneyBillWave /> },
      { name: 'Communication', icon: <FaBullhorn /> },
      { name: 'Reports & Analytics', icon: <FaPoll /> },
      { name: 'System Settings', icon: <FaCog /> },
    ];

    const teacherItems = [
      { name: 'Dashboard', icon: <FaHome /> },
      { name: 'Class Management', icon: <FaSchool />, component: ClassManagement },
      {
        name: 'Assessment',
        icon: <FaBook />,
        subItems: [
          { name: 'Add Assignment', component: TeacherAssignment },
          { name: 'Add Test', component: TestForm }
        ]
      },
      { name: 'Grading', icon: <FaPoll /> },
      { name: 'Attendance Management', icon: <FaClipboardCheck /> },
      { name: 'Communication', icon: <FaBullhorn /> },
    ];

    switch (userData.role) {
      case 'admin':
        return adminItems;
      case 'teacher':
        return teacherItems;
      case 'student':
      default:
        return studentItems;
    }
  };

  const getActiveComponent = () => {
    const menuItems = getMenuItems();

    if (activeItem === 'Dashboard') return (
      <div className="dashboard-card">
        <h3>Welcome {userData.username}</h3>
        <p>Role: {userData.role}</p>
      </div>
    );

    const mainItem = menuItems.find(item => item.name === activeItem);
    if (mainItem?.component) return <mainItem.component />;

    for (const item of menuItems) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.name === activeItem);
        if (subItem?.component) return <subItem.component />;
      }
    }

    return (
      <div className="dashboard-card">
        <h3>{activeItem} Content</h3>
        <p>This section displays {activeItem} related content.</p>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar-wrapper">
        <div className="sidebar">
          <div className="sidebar-logo">
            {userData.role.toUpperCase()}
          </div>
          {/* <div className="sidebar-user-info">
            <img src="https://via.placeholder.com/50" alt="user" />
            <div>
              <p className="sidebar-username">{userData.username}</p>
              <p className="sidebar-user-role">{userData.role}</p>
            </div>
          </div> */}

          <nav>
            <ul>
              {getMenuItems().map(item => (
                <React.Fragment key={item.name}>
                  <li
                    className={`${activeItem === item.name ? 'active' : ''} ${item.subItems ? 'has-submenu' : ''}`}
                    onClick={() => !item.subItems && setActiveItem(item.name)}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="text">{item.name}</span>
                    {item.subItems && (
                      <span
                        className="arrow"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(item.name);
                        }}
                      >
                        {expandedMenus[item.name] ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                    )}
                  </li>
                  {item.subItems && expandedMenus[item.name] && (
                    <ul className="submenu">
                      {item.subItems.map(subItem => (
                        <li
                          key={subItem.name}
                          className={activeItem === subItem.name ? 'active' : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveItem(subItem.name);
                          }}
                        >
                          <span className="text">{subItem.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </nav>

          <div className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>{activeItem}</h1>
          <div className="dashboard-header-actions">
            <div className="dashboard-search-box">
              <FaSearch className="dashboard-search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
            <div className="dashboard-notifications">
              <FaBell />
              <span className="dashboard-badge">3</span>
            </div>
            <div className="dashboard-user-menu">
              <img src="https://via.placeholder.com/40" alt="user" className="dashboard-user-avatar" />
            </div>
          </div>
        </header>

        <div className="dashboard-content-area">
          {getActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
