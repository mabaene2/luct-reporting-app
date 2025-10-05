import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseList = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ name: "", code: "", lecturer_name: "" });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("https://luct-reporting-app-bw51.onrender.com/api/courses");
      let coursesData = res.data;
      if (user.role === 'PRL') {
        coursesData = coursesData.filter(c => c.faculty === user.faculty);
      } else if (user.role === 'Lecturer') {
        coursesData = coursesData.filter(c => c.lecturer_name === user.name);
      }
      setCourses(coursesData);
    } catch (err) {
      alert("Failed to fetch courses");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://luct-reporting-app-bw51.onrender.com/api/courses", formData);
      alert("Course added!");
      setFormData({ name: "", code: "", lecturer_name: "" });
      fetchCourses();
    } catch (err) {
      alert("Failed to add course");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Courses List</h2>
      {user.role === 'PL' && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
          <h3 style={{ marginBottom: "15px", color: "#555" }}>Add New Course</h3>
          <div style={{ marginBottom: "10px" }}>
            <input name="name" placeholder="Course Name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input name="code" placeholder="Course Code" value={formData.code} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input name="lecturer_name" placeholder="Lecturer Name" value={formData.lecturer_name} onChange={handleChange} required style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }} />
          </div>
          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add Course</button>
        </form>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>ID</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Course Name</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Course Code</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Lecturer</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id} style={{ borderBottom: "1px solid #eee", transition: "background-color 0.2s" }} onMouseOver={(e) => e.target.parentNode.style.backgroundColor = "#f9f9f9"} onMouseOut={(e) => e.target.parentNode.style.backgroundColor = "transparent"}>
              <td style={{ padding: "12px" }}>{course.id}</td>
              <td style={{ padding: "12px" }}>{course.name}</td>
              <td style={{ padding: "12px" }}>{course.code}</td>
              <td style={{ padding: "12px" }}>{course.lecturer_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseList;
