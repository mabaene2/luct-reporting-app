import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ClassManagement = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    course: '',
    lecturer: '',
    venue: '',
    scheduledTime: '',
    dayOfWeek: '',
    semester: '',
    academicYear: '',
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const semesters = ['Fall 2024', 'Spring 2025', 'Summer 2025'];
  const academicYears = ['2024-2025', '2025-2026', '2026-2027'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesResponse, coursesResponse, lecturersResponse] = await Promise.all([
        axios.get('/classes'),
        axios.get('/courses'),
        axios.get('/users?role=lecturer'),
      ]);
      
      setClasses(classesResponse.data);
      setCourses(coursesResponse.data);
      setLecturers(lecturersResponse.data);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await axios.put(`/classes/${editingClass._id}`, formData);
      } else {
        await axios.post('/classes', formData);
      }
      fetchData();
      setDialogOpen(false);
      setEditingClass(null);
      setFormData({
        className: '',
        course: '',
        lecturer: '',
        venue: '',
        scheduledTime: '',
        dayOfWeek: '',
        semester: '',
        academicYear: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving class');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      className: classItem.className,
      course: classItem.course._id,
      lecturer: classItem.lecturer._id,
      venue: classItem.venue,
      scheduledTime: classItem.scheduledTime,
      dayOfWeek: classItem.dayOfWeek,
      semester: classItem.semester,
      academicYear: classItem.academicYear,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axios.delete(`/classes/${id}`);
        fetchData();
      } catch (error) {
        setError('Error deleting class');
      }
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
          Class Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} lg={4} key={classItem._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {classItem.className}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Course: {classItem.course?.courseCode} - {classItem.course?.courseName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lecturer: {classItem.lecturer?.firstName} {classItem.lecturer?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Day: {classItem.dayOfWeek}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Time: {classItem.scheduledTime}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Venue: {classItem.venue}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Semester: {classItem.semester}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(classItem)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(classItem._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Class Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingClass ? 'Edit Class' : 'Add New Class'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Class Name"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Course</InputLabel>
                  <Select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    label="Course"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.courseCode} - {course.courseName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Lecturer</InputLabel>
                  <Select
                    name="lecturer"
                    value={formData.lecturer}
                    onChange={handleChange}
                    required
                    label="Lecturer"
                  >
                    {lecturers.map((lecturer) => (
                      <MenuItem key={lecturer._id} value={lecturer._id}>
                        {lecturer.firstName} {lecturer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheduled Time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 09:00-11:00"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    required
                    label="Day of Week"
                  >
                    {daysOfWeek.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    label="Semester"
                  >
                    {semesters.map((semester) => (
                      <MenuItem key={semester} value={semester}>
                        {semester}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                    label="Academic Year"
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassManagement;