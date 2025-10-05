import React, { useState, useEffect } from 'react';
import { 
  getStudentDashboard, 
  getCourses, 
  createRating, 
  searchStudentData,
  getStudentClasses,
  getStudentAttendance,
  getStudentMonitoring,
  createAttendance,
  createClass
} from '../services/api';
import '../App.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [dashboardData, setDashboardData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [monitoringData, setMonitoringData] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Get student ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.id || user.student_id;

  // Sample data to prevent empty states
  const sampleClasses = [
    {
      id: 1,
      course_name: 'Java Programming',
      course_code: 'BIT2101',
      class_name: 'BIT2101-A',
      schedule_time: 'Monday 9:00 AM - 11:00 AM',
      schedule_days: 'Monday, Wednesday',
      venue: 'Room 101',
      lecturer_name: 'Dr. Smith'
    },
    {
      id: 2,
      course_name: 'Web Development',
      course_code: 'BIT2201',
      class_name: 'BIT2201-B',
      schedule_time: 'Tuesday 2:00 PM - 4:00 PM',
      schedule_days: 'Tuesday, Thursday',
      venue: 'Computer Lab 3',
      lecturer_name: 'Dr. Johnson'
    }
  ];

  const sampleAttendance = [
    {
      id: 1,
      date: '2024-02-15',
      course_name: 'Java Programming',
      course_code: 'BIT2101',
      class_name: 'BIT2101-A',
      status: 'present',
      time: '9:00 AM',
      remarks: 'On time'
    },
    {
      id: 2,
      date: '2024-02-14',
      course_name: 'Web Development',
      course_code: 'BIT2201',
      class_name: 'BIT2201-B',
      status: 'present',
      time: '2:00 PM',
      remarks: 'Participated actively'
    }
  ];

  const sampleMaterials = [
    {
      id: 1,
      course_name: 'Java Programming',
      course_code: 'BIT2101',
      material_type: 'Lecture Slides',
      title: 'OOP Concepts Presentation',
      file_url: '/materials/java-oop-slides.pdf',
      upload_date: '2024-02-15',
      lecturer: 'Dr. Smith'
    },
    {
      id: 2,
      course_name: 'Web Development',
      course_code: 'BIT2201',
      material_type: 'Tutorial',
      title: 'React Components Guide',
      file_url: '/materials/react-tutorial.pdf',
      upload_date: '2024-02-14',
      lecturer: 'Dr. Johnson'
    }
  ];

  // Form states
  const [attendanceForm, setAttendanceForm] = useState({
    course_id: "",
    class_name: "",
    date: new Date().toISOString().split('T')[0],
    status: "present",
    remarks: ""
  });

  const [classForm, setClassForm] = useState({
    course_id: "",
    class_name: "",
    schedule_time: "",
    schedule_days: "",
    venue: "",
    lecturer_name: ""
  });

  const [monitoringForm, setMonitoringForm] = useState({
    course_id: "",
    study_hours: "",
    topics_covered: "",
    understanding_level: "good",
    challenges: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (studentId) {
      fetchDashboardData();
      fetchAllCourses();
      fetchStudentData();
      fetchMonitoringData();
      fetchMaterials();
    } else {
      console.error('Student ID not found in localStorage');
      // Load sample data if no student ID
      setClasses(sampleClasses);
      setAttendance(sampleAttendance);
      setMaterials(sampleMaterials);
      setAllCourses([
        { id: 1, course_name: 'Java Programming', course_code: 'BIT2101', lecturer_name: 'Dr. Smith', lecturer_id: 1 },
        { id: 2, course_name: 'Web Development', course_code: 'BIT2201', lecturer_name: 'Dr. Johnson', lecturer_id: 2 },
        { id: 3, course_name: 'Database Management', course_code: 'BIT2301', lecturer_name: 'Dr. Wilson', lecturer_id: 3 }
      ]);
      setDashboardData({
        student: { name: 'John Doe', program: 'Computer Science' }
      });
    }
  }, [studentId]);

  const fetchDashboardData = async () => {
    if (!studentId) return;
    
    try {
      const response = await getStudentDashboard(studentId);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setDashboardData({
        student: { name: user.name || 'Student', program: 'Computer Science' }
      });
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await getCourses();
      setAllCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAllCourses([
        { id: 1, course_name: 'Java Programming', course_code: 'BIT2101', lecturer_name: 'Dr. Smith', lecturer_id: 1 },
        { id: 2, course_name: 'Web Development', course_code: 'BIT2201', lecturer_name: 'Dr. Johnson', lecturer_id: 2 },
        { id: 3, course_name: 'Database Management', course_code: 'BIT2301', lecturer_name: 'Dr. Wilson', lecturer_id: 3 }
      ]);
    }
  };

  const fetchStudentData = async () => {
    if (!studentId) return;
    
    try {
      const classesRes = await getStudentClasses(studentId);
      setClasses(classesRes.data || sampleClasses);

      const attendanceRes = await getStudentAttendance(studentId);
      setAttendance(attendanceRes.data || sampleAttendance);

    } catch (error) {
      console.error('Error fetching student data:', error);
      setClasses(sampleClasses);
      setAttendance(sampleAttendance);
    }
  };

  const fetchMonitoringData = async () => {
    if (!studentId) return;
    
    try {
      const response = await getStudentMonitoring(studentId);
      setMonitoringData(response.data || []);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };

  const fetchMaterials = async () => {
    setMaterials(sampleMaterials);
  };

  // Form change handlers
  const handleAttendanceChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setClassForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMonitoringChange = (e) => {
    const { name, value } = e.target;
    setMonitoringForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFeedbackChange = (courseId, text) => {
    setFeedback(prev => ({ ...prev, [courseId]: text }));
  };

  // Form submission handlers
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCourse = allCourses.find(course => course.id == attendanceForm.course_id);
      
      const attendanceData = {
        ...attendanceForm,
        student_id: studentId,
        student_name: user.name || 'Student',
        course_name: selectedCourse?.course_name || 'Unknown Course',
        course_code: selectedCourse?.course_code || 'N/A'
      };

      await createAttendance(attendanceData);
      alert('Attendance submitted successfully!');
      
      setAttendanceForm({
        course_id: "",
        class_name: "",
        date: new Date().toISOString().split('T')[0],
        status: "present",
        remarks: ""
      });

      fetchStudentData();

    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Failed to submit attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClass = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCourse = allCourses.find(course => course.id == classForm.course_id);
      
      const classData = {
        ...classForm,
        course_name: selectedCourse?.course_name || 'Unknown Course',
        course_code: selectedCourse?.course_code || 'N/A',
        created_by: 'student'
      };

      await createClass(classData);
      alert('Class added successfully!');
      
      setClassForm({
        course_id: "",
        class_name: "",
        schedule_time: "",
        schedule_days: "",
        venue: "",
        lecturer_name: ""
      });

      fetchStudentData();

    } catch (error) {
      console.error('Error adding class:', error);
      alert('Failed to add class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMonitoring = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCourse = allCourses.find(course => course.id == monitoringForm.course_id);
      
      const monitoringData = {
        ...monitoringForm,
        student_id: studentId,
        student_name: user.name || 'Student',
        course_name: selectedCourse?.course_name || 'Unknown Course'
      };

      console.log('Submitting monitoring data:', monitoringData);
      alert('Monitoring data submitted successfully!');
      
      setMonitoringForm({
        course_id: "",
        study_hours: "",
        topics_covered: "",
        understanding_level: "good",
        challenges: "",
        date: new Date().toISOString().split('T')[0]
      });

      fetchMonitoringData();

    } catch (error) {
      console.error('Error submitting monitoring data:', error);
      alert('Failed to submit monitoring data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIXED Rating functionality
  const handleRatingClick = (courseId, rating) => {
    console.log('Rating clicked:', courseId, rating);
    setRatings(prev => ({ ...prev, [courseId]: rating }));
  };

  const handleSubmitRating = async (courseId) => {
    if (!ratings[courseId]) {
      alert('Please select a rating first');
      return;
    }

    if (!studentId) {
      alert('Student ID not found. Please log in again.');
      return;
    }

    setSubmitting(prev => ({ ...prev, [courseId]: true }));

    try {
      const course = allCourses.find(c => c.id == courseId);
      
      // FIXED: Use the correct API structure
      const ratingData = {
        lecturer_id: course?.lecturer_id || 1, // Default to 1 if not found
        course_id: courseId,
        rating: ratings[courseId],
        feedback: feedback[courseId] || '',
        student_id: studentId,
        student_name: user.name || 'Student'
      };

      console.log('Submitting rating data:', ratingData);
      
      await createRating(ratingData);

      alert('Rating submitted successfully!');
      
      // Clear the rating and feedback for this course
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[courseId];
        return newRatings;
      });
      
      setFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[courseId];
        return newFeedback;
      });

    } catch (error) {
      console.error('Error submitting rating:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // More specific error messages
      if (error.response?.status === 500) {
        alert('Server error: Please check if the ratings table exists in the database.');
      } else if (error.response?.data?.error?.includes('Duplicate')) {
        alert('You have already rated this lecturer for this course.');
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    } finally {
      setSubmitting(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    if (!studentId) {
      alert('Student ID not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const response = await searchStudentData(searchQuery, studentId);
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
    fetchDashboardData();
  };

  const handleJoinClass = (classItem) => {
    alert(`Joining ${classItem.course_name} class...\nTime: ${classItem.schedule_time}\nVenue: ${classItem.venue}`);
  };

  const handleDownloadMaterial = (material) => {
    alert(`Downloading: ${material.title}\nCourse: ${material.course_name}`);
  };

  const coursesToDisplay = allCourses;
  const displayData = searchResults || {
    courses: coursesToDisplay,
    classes: classes,
    attendance: attendance,
    monitoring: monitoringData,
    materials: materials
  };

  if (!studentId) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Authentication Required</h2>
          <p>Please log in to access the student dashboard.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {dashboardData?.student?.name || dashboardData?.student?.student_name || user.name || 'Student'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-section" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearch} className="search-form" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search courses, classes, materials..."
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searchQuery && (
            <button type="button" onClick={handleClearSearch} className="btn btn-outline">
              Clear
            </button>
          )}
        </form>
      </div>

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

      {/* Tabs Navigation */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          Sign Attendance
        </button>
        <button className={`tab-btn ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>
          Add Classes
        </button>
        <button className={`tab-btn ${activeTab === 'rating' ? 'active' : ''}`} onClick={() => setActiveTab('rating')}>
          Rate Lecturers
        </button>
        <button className={`tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
          Self Monitoring
        </button>
        <button className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
          Course Materials
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Attendance Form */}
        {activeTab === 'attendance' && (
          <div className="form-row">
            <div className="card">
              <h3>Sign Attendance</h3>
              <form onSubmit={handleSubmitAttendance} className="attendance-form">
                <div className="form-group">
                  <label>Course:</label>
                  <select name="course_id" value={attendanceForm.course_id} onChange={handleAttendanceChange} required>
                    <option value="">Select Course</option>
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Class Name:</label>
                  <input type="text" name="class_name" value={attendanceForm.class_name} onChange={handleAttendanceChange} placeholder="Enter class name" required />
                </div>
                
                <div className="form-group">
                  <label>Date:</label>
                  <input type="date" name="date" value={attendanceForm.date} onChange={handleAttendanceChange} required />
                </div>
                
                <div className="form-group">
                  <label>Status:</label>
                  <select name="status" value={attendanceForm.status} onChange={handleAttendanceChange} required>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Remarks (Optional):</label>
                  <textarea name="remarks" value={attendanceForm.remarks} onChange={handleAttendanceChange} rows="2" placeholder="Any additional notes..." />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Signing...' : 'Sign Attendance'}
                </button>
              </form>
            </div>
            
            <div className="card">
              <h3>Attendance History</h3>
              {displayData.attendance?.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Course</th>
                        <th>Class</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.attendance.map((record, index) => (
                        <tr key={record.id || index}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.course_name}</td>
                          <td>{record.class_name}</td>
                          <td><span className={`status-badge ${record.status}`}>{record.status}</span></td>
                          <td>{record.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No attendance records yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Classes Form */}
        {activeTab === 'classes' && (
          <div className="form-row">
            <div className="card">
              <h3>Add Class</h3>
              <form onSubmit={handleSubmitClass} className="class-form">
                <div className="form-group">
                  <label>Course:</label>
                  <select name="course_id" value={classForm.course_id} onChange={handleClassChange} required>
                    <option value="">Select Course</option>
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Class Name:</label>
                  <input type="text" name="class_name" value={classForm.class_name} onChange={handleClassChange} placeholder="e.g., BIT2201-B, CS101-A" required />
                </div>
                
                <div className="form-group">
                  <label>Schedule Time:</label>
                  <input type="text" name="schedule_time" value={classForm.schedule_time} onChange={handleClassChange} placeholder="e.g., Monday 2:00 PM - 4:00 PM" required />
                </div>
                
                <div className="form-group">
                  <label>Schedule Days:</label>
                  <input type="text" name="schedule_days" value={classForm.schedule_days} onChange={handleClassChange} placeholder="e.g., Mon, Wed, Fri" required />
                </div>
                
                <div className="form-group">
                  <label>Venue:</label>
                  <input type="text" name="venue" value={classForm.venue} onChange={handleClassChange} placeholder="e.g., Room 101, Computer Lab 3" required />
                </div>
                
                <div className="form-group">
                  <label>Lecturer Name:</label>
                  <input type="text" name="lecturer_name" value={classForm.lecturer_name} onChange={handleClassChange} placeholder="e.g., Dr. Smith" required />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Class'}
                </button>
              </form>
            </div>
            
            <div className="card">
              <h3>My Classes</h3>
              {displayData.classes?.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Class</th>
                        <th>Schedule</th>
                        <th>Venue</th>
                        <th>Lecturer</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.classes.map((classItem, index) => (
                        <tr key={classItem.id || index}>
                          <td>{classItem.course_name}</td>
                          <td>{classItem.class_name}</td>
                          <td>{classItem.schedule_time}</td>
                          <td>{classItem.venue}</td>
                          <td>{classItem.lecturer_name}</td>
                          <td>
                            <button onClick={() => handleJoinClass(classItem)} className="btn btn-primary btn-sm">
                              Join Class
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No classes added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* FIXED Rating Form */}
        {activeTab === 'rating' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Rate Your Lecturers</h3>
              <p className="card-subtitle">Click on stars to select your rating</p>
            </div>
            <div className="card-content">
              {allCourses.length > 0 ? (
                <div className="rating-container">
                  {allCourses.map(course => (
                    <div key={course.id} className="rating-card">
                      <div className="rating-course-header">
                        <h4>{course.course_name}</h4>
                        <span className="course-code">{course.course_code}</span>
                      </div>
                      
                      <div className="lecturer-info">
                        <strong>Lecturer:</strong> {course.lecturer_name || 'Not assigned'}
                      </div>

                      <div className="rating-section">
                        <label className="rating-label">Rate this lecturer:</label>
                        <div className="stars-container">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={`star-button ${ratings[course.id] >= star ? 'active' : ''}`}
                              onClick={() => handleRatingClick(course.id, star)}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: submitting[course.id] ? 'not-allowed' : 'pointer',
                                opacity: submitting[course.id] ? 0.5 : 1,
                                color: ratings[course.id] >= star ? '#ffc107' : '#ddd',
                                transition: 'color 0.2s ease'
                              }}
                              disabled={submitting[course.id]}
                            >
                              ⭐
                            </button>
                          ))}
                          <span className="rating-value" style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                            {ratings[course.id] ? `${ratings[course.id]}/5` : 'Click stars to rate'}
                          </span>
                        </div>
                      </div>

                      <div className="feedback-section">
                        <label className="feedback-label">Your Feedback (Optional):</label>
                        <textarea
                          placeholder="Share your experience with this lecturer..."
                          value={feedback[course.id] || ''}
                          onChange={(e) => handleFeedbackChange(course.id, e.target.value)}
                          className="feedback-textarea"
                          rows="3"
                          disabled={submitting[course.id]}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div className="rating-actions">
                        <button
                          onClick={() => handleSubmitRating(course.id)}
                          className="btn btn-primary"
                          disabled={!ratings[course.id] || submitting[course.id]}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: !ratings[course.id] || submitting[course.id] ? '#6c757d' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: !ratings[course.id] || submitting[course.id] ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {submitting[course.id] ? 'Submitting...' : 'Submit Rating'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-text">No courses available for rating.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Self Monitoring Form */}
        {activeTab === 'monitoring' && (
          <div className="form-row">
            <div className="card">
              <h3>Add Self Monitoring Data</h3>
              <form onSubmit={handleSubmitMonitoring} className="monitoring-form">
                <div className="form-group">
                  <label>Course:</label>
                  <select name="course_id" value={monitoringForm.course_id} onChange={handleMonitoringChange} required>
                    <option value="">Select Course</option>
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Study Hours:</label>
                  <input type="number" name="study_hours" value={monitoringForm.study_hours} onChange={handleMonitoringChange} step="0.5" min="0.5" placeholder="e.g., 2.5" required />
                </div>
                
                <div className="form-group">
                  <label>Topics Covered:</label>
                  <textarea name="topics_covered" value={monitoringForm.topics_covered} onChange={handleMonitoringChange} rows="3" placeholder="What topics did you study today?" required />
                </div>
                
                <div className="form-group">
                  <label>Understanding Level:</label>
                  <select name="understanding_level" value={monitoringForm.understanding_level} onChange={handleMonitoringChange} required>
                    <option value="excellent">Excellent - Fully understand</option>
                    <option value="good">Good - Mostly understand</option>
                    <option value="average">Average - Some confusion</option>
                    <option value="poor">Poor - Need help</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Challenges Faced (Optional):</label>
                  <textarea name="challenges" value={monitoringForm.challenges} onChange={handleMonitoringChange} rows="2" placeholder="Any difficulties or areas needing improvement?" />
                </div>
                
                <div className="form-group">
                  <label>Date:</label>
                  <input type="date" name="date" value={monitoringForm.date} onChange={handleMonitoringChange} required />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Save Monitoring Data'}
                </button>
              </form>
            </div>
            
            <div className="card">
              <h3>Monitoring History</h3>
              {displayData.monitoring?.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Course</th>
                        <th>Study Hours</th>
                        <th>Topics</th>
                        <th>Understanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.monitoring.map((record, index) => (
                        <tr key={record.id || index}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.course_name}</td>
                          <td>{record.study_hours} hours</td>
                          <td>{record.topics_covered}</td>
                          <td><span className={`status-badge ${record.understanding_level}`}>{record.understanding_level}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No monitoring data recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Course Materials */}
        {activeTab === 'materials' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Course Materials</h3>
            </div>
            <div className="card-content">
              {displayData.materials?.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Material Type</th>
                        <th>Title</th>
                        <th>Lecturer</th>
                        <th>Upload Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.materials.map((material, index) => (
                        <tr key={material.id || index}>
                          <td>
                            <strong>{material.course_name}</strong>
                            <br />
                            <small>{material.course_code}</small>
                          </td>
                          <td><span className={`type-badge ${material.material_type}`}>{material.material_type}</span></td>
                          <td>{material.title}</td>
                          <td>{material.lecturer}</td>
                          <td>{new Date(material.upload_date).toLocaleDateString()}</td>
                          <td>
                            <button 
                              onClick={() => handleDownloadMaterial(material)}
                              className="btn btn-primary btn-sm"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No course materials available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
