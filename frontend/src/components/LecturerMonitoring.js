// src/components/LecturerMonitoringForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const LecturerMonitoringForm = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    attendance: "present",
    grade: "",
    feedback: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudentsAndCourses();
  }, [user]);

  const fetchStudentsAndCourses = async () => {
    try {
      setLoading(true);
      // Fetch students under this lecturer
      const studentsRes = await axios.get(`http://localhost:5000/api/lecturer/${user?.id}/students`);
      setStudents(studentsRes.data);

      // Fetch courses taught by this lecturer
      const coursesRes = await axios.get(`http://localhost:5000/api/lecturer/${user?.id}/courses`);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("Failed to load students and courses data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/monitoring", {
        ...formData,
        lecturer_id: user?.id,
        lecturer_name: user?.name
      });
      alert("Student monitoring data added successfully!");
      // Reset form
      setFormData({
        student_id: "",
        course_id: "",
        attendance: "present",
        grade: "",
        feedback: "",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Failed to submit monitoring data:", err);
      alert("Failed to add monitoring data");
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container">
          <div className="card fade-in">
            <p>Loading students and courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div className="card fade-in">
          <h2>📊 Track Student Performance</h2>
          <p className="subtitle">Add attendance, grades, and feedback for your students</p>
          
          <form onSubmit={handleSubmit} className="monitoring-form">
            <div className="form-row">
              <div className="form-group">
                <label>Select Student:</label>
                <select 
                  name="student_id" 
                  value={formData.student_id} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Course:</label>
                <select 
                  name="course_id" 
                  value={formData.course_id} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Attendance Status:</label>
                <select 
                  name="attendance" 
                  value={formData.attendance} 
                  onChange={handleChange}
                >
                  <option value="present">✅ Present</option>
                  <option value="absent">❌ Absent</option>
                  <option value="late">⏰ Late</option>
                  <option value="excused">📝 Excused</option>
                </select>
              </div>

              <div className="form-group">
                <label>Grade/Score:</label>
                <input 
                  type="text" 
                  name="grade" 
                  placeholder="e.g., A, B+, 85%, 18/20"
                  value={formData.grade} 
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Date:</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Feedback & Remarks:</label>
              <textarea 
                name="feedback" 
                placeholder="Enter detailed feedback, comments, or observations about the student's performance..."
                value={formData.feedback} 
                onChange={handleChange}
                rows="4"
              />
            </div>

            <button type="submit" className="submit-btn">
              Save Monitoring Data
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LecturerMonitoringForm;