import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Fade,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <AppBar position="fixed">
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

      {/* Hero Section - FILLS ENTIRE SCREEN */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
        }}
      >
        <Box sx={{ mt: -8 }}> {/* Adjust for navbar */}
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
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
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
                  {user ? 'Go to Dashboard' : 'Get Started'}
                </Button>
                {!user && (
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
                )}
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Footer - STRETCHES EDGE TO EDGE */}
      <Box 
        component="footer"
        sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white', 
          py: 2,
          textAlign: 'center',
          width: '100%',
          margin: 0,
        }}
      >
        <Typography variant="body2">
          © 2025 LUCT Reporting System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
