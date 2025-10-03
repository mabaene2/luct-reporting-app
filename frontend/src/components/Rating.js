import React, { useState, useEffect } from "react";
import axios from "axios";

const Rating = ({ user }) => {
  const [ratings, setRatings] = useState([]);
  const [formData, setFormData] = useState({ lecturer_id: "", rating: "" });
  const [loading, setLoading] = useState(true);

  // Safe user role access
  const userRole = user?.role || '';
  const userName = user?.name || '';

  useEffect(() => {
    if (user) { // Only fetch ratings if user exists
      fetchRatings();
    } else {
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/ratings");
      let ratingsData = res.data;
      
      // Safe filtering based on user role
      if (userRole === 'Lecturer' && userName) {
        ratingsData = ratingsData.filter(r => r.lecturer_name === userName);
      }
      setRatings(ratingsData);
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
      alert("Failed to fetch ratings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/ratings", formData);
      alert("Rating submitted!");
      setFormData({ lecturer_id: "", rating: "" });
      fetchRatings();
    } catch (err) {
      console.error("Failed to submit rating:", err);
      alert("Failed to submit rating");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="section">
        <div className="container">
          <div className="card fade-in">
            <p>Loading ratings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no user data
  if (!user) {
    return (
      <div className="section">
        <div className="container">
          <div className="card fade-in">
            <h2>⭐ Rate Lecturer / Class</h2>
            <p>Please log in to access the rating system.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div className="card fade-in">
          <h2>⭐ Rate Lecturer / Class</h2>
          
          {/* Safe role check */}
          {userRole !== 'Lecturer' && (
            <form onSubmit={handleSubmit} className="mb-4">
              <input 
                name="lecturer_id" 
                placeholder="Lecturer ID" 
                value={formData.lecturer_id} 
                onChange={handleChange} 
                required 
              />
              <input 
                name="rating" 
                type="number" 
                min="1" 
                max="5" 
                placeholder="Rating (1-5)" 
                value={formData.rating} 
                onChange={handleChange} 
                required 
              />
              <button type="submit">Submit</button>
            </form>
          )}

          <h3>All Ratings</h3>
          {ratings.length === 0 ? (
            <p>No ratings available.</p>
          ) : (
            <ul>
              {ratings.map((r) => (
                <li key={r.id}>
                  Lecturer {r.lecturer_name}: {r.rating}/5
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rating;