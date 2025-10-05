import React, { useState } from "react";
import axios from "axios";

const LectureForm = () => {
  const [formData, setFormData] = useState({
    course_id: "",
    lecturer_id: "",
    topic: "",
    date: "",
    time: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://luct-reporting-app-bw51.onrender.com/api/lectures", formData);
      alert("Lecture assigned successfully!");
      setFormData({ course_id: "", lecturer_id: "", topic: "", date: "", time: "" });
    } catch (err) {
      alert("Failed to assign lecture");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h2>Assign Lecture</h2>
      <form onSubmit={handleSubmit}>
        <input name="course_id" placeholder="Course ID" value={formData.course_id} onChange={handleChange} required />
        <input name="lecturer_id" placeholder="Lecturer ID" value={formData.lecturer_id} onChange={handleChange} required />
        <input name="topic" placeholder="Topic" value={formData.topic} onChange={handleChange} required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Assign</button>
      </form>
    </div>
  );
};

export default LectureForm;
