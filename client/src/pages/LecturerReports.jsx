import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const LecturerReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = user.role === 'lecturer' ? { lecturer: user.id } : {};
      const response = await axios.get('/reports', { params });
      setReports(response.data);
    } catch (error) {
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/reports/${id}`);
      setReports(reports.filter(report => report._id !== id));
      setDeleteDialog(null);
    } catch (error) {
      setError('Error deleting report');
    }
  };

  const handleFeedback = async (reportId) => {
    try {
      const feedbackKey = user.role === 'principal_lecturer' 
        ? 'principalLecturerFeedback' 
        : 'programLeaderFeedback';
      
      await axios.put(`/reports/${reportId}`, {
        [feedbackKey]: feedbackText,
        status: 'reviewed'
      });
      
      setReports(reports.map(report => 
        report._id === reportId 
          ? { ...report, [feedbackKey]: feedbackText, status: 'reviewed' }
          : report
      ));
      
      setFeedbackDialog(null);
      setFeedbackText('');
    } catch (error) {
      setError('Error adding feedback');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/reports/export/excel', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'luct-reports.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Error exporting reports');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.topicTaught.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'info';
      case 'reviewed': return 'warning';
      case 'approved': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export to Excel
          </Button>
          {user.role === 'lecturer' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => window.location.href = '/report-form'}
            >
              New Report
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Week</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report.weekOfReporting}</TableCell>
                <TableCell>{new Date(report.dateOfLecture).toLocaleDateString()}</TableCell>
                <TableCell>
                  {report.courseCode}<br />
                  <Typography variant="body2" color="text.secondary">
                    {report.courseName}
                  </Typography>
                </TableCell>
                <TableCell>{report.className}</TableCell>
                <TableCell>{report.topicTaught}</TableCell>
                <TableCell>
                  {report.actualStudentsPresent}/{report.totalRegisteredStudents}
                  <br />
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
                  <IconButton
                    size="small"
                    onClick={() => window.location.href = `/report-form/${report._id}`}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => alert(`Viewing report: ${report.topicTaught}`)}
                    title="View"
                  >
                    <ViewIcon />
                  </IconButton>
                  {(user.role === 'principal_lecturer' || user.role === 'program_leader') && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFeedbackDialog(report._id);
                        setFeedbackText(
                          user.role === 'principal_lecturer' 
                            ? report.principalLecturerFeedback || ''
                            : report.programLeaderFeedback || ''
                        );
                      }}
                      title="Add Feedback"
                    >
                      <AssignmentIcon />
                    </IconButton>
                  )}
                  {user.role === 'lecturer' && (
                    <IconButton
                      size="small"
                      onClick={() => setDeleteDialog(report._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this report? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteDialog)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackDialog} onClose={() => setFeedbackDialog(null)}>
        <DialogTitle>Add Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Feedback"
            fullWidth
            multiline
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(null)}>Cancel</Button>
          <Button onClick={() => handleFeedback(feedbackDialog)} color="primary">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LecturerReports;