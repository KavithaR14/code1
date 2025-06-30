import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { format, subDays, subMonths } from 'date-fns';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import './AttendanceView.css';

ChartJS.register(...registerables);

const AttendanceView = () => {
  // Sample data - in a real app, this would come from an API
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [startDate, setStartDate] = useState(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());
  
  // Available subjects for filter
  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'math', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'history', name: 'History' },
    { id: 'english', name: 'English' },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from your backend
        // const response = await fetch('/api/attendance');
        // const data = await response.json();
        
        // Mock data
        const mockData = generateMockAttendanceData();
        setAttendanceData(mockData);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter attendance data based on selected filters
  const filteredData = attendanceData.filter(record => {
    const recordDate = new Date(record.date);
    const matchesSubject = subjectFilter === 'all' || record.subject === subjectFilter;
    const matchesDateRange = recordDate >= startDate && recordDate <= endDate;
    return matchesSubject && matchesDateRange;
  });

  // Calculate attendance statistics
  const totalClasses = filteredData.length;
  const presentClasses = filteredData.filter(record => record.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Group by subject for pie chart
  const subjectStats = filteredData.reduce((acc, record) => {
    if (!acc[record.subject]) {
      acc[record.subject] = { present: 0, absent: 0 };
    }
    if (record.status === 'present') {
      acc[record.subject].present += 1;
    } else {
      acc[record.subject].absent += 1;
    }
    return acc;
  }, {});

  // Prepare data for charts
  const barChartData = {
    labels: filteredData.map(record => format(new Date(record.date), 'MMM dd')),
    datasets: [
      {
        label: 'Attendance',
        data: filteredData.map(record => (record.status === 'present' ? 1 : 0)),
        backgroundColor: filteredData.map(record => 
          record.status === 'present' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: filteredData.map(record => 
          record.status === 'present' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(subjectStats),
    datasets: [
      {
        data: Object.values(subjectStats).map(subject => subject.present),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
        My Attendance
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Filters */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Subject"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  variant="outlined"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CalendarMonthIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="textSecondary">
                        Total Classes
                      </Typography>
                      <Typography variant="h4">{totalClasses}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <EventAvailableIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="textSecondary">
                        Present
                      </Typography>
                      <Typography variant="h4">{presentClasses}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <EventBusyIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="textSecondary">
                        Attendance %
                      </Typography>
                      <Typography variant="h4">{attendancePercentage}%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Daily Attendance
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={barChartData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 1,
                          ticks: {
                            callback: value => value === 1 ? 'Present' : value === 0 ? 'Absent' : ''
                          }
                        }
                      }
                    }} 
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  By Subject
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie 
                    data={pieChartData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                    }} 
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Attendance Table */}
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Records
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>{record.class}</TableCell>
                        <TableCell>
                          <Box 
                            display="inline-flex" 
                            alignItems="center" 
                            color={record.status === 'present' ? 'success.main' : 'error.main'}
                          >
                            {record.status === 'present' ? (
                              <EventAvailableIcon sx={{ mr: 1 }} />
                            ) : (
                              <EventBusyIcon sx={{ mr: 1 }} />
                            )}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Box>
                        </TableCell>
                        <TableCell>{record.remarks || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No attendance records found for the selected filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Container>
  );
};

// Helper function to generate mock attendance data
const generateMockAttendanceData = () => {
  const subjects = ['Mathematics', 'Science', 'History', 'English'];
  const statuses = ['present', 'absent'];
  const remarks = ['', 'Late', 'Early leave', 'Medical leave'];
  
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < 60; i++) {
    const date = subDays(today, i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const remark = status === 'absent' ? remarks[Math.floor(Math.random() * remarks.length)] : '';
    
    data.push({
      date: date.toISOString(),
      subject,
      class: `Class ${Math.floor(Math.random() * 5) + 1}`,
      status,
      remarks: remark
    });
  }
  
  return data;
};

export default AttendanceView;