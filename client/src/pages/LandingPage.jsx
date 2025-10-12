import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  Fade,
  Slide,
  useScrollTrigger,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const trigger = useScrollTrigger();

  const features = [
    {
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      title: 'Comprehensive Reporting',
      description: 'Create detailed lecture reports with attendance tracking, learning outcomes, and recommendations.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Real-time Monitoring',
      description: 'Monitor class performance, attendance rates, and teaching effectiveness in real-time.',
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-role Access',
      description: 'Tailored dashboards for students, lecturers, principal lecturers, and program leaders.',
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Course Management',
      description: 'Manage courses, classes, and student information efficiently across faculties.',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" elevation={trigger ? 4 : 0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LUCT Reporting System
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {user ? (
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 10,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Fade in={true} timeout={1000}>
              <Box>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  LUCT Reporting System
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
                  Streamline your academic reporting with our comprehensive web-based platform
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      },
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Login
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Slide direction="up" in={true} timeout={600 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ py: 4 }}>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Statistics Section */}
        <Box sx={{ backgroundColor: 'grey.100', py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
              System Statistics
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                      500+
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Active Users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                      1000+
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Reports Created
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                      50+
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Courses Managed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                      99.9%
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Uptime
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Container maxWidth="md">
            <Typography variant="h3" component="h2" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of educators and students who are already using our platform
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
            >
              Create Your Account Today
            </Button>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="body2" textAlign="center">
              © 2024 LUCT Reporting System. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;