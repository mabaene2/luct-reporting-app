import React, { useState, useEffect } from 'react';
import { 
  getLecturerClasses, 
  getLecturerReports,
  getLecturerMonitoringData,
  getLecturerStudents,
  getLecturerCourses,
  addStudentMonitoring,
  getLecturerRatings,
  createReport,
  searchLecturerData,
  exportReportsToExcel
} from '../services/api';

const LecturerDashboard = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [monitoring, setMonitoring] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Monitoring form state
  const [monitoringForm, setMonitoringForm] = useState({
    student_id: "",
    course_id: "",
    attendance: "present",
    grade: "",
    feedback: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // Report form state
  const [reportForm, setReportForm] = useState({
    faculty_name: 'Faculty of Information Technology',
    class_name: 'BIT2201-B',
    week_of_reporting: '',
    date_of_lecture: new Date().toISOString().split('T')[0],
    course_name: 'Web Development',
    course_code: 'BIT2201',
    lecturer_name: '',
    actual_students: '33',
    total_students: '35',
    venue: 'Computer Lab 3',
    lecture_time: 'Tuesday, 2:00 PM - 4:00 PM',
    topic_taught: 'React.js Fundamentals and Component Architecture',
    learning_outcomes: 'Students can create functional components and manage state',
    recommendations: 'More practice with hooks needed'
  });

  // Class form state
  const [classForm, setClassForm] = useState({
    course_name: '',
    course_code: '',
    venue: '',
    schedule_days: '',
    schedule_time: '',
    students_count: ''
  });

  // Rating form state
  const [ratingForm, setRatingForm] = useState({
    course_id: '',
    rating: 5,
    feedback: '',
    anonymous: false
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'classes') {
        try {
          const response = await getLecturerClasses(user.id);
          setClasses(response.data);
        } catch (error) {
          console.log('No classes data from backend');
          setClasses([]);
        }
      } else if (activeTab === 'reports') {
        try {
          const response = await getLecturerReports(user.id);
          console.log('Lecturer reports from backend:', response.data);
          setReports(response.data);
        } catch (error) {
          console.log('No reports from backend yet');
          setReports([]);
        }
      } else if (activeTab === 'monitoring') {
        try {
          const response = await getLecturerMonitoringData(user.id);
          setMonitoring(response.data);
        } catch (error) {
          console.log('No monitoring data from backend yet');
          setMonitoring([]);
        }
        
        try {
          const studentsRes = await getLecturerStudents(user.id);
          setStudents(studentsRes.data);
        } catch (error) {
          console.log('No students data from backend');
          setStudents([]);
        }
        
        try {
          const coursesRes = await getLecturerCourses(user.id);
          setCourses(coursesRes.data);
        } catch (error) {
          console.log('No courses data from backend');
          setCourses([]);
        }
      } else if (activeTab === 'rating') {
        try {
          const response = await getLecturerRatings(user.id);
          setRatings(response.data);
        } catch (error) {
          console.log('No ratings from backend yet');
          setRatings([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      const reportData = {
        ...reportForm,
        report_id: 'RPT-' + Date.now(),
        lecturer_id: user.id,
        lecturer_name: user.name || 'Dr. Johnson',
        status: 'submitted',
        created_at: new Date().toISOString(),
        report_date: reportForm.date_of_lecture
      };

      console.log('Submitting report:', reportData);

      // Submit to backend
      const response = await createReport(reportData);
      
      console.log('Report submitted successfully:', response.data);
      
      alert('Report submitted successfully!');
      
      // Refresh the reports list from backend
      await loadData();
      
      // Reset form but keep some values for convenience
      setReportForm(prev => ({
        ...prev,
        week_of_reporting: '',
        date_of_lecture: new Date().toISOString().split('T')[0],
        topic_taught: '',
        learning_outcomes: '',
        recommendations: '',
        actual_students: '33',
        total_students: '35'
      }));
      
    } catch (error) {
      console.error('Report submission failed:', error);
      
      if (error.response?.status === 500) {
        alert('Database Error: Unable to save report. Please try again later.');
      } else if (error.response) {
        alert(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        alert('Cannot connect to server. Please check your connection.');
      } else {
        alert('Unexpected error: ' + error.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitMonitoring = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      const selectedStudent = students.find(s => s.id == monitoringForm.student_id);
      const selectedCourse = courses.find(c => c.id == monitoringForm.course_id);
      
      const monitoringData = {
        student_id: monitoringForm.student_id,
        student_name: selectedStudent?.name || 'Unknown Student',
        course_id: monitoringForm.course_id,
        course_name: selectedCourse?.name || 'Unknown Course',
        attendance: monitoringForm.attendance,
        grade: monitoringForm.grade,
        feedback: monitoringForm.feedback,
        date: monitoringForm.date,
        lecturer_id: user.id,
        lecturer_name: user.name || 'Dr. Johnson'
      };

      await addStudentMonitoring(monitoringData);
      alert('Monitoring data saved successfully!');
      
      // Refresh data
      await loadData();
      
      // Reset form
      setMonitoringForm({
        student_id: "",
        course_id: "",
        attendance: "present",
        grade: "",
        feedback: "",
        date: new Date().toISOString().split('T')[0]
      });
      
    } catch (error) {
      console.error('Error submitting monitoring data:', error);
      alert('Failed to save monitoring data.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitClass = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // In a real application, you would call an API to create a class
      // For now, we'll simulate it by adding to local state
      const newClass = {
        id: Date.now(),
        ...classForm,
        lecturer_id: user.id,
        lecturer_name: user.name || 'Dr. Johnson',
        created_at: new Date().toISOString()
      };
      
      setClasses(prev => [...prev, newClass]);
      alert('Class information saved successfully!');
      
      // Reset form
      setClassForm({
        course_name: '',
        course_code: '',
        venue: '',
        schedule_days: '',
        schedule_time: '',
        students_count: ''
      });
      
    } catch (error) {
      console.error('Error submitting class data:', error);
      alert('Failed to save class information.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // In a real application, you would call an API to submit a rating
      // For now, we'll simulate it by adding to local state
      const selectedCourse = courses.find(c => c.id == ratingForm.course_id);
      
      const newRating = {
        id: Date.now(),
        course_id: ratingForm.course_id,
        course_name: selectedCourse?.name || 'Unknown Course',
        rating: ratingForm.rating,
        feedback: ratingForm.feedback,
        anonymous: ratingForm.anonymous,
        created_at: new Date().toISOString(),
        student_name: ratingForm.anonymous ? 'Anonymous' : 'Student'
      };
      
      setRatings(prev => [...prev, newRating]);
      alert('Rating submitted successfully!');
      
      // Reset form
      setRatingForm({
        course_id: '',
        rating: 5,
        feedback: '',
        anonymous: false
      });
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMonitoringChange = (e) => {
    const { name, value } = e.target;
    setMonitoringForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClassFormChange = (e) => {
    const { name, value } = e.target;
    setClassForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRatingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await searchLecturerData(searchQuery, user.id);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    loadData();
  };

  const exportReportsToExcelFunction = async () => {
    if (reports.length === 0) {
      alert('No reports available to export.');
      return;
    }

    setExportLoading(true);
    try {
      const response = await exportReportsToExcel();
      
      // Create download link for Excel file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Reports exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting reports:', error);
      alert('Failed to export reports. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const displayData = searchResults || {
    classes, reports, monitoring, ratings, courses, students
  };

  const displayReports = displayData.reports || [];

  return (
    <div className="container">
      <div className="page-header">
        <h1>Lecturer Dashboard</h1>
        <p>Welcome, {user.name || 'Dr. Johnson'} (Web Development Lecturer)</p>
      </div>

      {/* Search Bar */}
      <div className="search-section" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearch} className="search-form" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search reports, classes, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searchQuery && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              className="btn btn-outline"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="tabs">
        {['classes', 'reports', 'monitoring', 'rating'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'classes' && 'Classes'}
            {tab === 'reports' && 'Reports'}
            {tab === 'monitoring' && 'Student Monitoring'}
            {tab === 'rating' && 'My Ratings'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading">Loading data...</div>
      )}

      {/* Search Results Info */}
      {searchResults && (
        <div style={{ 
          background: '#e7f3ff', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Showing search results for: "{searchQuery}"</span>
            <button onClick={handleClearSearch} className="btn btn-outline btn-sm">
              Show All
            </button>
          </div>
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && !loading && (
        <div className="form-row">
          <div className="card">
            <h3>Add Class Information</h3>
            <form onSubmit={handleSubmitClass} className="class-form">
              <div className="form-group">
                <label>Course Name:</label>
                <input 
                  type="text" 
                  name="course_name"
                  value={classForm.course_name}
                  onChange={handleClassFormChange}
                  placeholder="e.g., Web Development"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Course Code:</label>
                <input 
                  type="text" 
                  name="course_code"
                  value={classForm.course_code}
                  onChange={handleClassFormChange}
                  placeholder="e.g., BIT2201"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Venue:</label>
                <input 
                  type="text" 
                  name="venue"
                  value={classForm.venue}
                  onChange={handleClassFormChange}
                  placeholder="e.g., Computer Lab 3"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Schedule Days:</label>
                <input 
                  type="text" 
                  name="schedule_days"
                  value={classForm.schedule_days}
                  onChange={handleClassFormChange}
                  placeholder="e.g., Monday, Wednesday"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Schedule Time:</label>
                <input 
                  type="text" 
                  name="schedule_time"
                  value={classForm.schedule_time}
                  onChange={handleClassFormChange}
                  placeholder="e.g., 2:00 PM - 4:00 PM"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Number of Students:</label>
                <input 
                  type="number" 
                  name="students_count"
                  value={classForm.students_count}
                  onChange={handleClassFormChange}
                  placeholder="e.g., 35"
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : 'Save Class Information'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>My Classes</h3>
            {displayData.classes && displayData.classes.length === 0 ? (
              <div className="empty-state">
                <p>No classes assigned yet.</p>
                <p><strong>Add your first class using the form on the left!</strong></p>
              </div>
            ) : (
              <div className="classes-grid">
                {(displayData.classes || []).map((classItem, index) => (
                  <div key={classItem.id || index} className="class-card">
                    <h4>{classItem.course_name}</h4>
                    <p><strong>Code:</strong> {classItem.course_code}</p>
                    <p><strong>Venue:</strong> {classItem.venue}</p>
                    <p><strong>Schedule:</strong> {classItem.schedule_time}</p>
                    <p><strong>Days:</strong> {classItem.schedule_days}</p>
                    {classItem.students_count && (
                      <p><strong>Students:</strong> {classItem.students_count}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && !loading && (
        <div className="form-row">
          <div className="card">
            <h3>Submit New Report</h3>
            
            <form onSubmit={handleSubmitReport} className="report-form">
              <div className="form-group">
                <label>Faculty Name:</label>
                <input 
                  type="text" 
                  name="faculty_name"
                  value={reportForm.faculty_name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Class Name:</label>
                <input 
                  type="text" 
                  name="class_name"
                  value={reportForm.class_name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Week of Reporting:</label>
                <input 
                  type="text" 
                  name="week_of_reporting"
                  placeholder="e.g., Week 5, Semester 1"
                  value={reportForm.week_of_reporting}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Date of Lecture:</label>
                <input 
                  type="date" 
                  name="date_of_lecture"
                  value={reportForm.date_of_lecture}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Course Name:</label>
                <input 
                  type="text" 
                  name="course_name"
                  value={reportForm.course_name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Course Code:</label>
                <input 
                  type="text" 
                  name="course_code"
                  value={reportForm.course_code}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Lecturer Name:</label>
                <input 
                  type="text" 
                  name="lecturer_name"
                  value={reportForm.lecturer_name || user.name || 'Dr. Johnson'}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Actual Students:</label>
                  <input 
                    type="number" 
                    name="actual_students"
                    value={reportForm.actual_students}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Total Students:</label>
                  <input 
                    type="number" 
                    name="total_students"
                    value={reportForm.total_students}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Venue:</label>
                <input 
                  type="text" 
                  name="venue"
                  value={reportForm.venue}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Lecture Time:</label>
                <input 
                  type="text" 
                  name="lecture_time"
                  value={reportForm.lecture_time}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Topic Taught:</label>
                <textarea 
                  name="topic_taught"
                  placeholder="What topics did you cover in this lecture?"
                  value={reportForm.topic_taught}
                  onChange={handleInputChange}
                  rows="3"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Learning Outcomes:</label>
                <textarea 
                  name="learning_outcomes"
                  placeholder="What did students learn or achieve?"
                  value={reportForm.learning_outcomes}
                  onChange={handleInputChange}
                  rows="3"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Recommendations:</label>
                <textarea 
                  name="recommendations"
                  placeholder="Any suggestions for improvement or next steps?"
                  value={reportForm.recommendations}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitLoading}
              >
                {submitLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Previous Reports ({displayReports.length})</h3>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  exportReportsToExcelFunction();
                }}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#218838';
                  e.target.style.textDecoration = 'none';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#28a745';
                  e.target.style.textDecoration = 'none';
                }}
              >
                {exportLoading ? 'Exporting...' : 'Export to Excel'}
              </a>
            </div>

            {displayReports.length === 0 ? (
              <div className="empty-state">
                <p>No reports submitted yet.</p>
                <p><strong>Submit your first report using the form on the left!</strong></p>
              </div>
            ) : (
              <div className="reports-list">
                {displayReports.map((report, index) => (
                  <div key={report.id || report.report_id || index} className="report-item">
                    <div className="report-header">
                      <h4>{report.course_name} - {report.class_name}</h4>
                      <span className={`status-badge ${report.status || 'submitted'}`}>
                        {report.status || 'submitted'}
                      </span>
                    </div>
                    
                    <div className="report-details">
                      <p><strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}</p>
                      <p><strong>Attendance:</strong> {report.actual_students}/{report.total_students} students 
                        <span className="attendance-percent">
                          ({((report.actual_students/report.total_students)*100).toFixed(1)}%)
                        </span>
                      </p>
                      <p><strong>Topic:</strong> {report.topic_taught}</p>
                      <p><strong>Outcomes:</strong> {report.learning_outcomes}</p>
                      {report.recommendations && (
                        <p><strong>Recommendations:</strong> {report.recommendations}</p>
                      )}
                      <p><strong>Report ID:</strong> {report.report_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && !loading && (
        <div className="form-row">
          <div className="card">
            <h3>Add Student Monitoring</h3>
            <form onSubmit={handleSubmitMonitoring} className="monitoring-form">
              <div className="form-group">
                <label>Student:</label>
                <select 
                  name="student_id"
                  value={monitoringForm.student_id}
                  onChange={handleMonitoringChange}
                  required
                >
                  <option value="">Select Student</option>
                  {(displayData.students || []).map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.student_id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Course:</label>
                <select 
                  name="course_id"
                  value={monitoringForm.course_id}
                  onChange={handleMonitoringChange}
                  required
                >
                  <option value="">Select Course</option>
                  {(displayData.courses || []).map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Attendance:</label>
                <select 
                  name="attendance"
                  value={monitoringForm.attendance}
                  onChange={handleMonitoringChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Grade:</label>
                <input 
                  type="text" 
                  name="grade"
                  placeholder="e.g., A, B, 85%"
                  value={monitoringForm.grade}
                  onChange={handleMonitoringChange}
                />
              </div>
              
              <div className="form-group">
                <label>Feedback:</label>
                <textarea 
                  name="feedback"
                  placeholder="Student performance feedback..."
                  value={monitoringForm.feedback}
                  onChange={handleMonitoringChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Date:</label>
                <input 
                  type="date" 
                  name="date"
                  value={monitoringForm.date}
                  onChange={handleMonitoringChange}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Save Monitoring Data'}
              </button>
            </form>
          </div>
          
          <div className="card">
            <h3>Monitoring History</h3>
            {displayData.monitoring && displayData.monitoring.length === 0 ? (
              <p>No monitoring data recorded yet.</p>
            ) : (
              <div className="monitoring-list">
                {(displayData.monitoring || []).map((record, index) => (
                  <div key={record.id || index} className="monitoring-item">
                    <p><strong>{record.student_name}</strong> - {record.course_name}</p>
                    <p>Attendance: {record.attendance} | Grade: {record.grade || 'N/A'}</p>
                    <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                    {record.feedback && <p>Feedback: {record.feedback}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating Tab */}
      {activeTab === 'rating' && !loading && (
        <div className="form-row">
          <div className="card">
            <h3>Submit Rating</h3>
            <form onSubmit={handleSubmitRating} className="rating-form">
              <div className="form-group">
                <label>Course:</label>
                <select 
                  name="course_id"
                  value={ratingForm.course_id}
                  onChange={handleRatingFormChange}
                  required
                >
                  <option value="">Select Course</option>
                  {(courses || []).map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Rating:</label>
                <select 
                  name="rating"
                  value={ratingForm.rating}
                  onChange={handleRatingFormChange}
                  required
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Feedback:</label>
                <textarea 
                  name="feedback"
                  placeholder="Share your feedback about this course..."
                  value={ratingForm.feedback}
                  onChange={handleRatingFormChange}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="anonymous"
                    checked={ratingForm.anonymous}
                    onChange={handleRatingFormChange}
                  />
                  Submit anonymously
                </label>
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </div>
          
          <div className="card">
            <h3>My Ratings</h3>
            {displayData.ratings && displayData.ratings.length === 0 ? (
              <div className="empty-state">
                <p>No ratings received yet.</p>
                <p><strong>Ratings from students will appear here.</strong></p>
              </div>
            ) : (
              <div className="ratings-list">
                {(displayData.ratings || []).map((rating, index) => (
                  <div key={rating.id || index} className="rating-item">
                    <div className="rating-header">
                      <strong>Rating: {rating.rating}/5</strong>
                      <span className="rating-date">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.feedback && (
                      <p className="rating-feedback">"{rating.feedback}"</p>
                    )}
                    {rating.course_name && (
                      <p><strong>Course:</strong> {rating.course_name}</p>
                    )}
                    {rating.student_name && (
                      <p><strong>From:</strong> {rating.student_name}</p>
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

export default LecturerDashboard;