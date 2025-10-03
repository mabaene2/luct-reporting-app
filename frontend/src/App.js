// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import PRLDashboard from './components/PRLDashboard';
import PLDashboard from './components/PLDashboard';

// Create simple dashboard components if they don't exist
const SimpleDashboard = ({ role, title }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setDashboardData({
        welcome: `Welcome to ${title}`,
        stats: {
          totalItems: 12,
          completed: 8,
          pending: 4
        }
      });
      setLoading(false);
    }, 1000);
  }, [title]);

  if (loading) return <div className="loading-overlay"><div className="loading"></div>Loading...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{dashboardData?.welcome}</p>
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{dashboardData?.stats.totalItems}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{dashboardData?.stats.completed}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{dashboardData?.stats.pending}</div>
        </div>
      </div>

      <div className="form-row">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Monitoring</h3>
          </div>
          <div className="card-content">
            <p>Your monitoring data will appear here once you start using the system.</p>
            <p>This includes attendance, performance metrics, and progress tracking.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⭐ Ratings</h3>
          </div>
          <div className="card-content">
            <p>Ratings and feedback will be displayed here.</p>
            <p>Students can see their performance ratings, lecturers can see student feedback.</p>
          </div>
        </div>
      </div>

      {role === 'lecturer' && (
        <div className="form-row">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📝 Reports</h3>
            </div>
            <div className="card-content">
              <p>Submit and manage your lecture reports here.</p>
              <p>Track attendance, topics covered, and student outcomes.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🏫 Classes</h3>
            </div>
            <div className="card-content">
              <p>Manage your classes and teaching schedule.</p>
              <p>View class lists, schedules, and venue information.</p>
            </div>
          </div>
        </div>
      )}

      {(role === 'prl' || role === 'pl') && (
        <div className="form-row">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📚 Courses</h3>
            </div>
            <div className="card-content">
              <p>Manage courses and curriculum under your supervision.</p>
              <p>Track course performance and resource allocation.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📈 Analytics</h3>
            </div>
            <div className="card-content">
              <p>View comprehensive analytics and reports.</p>
              <p>Monitor program performance and student outcomes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Role-based Route Component
const RoleBasedRoute = ({ role, children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === role ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading-overlay"><div className="loading"></div></div>;
  }

  return (
    <Router>
      <div className="App">
        {/* ===== WORLD-CLASS PROFESSIONAL HEADER ===== */}
        <header className="app-header">
          <div className="header-container">
            <h1 className="header-title"> LUCT Reporting System</h1>
            <nav className="header-nav">
              {!user ? (
                <div className="header-auth-links">
                  <Link to="/login" className="header-link login-link">
                    <span className="header-icon"></span>
                    Login
                  </Link>
                  <Link to="/register" className="header-link register-link">
                    <span className="header-icon"></span>
                    Register
                  </Link>
                </div>
              ) : (
                <div className="header-user-info">
                  <span>Welcome, {user.first_name} {user.last_name}</span>
                  <button onClick={handleLogout} className="header-logout">
                    <span className="header-icon"></span>
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={`/${user.role}-dashboard`} />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to={`/${user.role}-dashboard`} />} 
            />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute role="student">
                    <StudentDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/lecturer-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute role="lecturer">
                    <LecturerDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/prl-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute role="prl">
                    <PRLDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pl-dashboard" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute role="pl">
                    <PLDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback routes */}
            <Route 
              path="/" 
              element={<Navigate to={user ? `/${user.role}-dashboard` : '/login'} />} 
            />
            
            {/* Simple dashboard fallbacks */}
            <Route 
              path="/dashboard" 
              element={<Navigate to={user ? `/${user.role}-dashboard` : '/login'} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;