import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ProgramLeaderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    totalCourses: 0,
    totalUsers: 0,
    totalClasses: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseCodeFilter, setCourseCodeFilter] = useState('');

  // HARDCODED DATA FOR DEMONSTRATION
  const hardcodedReports = [
    {
      _id: '1',
      weekOfReporting: 8,
      dateOfLecture: new Date('2025-10-13'),
      courseCode: 'ITC306',
      courseName: 'Computer Networks',
      className: 'ITC306-C',
      lecturerName: 'Shem Shem',
      topicTaught: 'TCP vs UDP',
      actualStudentsPresent: 22,
      totalRegisteredStudents: 35,
      attendanceRate: 62.9,
      status: 'draft',
      facultyName: 'Faculty of Computing and Informatics'
    },
    {
      _id: '2',
      weekOfReporting: 7,
      dateOfLecture: new Date('2025-10-11'),
      courseCode: 'ITC302',
      courseName: 'Database Systems',
      className: 'ITC302-B',
      lecturerName: 'Shem Shem',
      topicTaught: 'MongoDB Aggregations',
      actualStudentsPresent: 26,
      totalRegisteredStudents: 30,
      attendanceRate: 86.7,
      status: 'draft',
      facultyName: 'Faculty of Computing and Informatics'
    },
    {
      _id: '3',
      weekOfReporting: 3,
      dateOfLecture: new Date('2025-10-11'),
      courseCode: 'ITC301',
      courseName: 'Web Development',
      className: 'ITC301-A',
      lecturerName: 'Shem Shem',
      topicTaught: 'React Components & Props',
      actualStudentsPresent: 30,
      totalRegisteredStudents: 40,
      attendanceRate: 75.0,
      status: 'draft',
      facultyName: 'Faculty of Computing and Informatics'
    },
    {
      _id: '4',
      weekOfReporting: 1,
      dateOfLecture: new Date('2024-01-15'),
      courseCode: 'BUS101',
      courseName: 'Business Management',
      className: 'BUS101-A',
      lecturerName: 'Bhila',
      topicTaught: 'Business Strategy',
      actualStudentsPresent: 45,
      totalRegisteredStudents: 50,
      attendanceRate: 90.0,
      status: 'submitted',
      facultyName: 'Faculty of Business'
    },
    {
      _id: '5',
      weekOfReporting: 1,
      dateOfLecture: new Date('2024-01-16'),
      courseCode: 'ACC201',
      courseName: 'Accounting Principles',
      className: 'ACC201-B',
      lecturerName: 'Molaoa',
      topicTaught: 'Financial Statements',
      actualStudentsPresent: 38,
      totalRegisteredStudents: 40,
      attendanceRate: 95.0,
      status: 'submitted',
      facultyName: 'Faculty of Business'
    },
    {
      _id: '6',
      weekOfReporting: 2,
      dateOfLecture: new Date('2024-01-20'),
      courseCode: 'MATH101',
      courseName: 'Calculus I',
      className: 'MATH101-C',
      lecturerName: 'Dr. Smith',
      topicTaught: 'Limits and Derivatives',
      actualStudentsPresent: 55,
      totalRegisteredStudents: 60,
      attendanceRate: 91.7,
      status: 'approved',
      facultyName: 'Faculty of Science'
    }
  ];

  useEffect(() => {
    fetchProgramLeaderData();
  }, []);

  const fetchProgramLeaderData = async () => {
    try {
      // Use hardcoded data instead of API calls
      const allReports = hardcodedReports;
      const uniqueCourses = [...new Set(hardcodedReports.map(report => report.courseCode))];
      const uniqueLecturers = [...new Set(hardcodedReports.map(report => report.lecturerName))];
      
      setStats({
        totalReports: allReports.length,
        totalCourses: uniqueCourses.length,
        totalUsers: uniqueLecturers.length,
        totalClasses: 15, // Hardcoded for demo
      });
      
      setRecentReports(allReports);
    } catch (error) {
      setError('Error fetching program leader data');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on course code
  const filteredReports = courseCodeFilter
    ? recentReports.filter(report =>
        report.courseCode.toLowerCase().includes(courseCodeFilter.toLowerCase()) ||
        report.courseName.toLowerCase().includes(courseCodeFilter.toLowerCase())
      )
    : recentReports;

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'info';
      case 'reviewed': return 'warning';
      case 'approved': return 'success';
      default: return 'default';
    }
  };

  // Calculate overall statistics
  const overallAttendanceRate = recentReports.length > 0 
    ? (recentReports.reduce((sum, report) => sum + report.attendanceRate, 0) / recentReports.length).toFixed(1)
    : 0;

  const systemUsageRate = 92; // Hardcoded for demo

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Program Leader Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        System Overview and Analytics
      </Typography>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" component="div">
                  Total Reports
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="primary">
                {stats.totalReports}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ color: 'success.main', mr: 2 }} />
                <Typography variant="h6" component="div">
                  Total Courses
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="success">
                {stats.totalCourses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: 'secondary.main', mr: 2 }} />
                <Typography variant="h6" component="div">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="secondary">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ color: 'warning.main', mr: 2 }} />
                <Typography variant="h6" component="div">
                  Total Classes
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="warning">
                {stats.totalClasses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reports with Course Code Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Recent Reports
        </Typography>
      </Box>

      {/* Course Code Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Filter by course code or course name..."
          value={courseCodeFilter}
          onChange={(e) => setCourseCodeFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          helperText={`Showing ${filteredReports.length} of ${recentReports.length} reports`}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Week</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Course</strong></TableCell>
              <TableCell><strong>Class</strong></TableCell>
              <TableCell><strong>Lecturer</strong></TableCell>
              <TableCell><strong>Topic</strong></TableCell>
              <TableCell><strong>Attendance</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No reports found matching your course filter.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report._id} hover>
                  <TableCell>{report.weekOfReporting}</TableCell>
                  <TableCell>
                    {new Date(report.dateOfLecture).toLocaleDateString('en-ZA')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {report.courseCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.courseName}
                    </Typography>
                  </TableCell>
                  <TableCell>{report.className}</TableCell>
                  <TableCell>{report.lecturerName}</TableCell>
                  <TableCell>{report.topicTaught}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {report.actualStudentsPresent}/{report.totalRegisteredStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.attendanceRate?.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      color={getStatusColor(report.status)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* System Analytics */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        System Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Attendance Rate
              </Typography>
              <Typography variant="h4" color="primary">
                {overallAttendanceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all courses in the system
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Usage
              </Typography>
              <Typography variant="h4" color="success">
                {systemUsageRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active user engagement rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            onClick={() => window.location.href = '/courses'}
          >
            Manage Courses
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<PeopleIcon />}
            onClick={() => window.location.href = '/users'}
          >
            Manage Users
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => window.location.href = '/reports'}
          >
            View All Reports
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProgramLeaderDashboard;