import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [formData, setFormData] = useState({
    facultyName: user?.faculty || '',
    className: '',
    weekOfReporting: '',
    dateOfLecture: new Date(),
    courseName: '',
    courseCode: '',
    lecturerName: `${user?.firstName} ${user?.lastName}`,
    actualStudentsPresent: '',
    totalRegisteredStudents: '',
    venue: '',
    scheduledLectureTime: '',
    topicTaught: '',
    learningOutcomes: [],
    lecturerRecommendations: '',
  });

  const [newLearningOutcome, setNewLearningOutcome] = useState('');

  useEffect(() => {
    fetchCourses();
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/reports/${id}`);
      const report = response.data;
      
      setFormData({
        facultyName: report.facultyName,
        className: report.className,
        weekOfReporting: report.weekOfReporting,
        dateOfLecture: new Date(report.dateOfLecture),
        courseName: report.courseName,
        courseCode: report.courseCode,
        lecturerName: report.lecturerName,
        actualStudentsPresent: report.actualStudentsPresent,
        totalRegisteredStudents: report.totalRegisteredStudents,
        venue: report.venue,
        scheduledLectureTime: report.scheduledLectureTime,
        topicTaught: report.topicTaught,
        learningOutcomes: report.learningOutcomes || [],
        lecturerRecommendations: report.lecturerRecommendations || '',
      });
    } catch (error) {
      setError('Error loading report');
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

  const handleCourseCodeChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      courseCode: newValue || '',
    }));

    // Auto-populate course name if a valid course code is selected
    if (newValue) {
      const selectedCourse = courses.find(course => course.courseCode === newValue);
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          courseName: selectedCourse.courseName,
          totalRegisteredStudents: selectedCourse.totalStudents
        }));
      }
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfLecture: date,
    });
  };

  const handleAddLearningOutcome = () => {
    if (newLearningOutcome.trim()) {
      setFormData({
        ...formData,
        learningOutcomes: [...formData.learningOutcomes, newLearningOutcome.trim()],
      });
      setNewLearningOutcome('');
    }
  };

  const handleRemoveLearningOutcome = (index) => {
    setFormData({
      ...formData,
      learningOutcomes: formData.learningOutcomes.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const reportData = {
        ...formData,
        dateOfLecture: formData.dateOfLecture.toISOString(),
      };
      
      if (id) {
        await axios.put(`/reports/${id}`, reportData);
      } else {
        await axios.post('/reports', reportData);
      }
      
      navigate('/reports');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving report');
    } finally {
      setSaving(false);
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Report' : 'Create New Report'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Faculty Name"
                  name="facultyName"
                  value={formData.facultyName}
                  onChange={handleChange}
                  required
                  disabled
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lecturer Name"
                  name="lecturerName"
                  value={formData.lecturerName}
                  onChange={handleChange}
                  required
                  disabled
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Week of Reporting"
                  name="weekOfReporting"
                  type="number"
                  value={formData.weekOfReporting}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 52 }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date of Lecture"
                  value={formData.dateOfLecture}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>

              {/* Course Information */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  options={courses.map((course) => course.courseCode)}
                  value={formData.courseCode}
                  onChange={(event, newValue) => {
                    handleCourseCodeChange(newValue);
                  }}
                  onInputChange={(event, newInputValue) => {
                    setFormData(prev => ({
                      ...prev,
                      courseCode: newInputValue,
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Course Code"
                      required
                      variant="outlined"
                    />
                  )}
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
                  label="Scheduled Lecture Time"
                  name="scheduledLectureTime"
                  value={formData.scheduledLectureTime}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Students Present"
                  name="actualStudentsPresent"
                  type="number"
                  value={formData.actualStudentsPresent}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Total Registered"
                  name="totalRegisteredStudents"
                  type="number"
                  value={formData.totalRegisteredStudents}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Topic Taught"
                  name="topicTaught"
                  value={formData.topicTaught}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Learning Outcomes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Learning Outcomes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {formData.learningOutcomes.map((outcome, index) => (
                    <Chip
                      key={index}
                      label={outcome}
                      onDelete={() => handleRemoveLearningOutcome(index)}
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Learning Outcome"
                    value={newLearningOutcome}
                    onChange={(e) => setNewLearningOutcome(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLearningOutcome()}
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddLearningOutcome}
                    sx={{ height: 'fit-content' }}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>

              {/* Recommendations */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Lecturer's Recommendations"
                  name="lecturerRecommendations"
                  value={formData.lecturerRecommendations}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/reports')}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ textTransform: 'none' }}
                  >
                    {saving ? <CircularProgress size={24} /> : id ? 'Update Report' : 'Create Report'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default ReportForm;