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
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: '',
    faculty: user.faculty,
    program: '',
  });

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'lecturer', label: 'Lecturer' },
    { value: 'principal_lecturer', label: 'Principal Lecturer' },
    { value: 'program_leader', label: 'Program Leader' },
  ];

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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
    } catch (error) {
      setError('Error fetching users');
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
      if (editingUser) {
        await axios.put(`/users/${editingUser._id}`, formData);
      } else {
        await axios.post('/users', formData);
      }
      fetchUsers();
      setDialogOpen(false);
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        role: '',
        faculty: user.faculty,
        program: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleEdit = (userItem) => {
    setEditingUser(userItem);
    setFormData({
      firstName: userItem.firstName,
      lastName: userItem.lastName,
      username: userItem.username,
      email: userItem.email,
      role: userItem.role,
      faculty: userItem.faculty,
      program: userItem.program || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        setError('Error deleting user');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'primary';
      case 'lecturer': return 'secondary';
      case 'principal_lecturer': return 'warning';
      case 'program_leader': return 'success';
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
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {users.map((userItem) => (
          <Grid item xs={12} md={6} lg={4} key={userItem._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {userItem.firstName} {userItem.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Username: {userItem.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email: {userItem.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Faculty: {userItem.faculty}
                </Typography>
                {userItem.program && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Program: {userItem.program}
                  </Typography>
                )}
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={userItem.role}
                    size="small"
                    color={getRoleColor(userItem.role)}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(userItem)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(userItem._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    label="Role"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              {formData.role === 'student' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Program</InputLabel>
                    <Select
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      required={formData.role === 'student'}
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
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;