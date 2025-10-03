import React, { useState } from "react";
import { loginUser, testConnection } from "../services/api";
import "../App.css";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log('🔐 Login form submitted:', { email: formData.email });

    try {
      // Test server connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        setError(connectionTest.error);
        setIsLoading(false);
        return;
      }

      console.log('✅ Server connection OK, attempting login...');

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });

      console.log('✅ Login API response received:', response.data);

      if (response.data.token && response.data.user) {
        console.log('✅ Login successful, storing user data...');
        
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('✅ Data stored, calling onLogin callback...');
        
        // Notify parent component
        onLogin(response.data.user);
        
        console.log('✅ Login process completed successfully');
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      console.error('❌ Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      let errorMessage = "Login failed. Please check your credentials and try again.";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // More specific error messages
      if (errorMessage.includes('Invalid email or password')) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (errorMessage.includes('User not found')) {
        errorMessage = "No account found with this email. Please register first.";
      }

      setError(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="card form-container fade-in">
          <div className="auth-card-header">
            <h3 className="auth-card-title">LUCT REPORTING</h3>
            <p className="auth-card-subtitle">Sign In to Your Account</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              {error}
              <div className="mt-2">
                <small>Check console (F12) for detailed error information</small>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-compact"
                disabled={isLoading}
                style={{width: '100%'}}
              >
                {isLoading ? (
                  <>
                    <span className="loading"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="auth-switch">
            <span className="auth-switch-text">Don't have an account?</span>
            <a href="/register" className="auth-switch-link">Create account here</a>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Login;