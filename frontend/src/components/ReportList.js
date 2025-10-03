import React, { useEffect, useState } from "react";
import { getReports } from "../services/api";
import "../App.css";

const ReportList = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterBy]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await getReports();
      let reportsData = res.data;
      if (user.role === 'Lecturer') {
        reportsData = reportsData.filter(r => r.lecturer_name === user.name);
      }
      setReports(reportsData);
    } catch (err) {
      setError("❌ Failed to fetch reports: " + (err.response?.data?.error || "Please try again"));
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.lecturer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.topic_taught.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by lecturer (for PRL role)
    if (filterBy !== "all") {
      filtered = filtered.filter(report => report.lecturer_name === filterBy);
    }

    setFilteredReports(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAttendancePercentage = (actual, total) => {
    if (!total || total === 0) return '0%';
    return Math.round((actual / total) * 100) + '%';
  };

  if (isLoading) {
    return (
      <div className="section">
        <div className="container">
          <div className="text-center">
            <div className="loading"></div>
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Lecture Reports</h2>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>View and manage all submitted lecture reports</p>

      {error && (
        <div style={{ color: "red", marginBottom: "20px", padding: "10px", border: "1px solid red", backgroundColor: "#ffe6e6" }}>
          {error}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search reports by lecturer, course, class, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "70%", padding: "8px", marginRight: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        >
          <option value="all">All Lecturers</option>
          {[...new Set(reports.map(r => r.lecturer_name))].map(lecturer => (
            <option key={lecturer} value={lecturer}>{lecturer}</option>
          ))}
        </select>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <div>No reports found matching your criteria.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Lecturer</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Course</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Class</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Week</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Date</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Time</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Topic</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Attendance</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Venue</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #eee", transition: "background-color 0.2s" }} onMouseOver={(e) => e.target.parentNode.style.backgroundColor = "#f9f9f9"} onMouseOut={(e) => e.target.parentNode.style.backgroundColor = "transparent"}>
                <td style={{ padding: "12px" }}>
                  <strong>{report.lecturer_name}</strong>
                </td>
                <td style={{ padding: "12px" }}>{report.course_name}</td>
                <td style={{ padding: "12px" }}>{report.class_name}</td>
                <td style={{ padding: "12px" }}>Week {report.week_of_reporting}</td>
                <td style={{ padding: "12px" }}>{formatDate(report.date_of_lecture)}</td>
                <td style={{ padding: "12px" }}>{report.lecture_time}</td>
                <td style={{ padding: "12px" }}>
                  {report.topic_taught.length > 50
                    ? report.topic_taught.substring(0, 50) + '...'
                    : report.topic_taught
                  }
                </td>
                <td style={{ padding: "12px" }}>
                  {report.actual_students}/{report.total_students} (
                  {getAttendancePercentage(report.actual_students, report.total_students)})
                </td>
                <td style={{ padding: "12px" }}>{report.venue}</td>
                <td style={{ padding: "12px" }}>
                  <button onClick={() => alert(`View details for report #${report.id}`)} style={{ padding: "5px 10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Summary Stats */}
      {filteredReports.length > 0 && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f9f9f9", border: "1px solid #ddd" }}>
          <div style={{ display: "inline-block", marginRight: "20px" }}>
            <strong>Total Reports:</strong> {filteredReports.length}
          </div>
          <div style={{ display: "inline-block", marginRight: "20px" }}>
            <strong>Avg Attendance:</strong> {Math.round(
              filteredReports.reduce((acc, r) =>
                acc + (r.actual_students / r.total_students), 0
              ) / filteredReports.length * 100
            )}%
          </div>
          <div style={{ display: "inline-block" }}>
            <strong>This Week:</strong> {filteredReports.filter(r => {
              const reportDate = new Date(r.date_of_lecture);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return reportDate >= weekAgo;
            }).length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;
