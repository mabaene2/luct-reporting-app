import React, { useState, useEffect } from 'react';
import { 
  getPLDashboard,
  getPLCourses,
  getPLReports,
  getPLMonitoring,
  getPLClasses,
  getPLLectures,
  createCourse,
  assignLecture,
  searchCourses,
  searchReports,
  exportReportsToExcel
} from '../services/api';
import '../App.css';

const PLDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [dashboardData, setDashboardData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    course_code: '',
    course_name: '',
    credits: '',
    stream_id: '',
    description: ''
  });
  const [lectureForm, setLectureForm] = useState({
    course_id: '',
    lecturer_id: '',
    class_schedule: '',
    venue: '',
    schedule_days: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'monitoring') {
      fetchMonitoring();
    } else if (activeTab === 'classes') {
      fetchClasses();
    } else if (activeTab === 'lectures') {
      fetchLectures();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await getPLDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getPLCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await getPLReports();
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchMonitoring = async () => {
    try {
      const response = await getPLMonitoring();
      setMonitoring(response.data);
    } catch (error) {
      console.error('Error fetching monitoring:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await getPLClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchLectures = async () => {
    try {
      const response = await getPLLectures();
      setLectures(response.data);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    }
  };

  const handleSearch = async () => {
    try {
      let response;
      if (activeTab === 'courses') {
        response = await searchCourses(searchQuery);
        setCourses(response.data);
      } else if (activeTab === 'reports') {
        response = await searchReports(searchQuery);
        setReports(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await createCourse(courseForm);
      alert('Course created successfully!');
      setShowCourseForm(false);
      setCourseForm({
        course_code: '', course_name: '', credits: '', stream_id: '', description: ''
      });
      fetchCourses();
    } catch (error) {
      alert('Error creating course');
      console.error('Create course error:', error);
    }
  };

  const handleAssignLecture = async (e) => {
    e.preventDefault();
    try {
      await assignLecture(lectureForm);
      alert('Lecture assigned successfully!');
      setShowLectureForm(false);
      setLectureForm({
        course_id: '', lecturer_id: '', class_schedule: '', venue: '', schedule_days: ''
      });
      fetchLectures();
      fetchClasses();
    } catch (error) {
      alert('Error assigning lecture');
      console.error('Assign lecture error:', error);
    }
  };

  const handleExportToExcel = async () => {
    setExportLoading(true);
    try {
      const response = await exportReportsToExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `program-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exporting to Excel');
      console.error('Export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="loading"></div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Program Leader Dashboard</h1>
        <p className="page-subtitle">
          Welcome, {dashboardData?.pl?.employee_number} - {dashboardData?.pl?.program_name} Program
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
          {activeTab === 'reports' && (
            <button 
              onClick={handleExportToExcel} 
              className="btn btn-success"
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export to Excel'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'courses', label: 'Courses' },
          { key: 'reports', label: 'Reports' },
          { key: 'monitoring', label: 'Monitoring' },
          { key: 'classes', label: 'Classes' },
          { key: 'lectures', label: 'Lectures' },
          { key: 'rating', label: 'Rating' }
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

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="form-row">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Program Courses</h3>
              <button 
                onClick={() => setShowCourseForm(!showCourseForm)}
                className="btn btn-primary"
              >
                {showCourseForm ? 'Cancel' : 'Add Course'}
              </button>
            </div>
            
            {/* Course Creation Form */}
            {showCourseForm && (
              <div className="card-content">
                <form onSubmit={handleCreateCourse} className="form">
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      value={courseForm.course_code}
                      onChange={(e) => setCourseForm({...courseForm, course_code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input
                      type="text"
                      value={courseForm.course_name}
                      onChange={(e) => setCourseForm({...courseForm, course_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Credits *</label>
                      <input
                        type="number"
                        value={courseForm.credits}
                        onChange={(e) => setCourseForm({...courseForm, credits: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Stream ID *</label>
                      <input
                        type="number"
                        value={courseForm.stream_id}
                        onChange={(e) => setCourseForm({...courseForm, stream_id: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="btn btn-success">Create Course</button>
                </form>
              </div>
            )}

            {/* Courses List */}
            <div className="card-content">
              {courses.length === 0 ? (
                <p className="text-muted">No courses found in your program.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Stream</th>
                        <th>Program</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={index}>
                          <td><strong>{course.course_code}</strong></td>
                          <td>{course.course_name}</td>
                          <td>{course.credits}</td>
                          <td>{course.stream_name}</td>
                          <td>{course.program_name}</td>
                          <td>
                            <span className={`status-badge active`}>
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Program Reports from PRLs</h3>
            <span className="badge">{reports.length} reports</span>
          </div>
          <div className="card-content">
            {reports.length === 0 ? (
              <p className="text-muted">No reports available from PRLs.</p>
            ) : (
              <div className="reports-list">
                {reports.map((report, index) => (
                  <div key={index} className="report-item">
                    <div className="report-header">
                      <div>
                        <h4>{report.course_name} - {report.class_name}</h4>
                        <p className="report-meta">
                          By {report.lecturer_name} • Stream: {report.stream_name} • 
                          {new Date(report.date_of_lecture).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="stream-badge">{report.stream_name}</span>
                    </div>
                    
                    <div className="report-content">
                      <p><strong>Topic:</strong> {report.topic_taught}</p>
                      <p><strong>Learning Outcomes:</strong> {report.learning_outcomes}</p>
                      <p><strong>Recommendations:</strong> {report.recommendations}</p>
                    </div>

                    {/* PRL Feedback */}
                    {report.prl_feedback && (
                      <div className="prl-feedback">
                        <strong>PRL Feedback:</strong>
                        <p>{report.prl_feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="form-row">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Program Performance Overview</h3>
            </div>
            <div className="card-content">
              {dashboardData?.monitoring && (
                <div className="monitoring-stats">
                  <div className="monitoring-item">
                    <label>Enrollment Rate:</label>
                    <span className="stat-value">{dashboardData.monitoring.enrollment_rate}%</span>
                  </div>
                  <div className="monitoring-item">
                    <label>Completion Rate:</label>
                    <span className="stat-value">{dashboardData.monitoring.program_completion_rate}%</span>
                  </div>
                  <div className="monitoring-item">
                    <label>Overall Attendance:</label>
                    <span className="stat-value">{dashboardData.monitoring.overall_attendance_rate}%</span>
                  </div>
                  <div className="monitoring-item">
                    <label>Budget Utilization:</label>
                    <span className="stat-value">{dashboardData.monitoring.budget_utilization}%</span>
                  </div>
                </div>
              )}

              <h4>Stream-wise Performance</h4>
              {monitoring.length === 0 ? (
                <p className="text-muted">No monitoring data available.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Stream</th>
                        <th>Total Courses</th>
                        <th>Avg Attendance</th>
                        <th>Avg Grade</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitoring.map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.stream_name}</strong></td>
                          <td>{item.total_courses}</td>
                          <td>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${item.avg_attendance}%` }}
                              ></div>
                              <span>{item.avg_attendance}%</span>
                            </div>
                          </td>
                          <td>{item.avg_grade || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${(item.avg_attendance > 75) ? 'good' : (item.avg_attendance > 60) ? 'warning' : 'poor'}`}>
                              {(item.avg_attendance > 75) ? 'Excellent' : (item.avg_attendance > 60) ? 'Good' : 'Needs Improvement'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">All Classes in Program</h3>
          </div>
          <div className="card-content">
            {classes.length === 0 ? (
              <p className="text-muted">No classes found in your program.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class Code</th>
                      <th>Course</th>
                      <th>Stream</th>
                      <th>Venue</th>
                      <th>Schedule</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classItem, index) => (
                      <tr key={index}>
                        <td><strong>{classItem.class_code}</strong></td>
                        <td>{classItem.course_name}</td>
                        <td>{classItem.stream_name}</td>
                        <td>{classItem.venue}</td>
                        <td>{classItem.schedule_time}</td>
                        <td>
                          <span className="status-badge active">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lectures Tab */}
      {activeTab === 'lectures' && (
        <div className="form-row">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Lecture Scheduling</h3>
              <button 
                onClick={() => setShowLectureForm(!showLectureForm)}
                className="btn btn-primary"
              >
                {showLectureForm ? 'Cancel' : 'Assign Lecture'}
              </button>
            </div>
            
            {/* Lecture Assignment Form */}
            {showLectureForm && (
              <div className="card-content">
                <form onSubmit={handleAssignLecture} className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Course ID *</label>
                      <input
                        type="number"
                        value={lectureForm.course_id}
                        onChange={(e) => setLectureForm({...lectureForm, course_id: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Lecturer ID *</label>
                      <input
                        type="number"
                        value={lectureForm.lecturer_id}
                        onChange={(e) => setLectureForm({...lectureForm, lecturer_id: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Class Schedule *</label>
                      <input
                        type="text"
                        placeholder="e.g., 09:00-10:30"
                        value={lectureForm.class_schedule}
                        onChange={(e) => setLectureForm({...lectureForm, class_schedule: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Venue *</label>
                      <input
                        type="text"
                        value={lectureForm.venue}
                        onChange={(e) => setLectureForm({...lectureForm, venue: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Schedule Days</label>
                    <input
                      type="text"
                      placeholder="e.g., Mon, Wed, Fri"
                      value={lectureForm.schedule_days}
                      onChange={(e) => setLectureForm({...lectureForm, schedule_days: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn btn-success">Assign Lecture</button>
                </form>
              </div>
            )}

            {/* Lectures List */}
            <div className="card-content">
              {lectures.length === 0 ? (
                <p className="text-muted">No lectures scheduled.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Lecture ID</th>
                        <th>Course</th>
                        <th>Lecturer</th>
                        <th>Schedule</th>
                        <th>Venue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lectures.map((lecture, index) => (
                        <tr key={index}>
                          <td>LEC-{lecture.lecture_id}</td>
                          <td>{lecture.course_name}</td>
                          <td>{lecture.lecturer_name}</td>
                          <td>{lecture.schedule_time}</td>
                          <td>{lecture.venue}</td>
                          <td>
                            <span className="status-badge active">Scheduled</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Tab */}
      {activeTab === 'rating' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Program-wide Ratings</h3>
          </div>
          <div className="card-content">
            {dashboardData?.ratings?.length === 0 ? (
              <p className="text-muted">No ratings available across the program.</p>
            ) : (
              <div className="ratings-list">
                {(dashboardData?.ratings || []).map((rating, index) => (
                  <div key={index} className="rating-item">
                    <div className="rating-header">
                      <div>
                        <strong>{rating.lecturer_name}</strong>
                        <div className="rating-stars">
                          <span className="rating-value">({rating.rating}/5)</span>
                        </div>
                      </div>
                      <small>{new Date(rating.created_at).toLocaleDateString()}</small>
                    </div>
                    {rating.feedback && (
                      <p className="rating-feedback">"{rating.feedback}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PLDashboard;