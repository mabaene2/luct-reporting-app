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

const CourseManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    faculty: user.faculty,
    program: '',
    totalStudents: 0,
    assignedLecturers: [],
    programLeader: user.id,
    principalLecturer: '',
  });

  const faculties = [
    'Faculty of Computing and Informatics',
    'Faculty of Engineering',
    'Faculty of Business',
    'Faculty of Humanities',
    'Faculty of Health Sciences',
  ];

  const programs = {
    'Faculty of Computing and Informatics': [
      'BSc in Computer Science',
      'BSc in Information Technology',
      'BSc in Software Engineering',
    ],
    'Faculty of Engineering': [
      'BEng in Electrical Engineering',
      'BEng in Mechanical Engineering',
      'BEng in Civil Engineering',
    ],
    'Faculty of Business': [
      'BBA in Business Administration',
      'BBA in Accounting',
      'BBA in Marketing',
    ],
    'Faculty of Humanities': [
      'BA in Psychology',
      'BA in Sociology',
      'BA in Communication',
    ],
    'Faculty of Health Sciences': [
      'BSc in Nursing',
      'BSc in Public Health',
      'BSc in Health Administration',
    ],
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data);
    } catch (error) {
      setError('Error fetching courses');
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
      if (editingCourse) {
        await axios.put(`/courses/${editingCourse._id}`, formData);
      } else {
        await axios.post('/courses', formData);
      }
      fetchCourses();
      setDialogOpen(false);
      setEditingCourse(null);
      setFormData({
        courseCode: '',
        courseName: '',
        faculty: user.faculty,
        program: '',
        totalStudents: 0,
        assignedLecturers: [],
        programLeader: user.id,
        principalLecturer: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      faculty: course.faculty,
      program: course.program,
      totalStudents: course.totalStudents,
      assignedLecturers: course.assignedLecturers,
      programLeader: course.programLeader,
      principalLecturer: course.principalLecturer,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/courses/${id}`);
        fetchCourses();
      } catch (error) {
        setError('Error deleting course');
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
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {course.courseCode} - {course.courseName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Faculty: {course.faculty}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Program: {course.program}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Students: {course.totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lecturers: {course.assignedLecturers?.length || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(course)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(course._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Course Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Code"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Name"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Faculty</InputLabel>
                  <Select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    required
                    label="Faculty"
                  >
                    {faculties.map((faculty) => (
                      <MenuItem key={faculty} value={faculty}>
                        {faculty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Program</InputLabel>
                  <Select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                    label="Program"
                  >
                    {formData.faculty && programs[formData.faculty]?.map((program) => (
                      <MenuItem key={program} value={program}>
                        {program}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Students"
                  name="totalStudents"
                  value={formData.totalStudents}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCourse ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseManagement;