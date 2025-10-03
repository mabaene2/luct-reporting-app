import React, { useState, useEffect } from "react";
import { createReport } from "../services/api";
import "../App.css";

const ReportForm = () => {
  const [formData, setFormData] = useState({
    lecturer_name: "",
    course_name: "",
    class_name: "",
    week_of_reporting: "",
    date_of_lecture: "",
    lecture_time: "",
    topic_taught: "",
    learning_outcomes: "",
    recommendations: "",
    actual_students: "",
    total_students: "",
    venue: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-fill lecturer name from user data if available
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.name) {
      setFormData(prev => ({ ...prev, lecturer_name: user.name }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await createReport(formData);
      setSuccess("✅ Report submitted successfully!");

      // Reset form after successful submission
      setFormData({
        lecturer_name: formData.lecturer_name, // Keep lecturer name
        course_name: "",
        class_name: "",
        week_of_reporting: "",
        date_of_lecture: "",
        lecture_time: "",
        topic_taught: "",
        learning_outcomes: "",
        recommendations: "",
        actual_students: "",
        total_students: "",
        venue: ""
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("❌ Failed to submit report: " + (err.response?.data?.error || "Please try again"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="card form-container fade-in">
          <h2 className="text-center mb-4">📝 Lecture Report Submission</h2>
          <p className="text-center mb-4 text-muted">
            Submit your detailed lecture report for tracking and evaluation
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lecturer Name</label>
                <input
                  type="text"
                  name="lecturer_name"
                  className="form-control"
                  placeholder="Enter lecturer name"
                  value={formData.lecturer_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  className="form-control"
                  placeholder="Enter course name"
                  value={formData.course_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Class Name</label>
                <input
                  type="text"
                  name="class_name"
                  className="form-control"
                  placeholder="Enter class name"
                  value={formData.class_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Week of Reporting</label>
                <input
                  type="number"
                  name="week_of_reporting"
                  className="form-control"
                  placeholder="Enter week number"
                  min="1"
                  max="52"
                  value={formData.week_of_reporting}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Lecture</label>
                <input
                  type="date"
                  name="date_of_lecture"
                  className="form-control"
                  value={formData.date_of_lecture}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input
                  type="time"
                  name="lecture_time"
                  className="form-control"
                  value={formData.lecture_time}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Venue</label>
              <input
                type="text"
                name="venue"
                className="form-control"
                placeholder="Enter lecture venue"
                value={formData.venue}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Actual Students Present</label>
                <input
                  type="number"
                  name="actual_students"
                  className="form-control"
                  placeholder="Number of students present"
                  min="0"
                  value={formData.actual_students}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Registered Students</label>
                <input
                  type="number"
                  name="total_students"
                  className="form-control"
                  placeholder="Total registered students"
                  min="0"
                  value={formData.total_students}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Topic Taught</label>
              <textarea
                name="topic_taught"
                className="form-control"
                placeholder="Describe the topic covered in this lecture"
                rows="3"
                value={formData.topic_taught}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Learning Outcomes</label>
              <textarea
                name="learning_outcomes"
                className="form-control"
                placeholder="List the learning outcomes achieved in this lecture"
                rows="3"
                value={formData.learning_outcomes}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recommendations (Optional)</label>
              <textarea
                name="recommendations"
                className="form-control"
                placeholder="Any recommendations for improvement or future lectures"
                rows="3"
                value={formData.recommendations}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading"></span>
                    Submitting Report...
                  </>
                ) : (
                  '📝 Submit Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
