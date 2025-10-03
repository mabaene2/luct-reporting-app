import React, { useState } from "react";
import { registerUser, testConnection } from "../services/api";
import "../App.css";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "student",
    phone: "",
    student_number: "",
    employee_number: "",
    program_id: "",
    stream_id: "",
    qualification: "",
    specialization: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log('🔄 Starting registration process...');

      // First test server connection
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        setError(connectionTest.error);
        setIsLoading(false);
        return;
      }

      console.log('✅ Server connection test passed');

      // Prepare data for backend based on role
      let registrationData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim() || null
      };

      console.log('📝 Basic registration data:', { 
        ...registrationData, 
        password: '***' // Hide password in logs
      });

      // Add role-specific fields
      if (formData.role === 'student') {
        if (!formData.student_number.trim()) {
          setError("❌ Student number is required");
          setIsLoading(false);
          return;
        }
        registrationData.student_number = formData.student_number.trim();
        registrationData.stream_id = parseInt(formData.stream_id) || 1;
        registrationData.program_id = parseInt(formData.program_id) || 1;
      } else if (formData.role === 'lecturer') {
        if (!formData.employee_number.trim()) {
          setError("❌ Employee number is required");
          setIsLoading(false);
          return;
        }
        registrationData.employee_number = formData.employee_number.trim();
        registrationData.qualification = formData.qualification || "Masters";
        registrationData.specialization = formData.specialization || "Computer Science";
      } else if (formData.role === 'prl' || formData.role === 'pl') {
        if (!formData.employee_number.trim()) {
          setError("❌ Employee number is required");
          setIsLoading(false);
          return;
        }
        registrationData.employee_number = formData.employee_number.trim();
        // Add program/stream IDs for PRL/PL if needed
        if (formData.program_id) {
          registrationData.program_id = parseInt(formData.program_id);
        }
        if (formData.stream_id) {
          registrationData.stream_id = parseInt(formData.stream_id);
        }
      }

      console.log('📦 Final registration data being sent:', registrationData);

      const response = await registerUser(registrationData);
      console.log('✅ Registration API response:', response.data);

      setSuccess("✅ Registration successful! You can now login with your credentials.");

      // Clear form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "student",
        phone: "",
        student_number: "",
        employee_number: "",
        program_id: "",
        stream_id: "",
        qualification: "",
        specialization: ""
      });

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);

    } catch (err) {
      console.error("❌ Registration error details:", {
        message: err.message,
        response: err.response?.data,
        userMessage: err.userMessage
      });
      
      // Use the enhanced error message
      let errorMessage = "Registration failed. Please check your information and try again.";
      
      if (err.userMessage) {
        errorMessage = err.userMessage;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Make error messages more user-friendly
      if (errorMessage.includes('Duplicate') || errorMessage.includes('already exists')) {
        errorMessage = "This email is already registered. Please use a different email or try logging in.";
      } else if (errorMessage.includes('student_number')) {
        errorMessage = "This student number is already registered.";
      } else if (errorMessage.includes('employee_number')) {
        errorMessage = "This employee number is already registered.";
      }

      setError(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render role-specific fields
  const renderRoleSpecificFields = () => {
    switch(formData.role) {
      case 'student':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Student Number *</label>
              <input
                type="text"
                name="student_number"
                className="form-control"
                placeholder="e.g., STU2024001"
                value={formData.student_number}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Select Program *</label>
              <select
                name="program_id"
                className="form-control"
                value={formData.program_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Choose Program</option>
                <option value="1">Bachelor of Science in Computer Science</option>
                <option value="2">Bachelor of Science in Information Technology</option>
                <option value="3">Bachelor of Science in Software Engineering</option>
                <option value="4">Bachelor of Science in Data Science</option>
                <option value="5">Bachelor of Science in Cybersecurity</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Stream *</label>
              <select
                name="stream_id"
                className="form-control"
                value={formData.stream_id}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Choose Stream</option>
                <option value="1">IT - Information Technology - Dr. Molaoa</option>
                <option value="2">SE - Software Engineering - Dr. Ebisoh</option>
                <option value="3">CS - Computer Science - Dr. Bhila</option>
                <option value="4">DS - Data Science - Dr. Matjele</option>
                <option value="5">CY - Cybersecurity - Dr. Borotho</option>
                <option value="6">EE - Electrical Engineering - Dr. Mofolo</option>
                <option value="7">ME - Mechanical Engineering - Dr. Mokete</option>
                <option value="8">CE - Civil Engineering - Dr. Thokoana</option>
                <option value="9">CHE - Chemical Engineering - Dr. Palesa</option>
                <option value="10">NE - Network Engineering - Dr. Bhila</option>
                <option value="11">BA - Business Administration - Dr. Molaoa</option>
                <option value="12">AF - Accounting & Finance - Dr. Ebisoh</option>
                <option value="13">MK - Marketing - Dr. Matjele</option>
                <option value="14">HR - Human Resource Management - Dr. Mofolo</option>
                <option value="15">EN - Entrepreneurship - Dr. Mokete</option>
              </select>
            </div>
          </>
        );
      
      case 'prl':
        return (
          <div className="form-group">
            <label className="form-label">Select Academic Stream to Manage *</label>
            <select
              name="stream_id"
              className="form-control"
              value={formData.stream_id}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">Choose Stream</option>
              <option value="1">IT - Information Technology - Dr. Molaoa</option>
              <option value="2">SE - Software Engineering - Dr. Ebisoh</option>
              <option value="3">CS - Computer Science - Dr. Bhila</option>
              <option value="4">DS - Data Science - Dr. Matjele</option>
              <option value="5">CY - Cybersecurity - Dr. Borotho</option>
              <option value="6">EE - Electrical Engineering - Dr. Mofolo</option>
              <option value="7">ME - Mechanical Engineering - Dr. Mokete</option>
              <option value="8">CE - Civil Engineering - Dr. Thokoana</option>
              <option value="9">CHE - Chemical Engineering - Dr. Palesa</option>
              <option value="10">NE - Network Engineering - Dr. Bhila</option>
              <option value="11">BA - Business Administration - Dr. Molaoa</option>
              <option value="12">AF - Accounting & Finance - Dr. Ebisoh</option>
              <option value="13">MK - Marketing - Dr. Matjele</option>
              <option value="14">HR - Human Resource Management - Dr. Mofolo</option>
              <option value="15">EN - Entrepreneurship - Dr. Mokete</option>
            </select>
          </div>
        );

      case 'lecturer':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Employee Number *</label>
              <input
                type="text"
                name="employee_number"
                className="form-control"
                placeholder="e.g., LEC2024001"
                value={formData.employee_number}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <select
                name="qualification"
                className="form-control"
                value={formData.qualification}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="PhD">PhD</option>
                <option value="Masters">Masters</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                name="specialization"
                className="form-control"
                placeholder="e.g., Computer Science, Mathematics"
                value={formData.specialization}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </>
        );

      case 'pl':
        return (
          <div className="form-group">
            <label className="form-label">Select Program to Lead *</label>
            <select
              name="program_id"
              className="form-control"
              value={formData.program_id}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">Choose Program</option>
              <option value="1">BSc Computer Science - Dr. Bhila</option>
              <option value="2">BSc Information Technology - Dr. Molaoa</option>
              <option value="3">BSc Software Engineering - Dr. Ebisoh</option>
              <option value="4">BSc Data Science - Dr. Matjele</option>
              <option value="5">BSc Cybersecurity - Dr. Borotho</option>
              <option value="6">Engineering Programs - Dr. Mofolo</option>
              <option value="7">Business Programs - Dr. Mokete</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="card form-container fade-in">
          <div className="auth-card-header">
            <h3 className="auth-card-title">LUCT REPORTING</h3>
            <p className="auth-card-subtitle">Create Your Account</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              {success}
              <div className="mt-2">
                <small>Redirecting to login page in 3 seconds...</small>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-control"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-control"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength="6"
              />
              <small className="text-muted">Password must be at least 6 characters long</small>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="prl">Principal Lecturer (PRL)</option>
                <option value="pl">Program Leader (PL)</option>
              </select>
            </div>

            {/* Role-specific fields */}
            {renderRoleSpecificFields()}

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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="auth-switch">
            <span className="auth-switch-text">Already have an account?</span>
            <a href="/login" className="auth-switch-link">Sign In here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;