import React, { useState } from 'react';
import { FaCalendarAlt, FaBook, FaUserGraduate, FaChartBar, FaClipboardList } from 'react-icons/fa';
import './Academicinfo.css';

const Academicinfo = () => {
  const [activeTab, setActiveTab] = useState('timetable');

  // Sample data - in a real app, this would come from an API
  const timetableData = [
    { day: 'Monday', subjects: ['Math (9-10 AM)', 'Science (11-12 PM)', 'English (1-2 PM)'] },
    { day: 'Tuesday', subjects: ['History (9-10 AM)', 'Math (11-12 PM)', 'PE (1-2 PM)'] },
    { day: 'Wednesday', subjects: ['Science (9-10 AM)', 'English (11-12 PM)', 'Art (1-2 PM)'] },
    { day: 'Thursday', subjects: ['Math (9-10 AM)', 'Geography (11-12 PM)', 'Music (1-2 PM)'] },
    { day: 'Friday', subjects: ['English (9-10 AM)', 'Science (11-12 PM)', 'Drama (1-2 PM)'] },
  ];

  const subjectDetails = [
    { name: 'Mathematics', teacher: 'Mr. Smith', room: 'B201', credits: 4 },
    { name: 'Science', teacher: 'Ms. Johnson', room: 'Lab 3', credits: 4 },
    { name: 'English', teacher: 'Mrs. Williams', room: 'A105', credits: 3 },
    { name: 'History', teacher: 'Mr. Brown', room: 'B102', credits: 3 },
    { name: 'Physical Education', teacher: 'Coach Taylor', room: 'Gym', credits: 2 },
  ];

  const attendanceRecords = [
    { month: 'January', present: 18, absent: 2, percentage: 90 },
    { month: 'February', present: 16, absent: 4, percentage: 80 },
    { month: 'March', present: 20, absent: 0, percentage: 100 },
    { month: 'April', present: 17, absent: 3, percentage: 85 },
  ];

  const gradeReports = [
    { subject: 'Mathematics', grade: 'A', comments: 'Excellent performance' },
    { subject: 'Science', grade: 'B+', comments: 'Good, but needs more lab practice' },
    { subject: 'English', grade: 'A-', comments: 'Strong writing skills' },
    { subject: 'History', grade: 'B', comments: 'Participate more in discussions' },
  ];

  const academicCalendar = [
    { date: 'Sep 5', event: 'First day of school' },
    { date: 'Oct 10-11', event: 'Mid-term exams' },
    { date: 'Nov 25-27', event: 'Thanksgiving break' },
    { date: 'Dec 18-Jan 2', event: 'Winter break' },
    { date: 'Mar 15-19', event: 'Spring break' },
    { date: 'May 20-24', event: 'Final exams' },
    { date: 'Jun 5', event: 'Last day of school' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'timetable':
        return (
          <div className="timetable-container">
            <h3>Weekly Class Schedule</h3>
            <div className="timetable-grid">
              {timetableData.map((dayData, index) => (
                <div key={index} className="timetable-day">
                  <div className="day-header">{dayData.day}</div>
                  <ul>
                    {dayData.subjects.map((subject, subIndex) => (
                      <li key={subIndex}>{subject}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case 'subjects':
        return (
          <div className="subjects-container">
            <h3>Subject Details</h3>
            <div className="subjects-grid">
              {subjectDetails.map((subject, index) => (
                <div key={index} className="subject-card">
                  <h4>{subject.name}</h4>
                  <p><strong>Teacher:</strong> {subject.teacher}</p>
                  <p><strong>Room:</strong> {subject.room}</p>
                  <p><strong>Credits:</strong> {subject.credits}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="attendance-container">
            <h3>Attendance Records</h3>
            <div className="attendance-chart">
              {attendanceRecords.map((record, index) => (
                <div key={index} className="attendance-month">
                  <div className="month-name">{record.month}</div>
                  <div className="attendance-bar-container">
                    <div 
                      className="attendance-bar" 
                      style={{ width: `${record.percentage}%` }}
                    ></div>
                  </div>
                  <div className="attendance-stats">
                    {record.percentage}% ({record.present}/{record.present + record.absent})
                  </div>
                </div>
              ))}
            </div>
            <div className="attendance-summary">
              <h4>Overall Attendance: 89%</h4>
              <p>Present: 71 days | Absent: 9 days</p>
            </div>
          </div>
        );
      case 'grades':
        return (
          <div className="grades-container">
            <h3>Grade Reports</h3>
            <div className="grades-table">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Grade</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeReports.map((report, index) => (
                    <tr key={index}>
                      <td>{report.subject}</td>
                      <td className={`grade-${report.grade.replace('+', 'plus').replace('-', 'minus')}`}>
                        {report.grade}
                      </td>
                      <td>{report.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="gpa-summary">
              <h4>Current GPA: 3.6</h4>
              <p>Honor Roll: Eligible</p>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="calendar-container">
            <h3>Academic Calendar 2023-2024</h3>
            <div className="calendar-events">
              {academicCalendar.map((event, index) => (
                <div key={index} className="calendar-event">
                  <div className="event-date">{event.date}</div>
                  <div className="event-name">{event.event}</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="academic-info-container">
      <div className="academic-tabs">
        <button
          className={activeTab === 'timetable' ? 'active' : ''}
          onClick={() => setActiveTab('timetable')}
        >
          <FaCalendarAlt className="tab-icon" />
          My Timetable
        </button>
        <button
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          <FaBook className="tab-icon" />
          Subject Details
        </button>
        <button
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          <FaUserGraduate className="tab-icon" />
          Attendance Record
        </button>
        <button
          className={activeTab === 'grades' ? 'active' : ''}
          onClick={() => setActiveTab('grades')}
        >
          <FaChartBar className="tab-icon" />
          Grade Reports
        </button>
        <button
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          <FaClipboardList className="tab-icon" />
          Academic Calendar
        </button>
      </div>
      
      <div className="academic-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Academicinfo;