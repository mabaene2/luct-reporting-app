import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch(user.role) {
      case 'student': return '/student-dashboard';
      case 'lecturer': return '/lecturer-dashboard';
      case 'prl': return '/prl-dashboard';
      case 'pl': return '/pl-dashboard';
      default: return '/login';
    }
  };

  const getRoleDisplayName = () => {
    switch(user.role) {
      case 'student': return 'Student';
      case 'lecturer': return 'Lecturer';
      case 'prl': return 'Principal Lecturer';
      case 'pl': return 'Program Leader';
      default: return 'User';
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Brand - Always visible */}
        <div className="nav-brand">
          <Link to={user ? getDashboardLink() : '/login'} className="brand-link">
            <h2>🎓 LUCT Reporting System</h2>
          </Link>
        </div>

        {/* Navigation Links - Only show when user is logged in */}
        <div className="nav-links">
          {user && (
            <>
              <Link to={getDashboardLink()} className="nav-link">
                🏠 Dashboard
              </Link>
              
              {user.role === 'lecturer' && (
                <>
                  <Link to="/reports" className="nav-link">
                    📝 Reports
                  </Link>
                  <Link to="/classes" className="nav-link">
                    🏫 My Classes
                  </Link>
                </>
              )}
              
              {user.role === 'prl' && (
                <>
                  <Link to="/courses" className="nav-link">
                    📚 Courses
                  </Link>
                  <Link to="/reports" className="nav-link">
                    📋 Reports
                  </Link>
                </>
              )}
              
              {user.role === 'pl' && (
                <>
                  <Link to="/courses" className="nav-link">
                    📚 Courses
                  </Link>
                  <Link to="/classes" className="nav-link">
                    🏫 Classes
                  </Link>
                </>
              )}
              
              {user.role === 'student' && (
                <>
                  <Link to="/monitoring" className="nav-link">
                    📊 Monitoring
                  </Link>
                  <Link to="/ratings" className="nav-link">
                    ⭐ Ratings
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* User/Auth Section */}
        <div className="nav-user">
          {user ? (
            // Logged-in user info
            <>
              <div className="user-info">
                <span className="user-name">
                  {user.first_name} {user.last_name}
                </span>
                <span className="user-role">
                  {getRoleDisplayName()}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="logout-btn"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            // Login/Register links - Always visible when not logged in
            <div className="auth-links">
              <Link to="/login" className="auth-link login-link">
                🔑 Login
              </Link>
              <Link to="/register" className="auth-link register-link">
                📝 Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;