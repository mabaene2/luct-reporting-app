import React, { useState, useEffect } from 'react';
import { getStudentMonitoring } from '../services/api';
import '../App.css';

const StudentMonitoring = () => {
  const [monitoringData, setMonitoringData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        const response = await getStudentMonitoring();
        
        // Handle different response formats safely
        let data = response.data;
        
        // If data is not an array, convert it to array format
        if (!Array.isArray(data)) {
          if (data && typeof data === 'object') {
            // If it's a single monitoring object, wrap it in array
            data = [data];
          } else {
            // If data is null/undefined or not object, set empty array
            data = [];
          }
        }
        
        setMonitoringData(data);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        setMonitoringData([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();
  }, []);

  if (loading) return <div className="loading-overlay"><div className="loading"></div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Academic Monitoring</h1>
        <p className="page-subtitle">Track your academic progress and performance</p>
      </div>

      {/* Monitoring Data */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Course Performance</h3>
        </div>
        <div className="card-content">
          {!monitoringData || monitoringData.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">No monitoring data available yet.</p>
              <p className="text-muted">Your performance data will appear here once available.</p>
            </div>
          ) : (
            <div className="monitoring-grid">
              {monitoringData.map((item, index) => (
                <div key={index} className="monitoring-card">
                  <div className="monitoring-card-header">
                    <h4>{item.course_name || 'Unknown Course'}</h4>
                    <span className={`status-badge ${
                      item.overall_performance === 'Excellent' ? 'good' : 
                      item.overall_performance === 'Good' ? 'good' :
                      item.overall_performance === 'Average' ? 'warning' : 'poor'
                    }`}>
                      {item.overall_performance || 'No Data'}
                    </span>
                  </div>
                  
                  <div className="monitoring-stats">
                    <div className="stat-row">
                      <span className="stat-label">Attendance:</span>
                      <span className="stat-value">{item.attendance_percentage || 0}%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Average Grade:</span>
                      <span className="stat-value">{item.average_grade || 'N/A'}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Assignments:</span>
                      <span className="stat-value">
                        {item.assignments_submitted || 0} submitted, {item.assignments_pending || 0} pending
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Risk Level:</span>
                      <span className={`status-badge ${
                        item.risk_level === 'Low' ? 'good' :
                        item.risk_level === 'Medium' ? 'warning' : 'poor'
                      }`}>
                        {item.risk_level || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {monitoringData && monitoringData.length > 0 && (
        <div className="form-row mt-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📈 Performance Insights</h3>
            </div>
            <div className="card-content">
              <div className="insights-grid">
                <div className="insight-item">
                  <h4>Attendance Trend</h4>
                  <p>Your overall attendance is good. Maintain consistency in class participation.</p>
                </div>
                <div className="insight-item">
                  <h4>Assignment Progress</h4>
                  <p>You have submitted most assignments on time. Keep up the good work!</p>
                </div>
                <div className="insight-item">
                  <h4>Grade Improvement</h4>
                  <p>Focus on areas where you can improve your scores in upcoming assessments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMonitoring;