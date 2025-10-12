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
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const PrincipalLecturerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReviews: 0,
    totalCourses: 0,
    totalLecturers: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // HARDCODED DATA - WILL ALWAYS APPEAR
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
      courseCode: 'IT101',
      courseName: 'Programming',
      className: 'IT101-A',
      lecturerName: 'Bhila',
      topicTaught: 'Python Programming Basics',
      actualStudentsPresent: 45,
      totalRegisteredStudents: 50,
      attendanceRate: 90.0,
      status: 'submitted',
      facultyName: 'Faculty of Computing and Informatics'
    },
    {
      _id: '5',
      weekOfReporting: 1,
      dateOfLecture: new Date('2024-01-16'),
      courseCode: 'CS201',
      courseName: 'Database Systems',
      className: 'CS201-B',
      lecturerName: 'Molaoa',
      topicTaught: 'Database Design',
      actualStudentsPresent: 38,
      totalRegisteredStudents: 40,
      attendanceRate: 95.0,
      status: 'submitted',
      facultyName: 'Faculty of Computing and Informatics'
    }
  ];

  useEffect(() => {
    fetchPrincipalData();
  }, []);

  const fetchPrincipalData = async () => {
    try {
      console.log('User faculty:', user?.faculty);
      console.log('Hardcoded reports:', hardcodedReports);
      
      // Use ALL hardcoded data regardless of faculty matching
      // In real app, you would filter by user.faculty, but for testing we show all
      const facultyReports = hardcodedReports; // Show all reports for testing
      
      // Get unique courses and lecturers
      const uniqueCourses = [...new Set(facultyReports.map(report => report.courseCode))];
      const uniqueLecturers = [...new Set(facultyReports.map(report => report.lecturerName))];
      
      console.log('Faculty reports:', facultyReports);
      console.log('Unique courses:', uniqueCourses);
      console.log('Unique lecturers:', uniqueLecturers);
      
      setStats({
        totalReports: facultyReports.length,
        pendingReviews: facultyReports.filter(r => r.status === 'submitted').length,
        totalCourses: uniqueCourses.length,
        totalLecturers: uniqueLecturers.length,
      });
      
      setRecentReports(facultyReports);
      console.log('Recent reports set:', facultyReports);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching principal data');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search term
  const filteredReports = recentReports.filter(report =>
    report.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lecturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.topicTaught.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'info';
      case 'reviewed': return 'warning';
      case 'approved': return 'success';
      default: return 'default';
    }
  };

  const handleViewReport = (reportId) => {
    alert(`Viewing report ${reportId}`);
    // Navigate to report details page
  };

  const handleReviewReport = (reportId) => {
    alert(`Reviewing report ${reportId}`);
    // Open review dialog
  };

  // Calculate average attendance rate
  const averageAttendanceRate = recentReports.length > 0 
    ? (recentReports.reduce((sum, report) => sum + report.attendanceRate, 0) / recentReports.length).toFixed(1)
    : 0;

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
        Principal Lecturer Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Faculty: {user?.faculty || 'Faculty of Computing and Informatics'}
      </Typography>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Debug Info - Remove in production */}
      <Box sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Debug: {recentReports.length} reports loaded | {filteredReports.length} filtered
        </Typography>
      </Box>

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
                <AssignmentIcon sx={{ color: 'warning.main', mr: 2 }} />
                <Typography variant="h6" component="div">
                  Pending Reviews
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="warning">
                {stats.pendingReviews}
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
                  Total Lecturers
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="secondary">
                {stats.totalLecturers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reports with Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Recent Reports
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by course, lecturer, topic, class, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
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
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No reports found matching your search.
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
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewReport(report._id)}
                      >
                        View
                      </Button>
                      {report.status === 'submitted' && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleReviewReport(report._id)}
                          color="primary"
                        >
                          Review
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Performance Metrics */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Performance Metrics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Attendance Rate
              </Typography>
              <Typography variant="h4" color="primary">
                {averageAttendanceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all faculty courses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reports Requiring Review
              </Typography>
              <Typography variant="h4" color="warning">
                {stats.pendingReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need your attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PrincipalLecturerDashboard;