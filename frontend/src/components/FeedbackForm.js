import React, { useState } from "react";
import axios from "axios";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({ report_id: "", feedback: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://luct-reporting-app-bw51.onrender.com/api/feedback", formData);
      alert("Feedback submitted!");
      setFormData({ report_id: "", feedback: "" });
    } catch (err) {
      alert("Failed to submit feedback");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h2>Submit Feedback</h2>
      <form onSubmit={handleSubmit}>
        <input name="report_id" placeholder="Report ID" value={formData.report_id} onChange={handleChange} required />
        <textarea name="feedback" placeholder="Feedback" value={formData.feedback} onChange={handleChange} required></textarea>
        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Submit</button>
      </form>
    </div>
  );
};

export default FeedbackForm;
