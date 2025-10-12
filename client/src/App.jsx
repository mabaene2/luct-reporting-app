import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TopNavigation from './components/TopNavigation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import LecturerReports from './pages/LecturerReports';
import StudentDashboard from './pages/StudentDashboard';
import PrincipalLecturerDashboard from './pages/PrincipalLecturerDashboard';
import ProgramLeaderDashboard from './pages/ProgramLeaderDashboard';
import ReportForm from './pages/ReportForm';
import CourseManagement from './pages/CourseManagement';
import ClassManagement from './pages/ClassManagement';
import UserManagement from './pages/UserManagement';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <TopNavigation />
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <TopNavigation />
                  <LecturerReports />
                </ProtectedRoute>
              } />
              
              <Route path="/report-form" element={
                <ProtectedRoute>
                  <TopNavigation />
                  <ReportForm />
                </ProtectedRoute>
              } />
              
              <Route path="/report-form/:id" element={
                <ProtectedRoute>
                  <TopNavigation />
                  <ReportForm />
                </ProtectedRoute>
              } />
              
              <Route path="/student-dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <TopNavigation />
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/principal-dashboard" element={
                <ProtectedRoute allowedRoles={['principal_lecturer']}>
                  <TopNavigation />
                  <PrincipalLecturerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/program-leader-dashboard" element={
                <ProtectedRoute allowedRoles={['program_leader']}>
                  <TopNavigation />
                  <ProgramLeaderDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/courses" element={
                <ProtectedRoute allowedRoles={['program_leader', 'principal_lecturer']}>
                  <TopNavigation />
                  <CourseManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/classes" element={
                <ProtectedRoute allowedRoles={['program_leader']}>
                  <TopNavigation />
                  <ClassManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['program_leader']}>
                  <TopNavigation />
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              {/* Redirect any unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;