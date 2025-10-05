import React, { useEffect, useState } from "react";
import axios from "axios";

const ClassList = ({ user }) => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("https://luct-reporting-app-bw51.onrender.com/api/classes");
      let classesData = res.data;
      if (user.role === 'Lecturer') {
        classesData = classesData.filter(c => c.lecturer_name === user.name);
      } else if (user.role === 'PRL') {
        classesData = classesData.filter(c => c.faculty === user.faculty);
      }
      setClasses(classesData);
    } catch (err) {
      alert("Failed to fetch classes");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Classes List</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>ID</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Class Name</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Faculty</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>Lecturer</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(cls => (
            <tr key={cls.id} style={{ borderBottom: "1px solid #eee", transition: "background-color 0.2s" }} onMouseOver={(e) => e.target.parentNode.style.backgroundColor = "#f9f9f9"} onMouseOut={(e) => e.target.parentNode.style.backgroundColor = "transparent"}>
              <td style={{ padding: "12px" }}>{cls.id}</td>
              <td style={{ padding: "12px" }}>{cls.name}</td>
              <td style={{ padding: "12px" }}>{cls.faculty}</td>
              <td style={{ padding: "12px" }}>{cls.lecturer_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassList;
