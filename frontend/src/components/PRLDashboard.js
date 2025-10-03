import React, { useState, useEffect } from 'react';
import { 
  getPRLDashboard,
  getPRLAllReports,
  getPRLMonitoring,
  getPRLClasses,
  getPRLCourses,
  submitPRLFeedback,
  exportPRLReports,
  exportCoursesToExcel,
  exportRatingsToExcel,
  exportMonitoringToExcel,
  universalSearch
} from '../services/api';
import UniversalSearch from './UniversalSearch';
import AdvancedExport from './AdvancedExport';
import '../App.css';

const PRLDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [dashboardData, setDashboardData] = useState(null);
  const [reports, setReports] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [exportLoading, setExportLoading] = useState('');
  const [backendError, setBackendError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'monitoring') {
      fetchMonitoring();
    } else if (activeTab === 'classes') {
      fetchClasses();
    } else if (activeTab === 'rating') {
      fetchRatings();
    } else if (activeTab === 'courses') {
      fetchCourses();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setBackendError('');
      
      const response = await getPRLDashboard();
      console.log('PRL Dashboard API Response:', response.data);
      setDashboardData(response.data);
      
      // Always fetch fresh reports from backend
      await fetchReports();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setBackendError('Failed to load dashboard data from backend');
      // Even if dashboard fails, try to fetch reports directly
      await fetchReports();
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      console.log('PRL: Fetching reports from backend...');
      const response = await getPRLAllReports();
      console.log('PRL Reports API Response:', response);
      
      // Handle different response formats
      let reportsData = [];
      if (response.data) {
        reportsData = response.data.reports || response.data || [];
      }
      
      console.log(`PRL: Found ${reportsData.length} reports from backend`);
      setReports(reportsData);
      setBackendError('');
    } catch (error) {
      console.error('Error fetching reports from backend:', error);
      setBackendError('Cannot load reports from backend database');
      setReports([]);
    }
  };

  const fetchMonitoring = async () => {
    try {
      const response = await getPRLMonitoring();
      console.log('PRL Monitoring API Response:', response.data);
      setMonitoring(response.data);
    } catch (error) {
      console.error('Error fetching monitoring:', error);
      setMonitoring([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await getPRLClasses();
      console.log('PRL Classes API Response:', response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getPRLCourses();
      console.log('PRL Courses API Response:', response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchRatings = async () => {
    try {
      // For now, we'll use dashboard ratings or show empty
      if (dashboardData?.ratings) {
        setRatings(dashboardData.ratings);
      } else {
        setRatings([]);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setRatings([]);
    }
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    
    // Update the current tab with search results from backend
    if (results.reports) setReports(results.reports);
    if (results.monitoring) setMonitoring(results.monitoring);
    if (results.courses) setCourses(results.courses);
    if (results.classes) setClasses(results.classes);
    if (results.ratings) setRatings(results.ratings);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    fetchDashboardData(); // Reset to original backend data
  };

  const handleFeedbackChange = (reportId, text) => {
    setFeedback(prev => ({
      ...prev,
      [reportId]: text
    }));
  };

  const handleSubmitFeedback = async (reportId) => {
    if (!feedback[reportId]?.trim()) {
      alert('Please enter feedback before submitting');
      return;
    }

    setSubmitting(prev => ({ ...prev, [reportId]: true }));

    try {
      await submitPRLFeedback({
        report_id: reportId,
        feedback: feedback[reportId],
        reviewed_by: 'PRL'
      });

      alert('Feedback submitted successfully to backend!');
      // Refresh the reports from backend to show updated status
      await fetchReports();
      setFeedback(prev => ({ ...prev, [reportId]: '' }));
    } catch (error) {
      console.error('Error submitting feedback to backend:', error);
      alert('Failed to submit feedback to backend. Please try again.');
    } finally {
      setSubmitting(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleExportData = async (type) => {
    if (reports.length === 0) {
      alert('No reports available to export from backend.');
      return;
    }

    setExportLoading(type);
    
    try {
      let response;
      
      switch(type) {
        case 'reports':
          response = await exportPRLReports();
          break;
        case 'courses':
          response = await exportCoursesToExcel();
          break;
        case 'ratings':
          response = await exportRatingsToExcel();
          break;
        case 'monitoring':
          response = await exportMonitoringToExcel();
          break;
        default:
          return;
      }

      // Create download link for Excel file from backend
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prl-${type}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully from backend!`);
    } catch (error) {
      console.error(`Error exporting ${type} from backend:`, error);
      alert(`Failed to export ${type} from backend. Please try again.`);
    } finally {
      setExportLoading('');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'submitted': { class: 'status-submitted', text: 'Submitted' },
      'pending': { class: 'status-pending', text: 'Pending' },
      'pending review': { class: 'status-pending', text: 'Pending Review' },
      'reviewed': { class: 'status-reviewed', text: 'Reviewed' },
      'approved': { class: 'status-approved', text: 'Approved' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) return <div className="loading-overlay"><div className="loading">Loading PRL Dashboard from Backend...</div></div>;

  const stats = dashboardData?.stats || {};
  const streamInfo = dashboardData?.stream || {};
  const monitoringData = monitoring[0] || {};

  const displayData = searchResults ? searchResults : {
    reports, monitoring, courses, classes, ratings
  };

  return (
    <div className="container">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">PRL Dashboard</h1>
            <p className="page-subtitle">
              Welcome, {dashboardData?.prl?.name || 'PRL'} - {streamInfo.stream_name || 'Your Stream'}
              {streamInfo.faculty && ` • ${streamInfo.faculty}`}
            </p>
            {backendError && (
              <div style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                marginTop: '8px',
                fontSize: '14px'
              }}>
                {backendError}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button onClick={refreshData} className="btn btn-outline" style={{marginRight: '10px'}}>
              Refresh
            </button>
            <button onClick={() => handleExportData('reports')} className="btn btn-success">
              Export Full Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Universal Search */}
      <div className="search-section">
        <UniversalSearch 
          onSearchResults={handleSearchResults}
          placeholder="Search reports, courses, students, ratings..."
        />
        {searchResults && (
          <div className="search-results-info">
            <span>Showing search results ({Object.values(displayData).flat().length} items)</span>
            <button onClick={handleClearSearch} className="btn btn-outline btn-sm">
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Stats Overview - Removed the five cards section */}

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'reports', label: 'Reports' },
          { key: 'monitoring', label: 'Monitoring' },
          { key: 'courses', label: 'Courses' },
          { key: 'classes', label: 'Classes' },
          { key: 'rating', label: 'Ratings' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <div>
                <h3 className="card-title">Lecture Reports</h3>
                <p className="card-subtitle">
                  {searchResults ? 'Search Results' : 'Review and provide feedback for lecture reports from backend'}
                  {reports.length > 0 && ` • ${reports.length} report(s) found`}
                </p>
              </div>
              {reports.length > 0 && (
                <AdvancedExport 
                  moduleType="reports"
                  availableFilters={{
                    status: true,
                    course: true,
                    date: true
                  }}
                />
              )}
            </div>
          </div>
          <div className="card-content">
            {reports.length > 0 ? (
              <div className="reports-container">
                {reports.map(report => (
                  <div key={report.report_id} className="report-card">
                    <div className="report-header">
                      <div className="report-course-info">
                        <h4>{report.course_name || 'Unnamed Course'}</h4>
                        <span className="course-code">{report.course_code || 'N/A'}</span>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    <div className="report-meta">
                      <div className="meta-item">
                        <span>{report.lecturer_name || 'Lecturer Not Assigned'}</span>
                      </div>
                      <div className="meta-item">
                        <span>{report.report_date ? new Date(report.report_date).toLocaleDateString() : 'Date Not Set'}</span>
                      </div>
                      <div className="meta-item">
                        <span>{report.actual_students || 0}/{report.total_students || 0} students</span>
                      </div>
                      <div className="meta-item">
                        <span>
                          {report.total_students ? 
                            `${Math.round(((report.actual_students || 0) / report.total_students) * 100)}% attendance` : 
                            'Attendance N/A'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="report-content">
                      <div className="content-section">
                        <label>Topic Taught:</label>
                        <p>{report.topic_taught || 'No topic specified'}</p>
                      </div>

                      <div className="content-section">
                        <label>Learning Outcomes:</label>
                        <p>{report.learning_outcomes || 'No learning outcomes specified'}</p>
                      </div>

                      <div className="content-section">
                        <label>Recommendations:</label>
                        <p>{report.recommendations || 'No recommendations provided'}</p>
                      </div>

                      {/* PRL Feedback Section */}
                      <div className="feedback-section">
                        <label>Add Your Feedback:</label>
                        <textarea
                          placeholder="Provide constructive feedback for this lecture report..."
                          value={feedback[report.report_id] || ''}
                          onChange={(e) => handleFeedbackChange(report.report_id, e.target.value)}
                          className="feedback-textarea"
                          rows="3"
                          disabled={submitting[report.report_id] || report.status?.toLowerCase() === 'reviewed'}
                        />
                        
                        {report.prl_feedback && (
                          <div className="existing-feedback">
                            <strong>Your Previous Feedback:</strong>
                            <p>{report.prl_feedback}</p>
                          </div>
                        )}

                        <div className="feedback-actions">
                          <button
                            onClick={() => handleSubmitFeedback(report.report_id)}
                            className="btn btn-primary"
                            disabled={
                              !feedback[report.report_id]?.trim() || 
                              submitting[report.report_id] ||
                              report.status?.toLowerCase() === 'reviewed'
                            }
                          >
                            {submitting[report.report_id] ? (
                              <>
                                <span className="loading-small"></span>
                                Submitting...
                              </>
                            ) : (
                              'Submit Feedback'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">No Lecture Reports Available</h3>
                <p className="empty-text">There are no lecture reports submitted for review yet.</p>
                <p className="empty-subtext">
                  Reports will appear here automatically once lecturers submit their lecture reports to the backend database.
                </p>
                <div className="empty-actions">
                  <button className="btn btn-primary" onClick={fetchReports}>
                    Refresh from Backend
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <div>
                <h3 className="card-title">Stream Monitoring</h3>
                <p className="card-subtitle">Performance and attendance overview from backend</p>
              </div>
              {monitoring.length > 0 && (
                <AdvancedExport 
                  moduleType="monitoring"
                  availableFilters={{
                    date: true,
                    course: true
                  }}
                />
              )}
            </div>
          </div>
          <div className="card-content">
            {monitoring.length > 0 ? (
              <div className="monitoring-grid">
                {monitoring.map((item, index) => (
                  <div key={index} className="monitoring-card">
                    <div className="monitoring-info">
                      <label>{item.metric || 'Metric'}</label>
                      <span className="stat-value large">{item.value || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">No Monitoring Data Available</h3>
                <p className="empty-text">Monitoring data will appear here once available from backend.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <div>
                <h3 className="card-title">Courses in Your Stream</h3>
                <p className="card-subtitle">All courses assigned to your stream from backend</p>
              </div>
              {courses.length > 0 && (
                <AdvancedExport 
                  moduleType="courses"
                  availableFilters={{
                    status: true
                  }}
                />
              )}
            </div>
          </div>
          <div className="card-content">
            {courses.length > 0 ? (
              <div className="courses-grid">
                {courses.map(course => (
                  <div key={course.course_id} className="course-card">
                    <div className="course-header">
                      <h4>{course.course_name}</h4>
                      <span className="course-code">{course.course_code}</span>
                    </div>
                    <div className="course-details">
                      <p><strong>Lecturer:</strong> {course.lecturer_name || 'Not assigned'}</p>
                      <p><strong>Credits:</strong> {course.credits || 'N/A'}</p>
                      <p><strong>Status:</strong> 
                        <span className={`status-badge ${course.lecturer_name ? 'active' : 'inactive'}`}>
                          {course.lecturer_name ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">No Courses Assigned</h3>
                <p className="empty-text">There are no courses assigned to your stream yet.</p>
                <p className="empty-subtext">
                  Courses will appear here once they are assigned to your stream by the Program Leader in the backend.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Classes in Your Stream</h3>
            <p className="card-subtitle">All classes scheduled in your stream from backend</p>
          </div>
          <div className="card-content">
            {classes.length > 0 ? (
              <div className="classes-grid">
                {classes.map(classItem => (
                  <div key={classItem.class_id} className="class-card">
                    <div className="class-header">
                      <h4>{classItem.class_name || 'Unnamed Class'}</h4>
                      <span className="class-code">{classItem.class_code || 'N/A'}</span>
                    </div>
                    <div className="class-details">
                      <p><strong>Course:</strong> {classItem.course_name || 'N/A'}</p>
                      <p><strong>Lecturer:</strong> {classItem.lecturer_name || 'Not assigned'}</p>
                      <p><strong>Schedule:</strong> {classItem.schedule_time || 'Not scheduled'}</p>
                      <p><strong>Venue:</strong> {classItem.venue || 'Not assigned'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">No Classes Scheduled</h3>
                <p className="empty-text">There are no classes scheduled in your stream yet.</p>
                <p className="empty-subtext">
                  Classes will appear here once they are scheduled for your stream in the backend.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating Tab */}
      {activeTab === 'rating' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-content">
              <div>
                <h3 className="card-title">Lecturer Ratings</h3>
                <p className="card-subtitle">Student ratings and feedback for lecturers from backend</p>
              </div>
              {ratings.length > 0 && (
                <AdvancedExport 
                  moduleType="ratings"
                  availableFilters={{
                    date: true
                  }}
                />
              )}
            </div>
          </div>
          <div className="card-content">
            {ratings.length > 0 ? (
              <div className="ratings-list">
                {ratings.map(rating => (
                  <div key={rating.rating_id} className="rating-item">
                    <div className="rating-header">
                      <div className="rating-info">
                        <strong className="lecturer-name">{rating.lecturer_name}</strong>
                        {rating.course_name && (
                          <span className="course-tag">{rating.course_name}</span>
                        )}
                        <div className="rating-stars">
                          <span className="rating-value">({rating.rating || 0}/5)</span>
                        </div>
                      </div>
                      <small className="rating-date">
                        {rating.created_at ? new Date(rating.created_at).toLocaleDateString() : 'Recent'}
                      </small>
                    </div>
                    {rating.feedback && (
                      <p className="rating-feedback">"{rating.feedback}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3 className="empty-title">No Ratings Available</h3>
                <p className="empty-text">There are no student ratings available yet.</p>
                <p className="empty-subtext">
                  Ratings will appear here once students rate the lecturers in your stream and data is saved to backend.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PRLDashboard;