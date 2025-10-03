import React from "react";
import "../App.css";

const Dashboard = ({ user }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case "Lecturer": return "var(--primary-blue)";
      case "Student": return "var(--secondary-green)";
      case "PRL": return "var(--secondary-orange)";
      case "PL": return "var(--secondary-purple)";
      default: return "var(--primary-blue)";
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case "Lecturer": return "Submit and manage lecture reports, view assigned classes, and monitor progress.";
      case "Student": return "Monitor your classes, view reports, and rate courses and lecturers.";
      case "PRL": return "Review reports from your stream, provide feedback, and monitor activities.";
      case "PL": return "Manage courses, assign lectures, and oversee program activities.";
      default: return "Access your personalized dashboard and manage your activities.";
    }
  };

  return (
    <div className="section">
      <div className="container">
        {/* Welcome Header */}
        <div className="card fade-in">
          <h1 className="text-center mb-3">Welcome back, {user.name}!</h1>
          <div className="text-center">
            <span
              className="badge"
              style={{
                backgroundColor: getRoleColor(user.role),
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600'
              }}
            >
              {user.role}
            </span>
          </div>
          <p className="text-center mt-3 text-muted">
            {getRoleDescription(user.role)}
          </p>
        </div>

        
        {/* Role-specific Information */}
        <div className="card">
          <h2 className="mb-3">Your Role: {user.role}</h2>
          <div className="role-info">
            {user.role === "Lecturer" && (
              <div className="role-features">
                <h4>Available Actions:</h4>
                <ul>
                  <li>📝 Submit detailed lecture reports</li>
                  <li>📊 View assigned classes and schedules</li>
                  <li>📈 Monitor student progress</li>
                  <li>⭐ View ratings and feedback</li>
                </ul>
                <div className="mt-3">
                  <a href="/reports/new" className="btn btn-primary">Create Report</a>
                  <a href="/reports" className="btn btn-outline ml-2">View Reports</a>
                </div>
              </div>
            )}

            {user.role === "Student" && (
              <div className="role-features">
                <h4>Available Actions:</h4>
                <ul>
                  <li>📚 Monitor your enrolled classes</li>
                  <li>📋 View lecture reports and progress</li>
                  <li>⭐ Rate courses and lecturers</li>
                  <li>📈 Track your academic performance</li>
                </ul>
                <div className="mt-3">
                  <a href="/monitoring" className="btn btn-success">View Classes</a>
                  <a href="/ratings" className="btn btn-outline ml-2">Rate Courses</a>
                </div>
              </div>
            )}

            {user.role === "PRL" && (
              <div className="role-features">
                <h4>Available Actions:</h4>
                <ul>
                  <li>📊 Review reports from your stream</li>
                  <li>💬 Provide feedback on submissions</li>
                  <li>📈 Monitor stream activities</li>
                  <li>🏆 Manage quality standards</li>
                </ul>
                <div className="mt-3">
                  <a href="/reports" className="btn btn-warning">Review Reports</a>
                  <a href="/courses" className="btn btn-outline ml-2">View Courses</a>
                </div>
              </div>
            )}

            {user.role === "PL" && (
              <div className="role-features">
                <h4>Available Actions:</h4>
                <ul>
                  <li>🎯 Manage course modules</li>
                  <li>👨‍🏫 Assign lectures to staff</li>
                  <li>📊 Oversee program activities</li>
                  <li>📈 Monitor overall performance</li>
                </ul>
                <div className="mt-3">
                  <a href="/courses" className="btn btn-purple">Manage Courses</a>
                  <a href="/lectures" className="btn btn-outline ml-2">Assign Lectures</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
