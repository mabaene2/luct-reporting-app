import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
  CircularProgress,
  Rating,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import { Save, Cancel, Star, Add, Search } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the rating form
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);

  // State for adding new lectures
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newLecture, setNewLecture] = useState({
    Course: '',
    Topic: '',
    Date: '',
    Lecturer: '',
    Rating: 0
  });

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // HARDCODED DATA WITH YOUR 5 FIELDS AND NAMES
  const [lectures, setLectures] = useState([
    {
      _id: '1',
      Course: 'IT101 - Programming',
      Topic: 'Python Programming Basics',
      Date: '2024-01-15',
      Lecturer: 'Bhila',
      Rating: 0
    },
    {
      _id: '2',
      Course: 'CS201 - Database Systems', 
      Topic: 'Database Design',
      Date: '2024-01-16',
      Lecturer: 'Molaoa',
      Rating: 0
    },
    {
      _id: '3',
      Course: 'BUS101 - Business Management',
      Topic: 'Wine Marketing Strategies',
      Date: '2024-01-17',
      Lecturer: 'Sechaba',
      Rating: 0
    },
    {
      _id: '4',
      Course: 'BUS201 - Entrepreneurship',
      Topic: 'Business Plan Development',
      Date: '2024-01-18',
      Lecturer: 'Nzeku',
      Rating: 0
    }
  ]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const coursesResponse = await axios.get(`/courses?program=${user.program}`);
      setCourses(coursesResponse.data);

      const ratingsResponse = await axios.get(`/ratings?rater=${user.id}`);
      setRatings(ratingsResponse.data);
    } catch (error) {
      setError('Error fetching student data');
    } finally {
      setLoading(false);
    }
  };

  // Filter lectures based on search term
  const filteredLectures = lectures.filter(lecture =>
    lecture.Course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecture.Topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecture.Lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecture.Date.includes(searchTerm)
  );

  // Functions for rating lectures
  const handleStartEditing = (lecture) => {
    const existingRating = ratings.find(r => r.ratedEntity === lecture._id);
    setEditingLectureId(lecture._id);
    setRatingValue(existingRating?.rating || 0);
  };

  const handleCancelEditing = () => {
    setEditingLectureId(null);
    setRatingValue(0);
  };

  const handleSaveRating = (lectureId) => {
    const newRating = {
      ratedEntity: lectureId,
      rating: ratingValue,
    };
    
    const filteredRatings = ratings.filter(r => r.ratedEntity !== lectureId);
    setRatings([...filteredRatings, newRating]);
    handleCancelEditing();
    
    alert(`Rating ${ratingValue} stars saved!`);
  };

  const getLectureRating = (lectureId) => {
    const rating = ratings.find(r => r.ratedEntity === lectureId);
    return rating ? rating.rating : 0;
  };

  // Functions for adding new lectures
  const handleOpenAddDialog = () => {
    setNewLecture({
      Course: '',
      Topic: '',
      Date: '',
      Lecturer: '',
      Rating: 0
    });
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };

  const handleAddLecture = () => {
    if (!newLecture.Course || !newLecture.Topic || !newLecture.Date || !newLecture.Lecturer) {
      alert('Please fill all fields!');
      return;
    }

    const lectureToAdd = {
      _id: Date.now().toString(),
      Course: newLecture.Course,
      Topic: newLecture.Topic,
      Date: newLecture.Date,
      Lecturer: newLecture.Lecturer,
      Rating: 0
    };

    setLectures([...lectures, lectureToAdd]);
    handleCloseAddDialog();
    alert('New lecture added successfully!');
  };

  const handleInputChange = (field, value) => {
    setNewLecture(prev => ({
      ...prev,
      [field]: value
    }));
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
      <Typography variant="h4" component="h1" gutterBottom>
        Student Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Welcome, {user.firstName} {user.lastName}
      </Typography>

      {/* Recent Lectures with Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Recent Lectures
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
          color="success"
        >
          Add New Lecture
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by course, topic, lecturer, or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
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
              <TableCell><strong>Course</strong></TableCell>
              <TableCell><strong>Topic</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Lecturer</strong></TableCell>
              <TableCell><strong>Rating</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLectures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No lectures found matching your search.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLectures.map((lecture) => {
                const isEditing = editingLectureId === lecture._id;
                const existingRating = getLectureRating(lecture._id);
                const hasRated = existingRating > 0;
                
                return (
                  <TableRow key={lecture._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {lecture.Course}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>{lecture.Topic}</TableCell>
                    
                    <TableCell>{lecture.Date}</TableCell>
                    
                    <TableCell>{lecture.Lecturer}</TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating
                            value={ratingValue}
                            onChange={(event, newValue) => {
                              setRatingValue(newValue);
                            }}
                            size="large"
                          />
                          <Typography variant="caption">
                            ({ratingValue}/5)
                          </Typography>
                        </Box>
                      ) : (
                        <Rating
                          value={existingRating}
                          readOnly
                          size="small"
                        />
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Save />}
                            onClick={() => handleSaveRating(lecture._id)}
                            disabled={ratingValue === 0}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Cancel />}
                            onClick={handleCancelEditing}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          variant={hasRated ? "outlined" : "contained"}
                          size="small"
                          startIcon={<Star />}
                          onClick={() => handleStartEditing(lecture)}
                          color={hasRated ? "secondary" : "primary"}
                        >
                          {hasRated ? 'Edit' : 'Rate Now'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Lecture Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Lecture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Course"
              value={newLecture.Course}
              onChange={(e) => handleInputChange('Course', e.target.value)}
              placeholder="e.g., IT101 - Programming"
              fullWidth
            />
            <TextField
              label="Topic"
              value={newLecture.Topic}
              onChange={(e) => handleInputChange('Topic', e.target.value)}
              placeholder="e.g., Python Programming"
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={newLecture.Date}
              onChange={(e) => handleInputChange('Date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Lecturer"
              value={newLecture.Lecturer}
              onChange={(e) => handleInputChange('Lecturer', e.target.value)}
              placeholder="e.g., Bhila"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddLecture} 
            variant="contained"
            startIcon={<Add />}
          >
            Add Lecture
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentDashboard;