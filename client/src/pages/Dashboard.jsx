import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardCards = () => {
    switch (user?.role) {
      case 'student':
        return [
          {
            title: 'My Courses',
            description: 'View your enrolled courses and classes',
            icon: <SchoolIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/student-dashboard'),
            color: 'primary.main',
          },
          {
            title: 'Rate Lectures',
            description: 'Rate and provide feedback on lectures',
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/student-dashboard'),
            color: 'secondary.main',
          },
        ];
      
      case 'lecturer':
        return [
          {
            title: 'My Reports',
            description: 'View and manage your lecture reports',
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/reports'),
            color: 'primary.main',
          },
          {
            title: 'Create Report',
            description: 'Create a new lecture report',
            icon: <DashboardIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/report-form'),
            color: 'secondary.main',
          },
          {
            title: 'My Classes',
            description: 'View your assigned classes',
            icon: <SchoolIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/reports'),
            color: 'success.main',
          },
        ];
      
      case 'principal_lecturer':
        return [
          {
            title: 'Review Reports',
            description: 'Review and provide feedback on reports',
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/principal-dashboard'),
            color: 'primary.main',
          },
          {
            title: 'Course Overview',
            description: 'View courses under your supervision',
            icon: <SchoolIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/courses'),
            color: 'secondary.main',
          },
          {
            title: 'Monitor Performance',
            description: 'Monitor teaching performance and attendance',
            icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/principal-dashboard'),
            color: 'success.main',
          },
        ];
      
      case 'program_leader':
        return [
          {
            title: 'Manage Courses',
            description: 'Add, edit, and assign courses',
            icon: <SchoolIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/courses'),
            color: 'primary.main',
          },
          {
            title: 'Manage Classes',
            description: 'Create and manage class schedules',
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/classes'),
            color: 'secondary.main',
          },
          {
            title: 'Manage Users',
            description: 'Manage system users and roles',
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/users'),
            color: 'success.main',
          },
          {
            title: 'View Reports',
            description: 'View all reports and analytics',
            icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/program-leader-dashboard'),
            color: 'warning.main',
          },
        ];
      
      default:
        return [];
    }
  };

  const cards = getDashboardCards();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {user?.role === 'student' && 'Student Dashboard'}
          {user?.role === 'lecturer' && 'Lecturer Dashboard'}
          {user?.role === 'principal_lecturer' && 'Principal Lecturer Dashboard'}
          {user?.role === 'program_leader' && 'Program Leader Dashboard'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                <Box sx={{ color: card.color, mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  onClick={card.action}
                  sx={{ textTransform: 'none' }}
                >
                  Go to {card.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Stats
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="secondary">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="success">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Classes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="warning">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;