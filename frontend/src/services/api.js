import axios from "axios";

const API = axios.create({
  baseURL: "https://luct-reporting-app-bw51.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Handle different error cases
    if (error.response?.status === 401) {
      console.log('🛑 Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      alert("Access denied. You don't have permission for this action.");
    } else if (error.response?.status === 404) {
      console.error("Resource not found:", error.config.url);
    } else if (error.response?.status === 500) {
      console.error("Server 500 Error:", error.response.data);
      if (error.response.data?.error?.includes('Table') && error.response.data?.error?.includes('doesn\'t exist')) {
        console.error('🛑 DATABASE TABLE MISSING: Please create the required database tables');
      }
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      alert("🌐 Network error. Please check your connection and make sure the server is running.");
    } else if (error.code === 'ECONNABORTED') {
      alert("⏰ Request timeout. Please try again.");
    } else if (!error.response) {
      alert("🚫 Cannot connect to server. Please make sure the backend is running on https://luct-reporting-app-bw51.onrender.com");
    }
    
    return Promise.reject(error);
  }
);

// Test server connection
export const testConnection = async () => {
  try {
    const response = await API.get("/health");
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: "Backend server is not running. Please start the server on port 5000." 
    };
  }
};

// Auth API with enhanced error handling
export const loginUser = async (credentials) => {
  try {
    console.log('🔐 Login attempt:', { email: credentials.email });
    const response = await API.post("/auth/login", credentials);
    console.log('✅ Login successful');
    return response;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('👤 Registration attempt:', { 
      email: userData.email, 
      role: userData.role,
      name: `${userData.first_name} ${userData.last_name}`
    });
    
    // Remove any 'id' field that might be sent accidentally
    const { id, ...cleanData } = userData;
    
    const response = await API.post("/auth/register", cleanData);
    console.log('✅ Registration successful');
    return response;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    
    // Provide more specific error messages
    if (error.response?.data?.error?.includes('Duplicate') || error.response?.data?.error?.includes('already exists')) {
      error.userMessage = "This email is already registered. Please use a different email or login.";
    } else if (error.response?.data?.error?.includes('student_number')) {
      error.userMessage = "This student number is already registered.";
    } else if (error.response?.data?.error?.includes('employee_number')) {
      error.userMessage = "This employee number is already registered.";
    } else if (error.response?.data?.error?.includes('id')) {
      error.userMessage = "Server configuration error. Please contact administrator.";
    }
    
    throw error;
  }
};

export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);
export const changePassword = (data) => API.put("/auth/change-password", data);
export const logoutUser = () => API.post("/auth/logout");

// Dashboard APIs
export const getStudentDashboard = () => API.get("/dashboard/student");
export const getLecturerDashboard = () => API.get("/dashboard/lecturer");
export const getPRLDashboard = () => API.get("/dashboard/prl");
export const getPLDashboard = () => API.get("/dashboard/pl");

// Generic dashboard based on user role
export const getDashboardData = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  switch(user.role) {
    case 'student': return getStudentDashboard();
    case 'lecturer': return getLecturerDashboard();
    case 'prl': return getPRLDashboard();
    case 'pl': return getPLDashboard();
    default: return getStudentDashboard();
  }
};

// ========== MONITORING SYSTEM APIs ==========

// Student Monitoring - View their own data
export const getStudentMonitoring = (studentId) => API.get(`/monitoring/student/${studentId}`);
export const getStudentPerformance = (studentId) => API.get(`/monitoring/student/${studentId}/performance`);

// Lecturer Monitoring - Manage student data
export const getLecturerStudents = (lecturerId) => API.get(`/monitoring/lecturer/${lecturerId}/students`);
export const getLecturerCourses = (lecturerId) => API.get(`/monitoring/lecturer/${lecturerId}/courses`);
export const addStudentMonitoring = (data) => API.post("/monitoring", data);
export const getLecturerMonitoringData = (lecturerId) => API.get(`/monitoring/lecturer/${lecturerId}/data`);
export const updateStudentMonitoring = (monitoringId, data) => API.put(`/monitoring/${monitoringId}`, data);
export const deleteStudentMonitoring = (monitoringId) => API.delete(`/monitoring/${monitoringId}`);

// PRL Monitoring - View monitoring data
export const getPRLMonitoring = (prlId) => API.get(`/monitoring/prl/${prlId}`);
export const getPRLStudents = (prlId) => API.get(`/monitoring/prl/${prlId}/students`);

// PL Monitoring - Overview
export const getPLMonitoring = () => API.get("/monitoring/pl");
export const getAllMonitoringData = () => API.get("/monitoring/all");

// ========== RATING SYSTEM APIs ==========

// Student Rating - Rate lecturers
export const getLecturersToRate = (studentId) => API.get(`/ratings/student/${studentId}/lecturers`);
export const submitLecturerRating = (data) => API.post("/ratings/lecturer", data);
export const getStudentRatingHistory = (studentId) => API.get(`/ratings/student/${studentId}/history`);

// Lecturer Rating - View their ratings
export const getLecturerRatings = (lecturerId) => API.get(`/ratings/lecturer/${lecturerId}`);
export const getLecturerRatingStats = (lecturerId) => API.get(`/ratings/lecturer/${lecturerId}/stats`);

// General Rating APIs
export const getRatings = () => API.get("/ratings");
export const createRating = (data) => API.post("/ratings", data);
export const getRatingById = (id) => API.get(`/ratings/${id}`);
export const updateRating = (id, data) => API.put(`/ratings/${id}`, data);
export const deleteRating = (id) => API.delete(`/ratings/${id}`);

// ========== STUDENT APIs ==========
export const getStudentClasses = (studentId) => API.get(`/student/${studentId}/classes`);
export const getStudentSchedule = (studentId) => API.get(`/student/${studentId}/schedule`);
export const getStudentAttendance = (studentId) => API.get(`/student/${studentId}/attendance`);
export const getStudentGrades = (studentId) => API.get(`/student/${studentId}/grades`);

// ========== LECTURER APIs ==========
export const getLecturerClasses = (lecturerId) => API.get(`/lecturer/${lecturerId}/classes`);
export const getLecturerReports = (lecturerId) => API.get(`/lecturer/${lecturerId}/reports`);
export const createReport = (data) => API.post("/reports", data);
export const getLecturerStudentsList = (lecturerId) => API.get(`/lecturer/${lecturerId}/students`);

// ========== PRL APIs ==========
export const getPRLCourses = (prlId) => API.get(`/prl/${prlId}/courses`);
export const getPRLReports = (prlId) => API.get(`/prl/${prlId}/reports`);
export const addPRLFeedback = (reportId, feedback) => API.post(`/prl/feedback/${reportId}`, { feedback });
export const getPRLClasses = (prlId) => API.get(`/prl/${prlId}/classes`);
export const getPRLLecturers = (prlId) => API.get(`/prl/${prlId}/lecturers`);

// NEW PRL APIs for the updated dashboard
export const submitPRLFeedback = (feedbackData) => API.post("/prl/feedback", feedbackData);
export const getPRLAllReports = () => API.get("/prl/reports"); // Get all reports for PRL
export const searchPRLCourses = (query) => API.get(`/prl/search/courses?q=${query}`);
export const searchPRLReports = (query) => API.get(`/prl/search/reports?q=${query}`);
export const exportPRLReports = () => API.get("/prl/export/reports", { responseType: 'blob' });

// ========== PL APIs ==========
export const getPLCourses = () => API.get("/pl/courses");
export const createCourse = (data) => API.post("/pl/courses", data);
export const assignLecture = (data) => API.post("/pl/assign-lecture", data);
export const getPLReports = () => API.get("/pl/reports");
export const getPLClasses = () => API.get("/pl/classes");
export const getPLLectures = () => API.get("/pl/lectures");
export const getPLStudents = () => API.get("/pl/students");

// ========== COURSE & CLASS MANAGEMENT ==========
export const getCourses = () => API.get("/courses");
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const createCourseOld = (data) => API.post("/courses", data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

export const getClasses = () => API.get("/classes");
export const getClassById = (id) => API.get(`/classes/${id}`);
export const createClass = (data) => API.post("/classes", data);
export const updateClass = (id, data) => API.put(`/classes/${id}`, data);
export const deleteClass = (id) => API.delete(`/classes/${id}`);

// ========== LECTURE MANAGEMENT ==========
export const getLectures = () => API.get("/lectures");
export const getLectureById = (id) => API.get(`/lectures/${id}`);
export const createLecture = (data) => API.post("/lectures", data);
export const updateLecture = (id, data) => API.put(`/lectures/${id}`, data);
export const deleteLecture = (id) => API.delete(`/lectures/${id}`);

// ========== REPORT SYSTEM ==========
export const getReports = (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/reports?${params.toString()}`);
};
export const getReportById = (id) => API.get(`/reports/${id}`);
export const updateReport = (id, data) => API.put(`/reports/${id}`, data);
export const deleteReport = (id) => API.delete(`/reports/${id}`);
export const getMyReports = () => API.get("/reports/my-reports");

// ========== FEEDBACK SYSTEM ==========
export const getFeedback = () => API.get("/feedback");
export const createFeedback = (data) => API.post("/feedback", data);
export const getFeedbackByTarget = (targetType, targetId) => API.get(`/feedback/${targetType}/${targetId}`);

// ========== ATTENDANCE SYSTEM ==========
export const getAttendance = () => API.get("/attendance");
export const createAttendance = (data) => API.post("/attendance", data);
export const getStudentAttendanceHistory = (studentId) => API.get(`/attendance/student/${studentId}`);
export const getClassAttendance = (classId) => API.get(`/attendance/class/${classId}`);

// ========== SEARCH FUNCTIONALITY ==========
export const searchReports = (query) => API.get(`/search/reports?q=${query}`);
export const searchCourses = (query) => API.get(`/search/courses?q=${query}`);
export const searchStudents = (query) => API.get(`/search/students?q=${query}`);
export const searchClasses = (query) => API.get(`/search/classes?q=${query}`);
export const searchLecturers = (query) => API.get(`/search/lecturers?q=${query}`);

// ========== COMPREHENSIVE SEARCH APIS ==========
export const universalSearch = (query, filters = {}) => {
  const params = new URLSearchParams();
  params.append('q', query);
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/search/universal?${params.toString()}`);
};

// Role-based search
export const searchStudentData = (query, studentId) => 
  API.get(`/search/student/${studentId}?q=${query}`);

export const searchLecturerData = (query, lecturerId) => 
  API.get(`/search/lecturer/${lecturerId}?q=${query}`);

export const searchPRLData = (query, prlId) => 
  API.get(`/search/prl/${prlId}?q=${query}`);

export const searchPLData = (query) => 
  API.get(`/search/pl?q=${query}`);

// Module-specific advanced search
export const searchReportsAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/search/reports/advanced?${params.toString()}`);
};

export const searchCoursesAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/search/courses/advanced?${params.toString()}`);
};

export const searchStudentsAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/search/students/advanced?${params.toString()}`);
};

export const searchMonitoringAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/search/monitoring/advanced?${params.toString()}`);
};

export const searchRatingsAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/search/ratings/advanced?${params.toString()}`);
};

// ========== EXPORT FUNCTIONALITY ==========
export const exportReportsToExcel = () => API.get("/export/reports", { responseType: 'blob' });
export const exportMonitoringToExcel = () => API.get("/export/monitoring", { responseType: 'blob' });
export const exportCoursesToExcel = () => API.get("/export/courses", { responseType: 'blob' });
export const exportRatingsToExcel = () => API.get("/export/ratings", { responseType: 'blob' });

// ========== COMPREHENSIVE EXPORT APIS ==========
export const exportUniversalData = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/export/universal?${params.toString()}`, { responseType: 'blob' });
};

// Advanced exports with filters
export const exportReportsAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/export/reports/advanced?${params.toString()}`, { responseType: 'blob' });
};

export const exportCoursesAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/export/courses/advanced?${params.toString()}`, { responseType: 'blob' });
};

export const exportStudentsAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/export/students/advanced?${params.toString()}`, { responseType: 'blob' });
};

export const exportMonitoringAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/export/monitoring/advanced?${params.toString()}`, { responseType: 'blob' });
};

export const exportRatingsAdvanced = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return API.get(`/export/ratings/advanced?${params.toString()}`, { responseType: 'blob' });
};

// Role-based exports
export const exportStudentDashboard = (studentId) => 
  API.get(`/export/student/${studentId}/dashboard`, { responseType: 'blob' });

export const exportLecturerDashboard = (lecturerId) => 
  API.get(`/export/lecturer/${lecturerId}/dashboard`, { responseType: 'blob' });

export const exportPRLDashboard = (prlId) => 
  API.get(`/export/prl/${prlId}/dashboard`, { responseType: 'blob' });

export const exportPLDashboard = () => 
  API.get('/export/pl/dashboard', { responseType: 'blob' });

// Batch exports
export const exportAllData = () => 
  API.get('/export/all-data', { responseType: 'blob' });

export const exportByDateRange = (startDate, endDate) => 
  API.get(`/export/date-range?start=${startDate}&end=${endDate}`, { responseType: 'blob' });

// ========== UTILITY FUNCTIONS ==========

// Utility function for handling API errors
export const handleApiError = (error) => {
  console.error('🛑 API Error Handler:', error);
  
  if (error.userMessage) {
    return error.userMessage;
  }
  
  if (error.response) {
    // Server responded with error status
    const serverError = error.response.data?.error || error.response.data?.message;
    if (serverError) {
      return serverError;
    }
    return `Server error (${error.response.status}). Please try again.`;
  } else if (error.request) {
    // Request made but no response received
    return "Cannot connect to server. Please make sure the backend is running on https://luct-reporting-app-bw51.onrender.com";
  } else {
    // Something else happened
    return error.message || "An unexpected error occurred.";
  }
};

// Enhanced API call wrapper with better error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    console.log(`🚀 Making API call: ${apiFunction.name}`);
    const response = await apiFunction(...args);
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error(`❌ API call failed: ${apiFunction.name}`, errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Role-based data fetching helper
export const getRoleBasedData = (endpoint, userId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const baseEndpoints = {
    student: () => getStudentMonitoring(userId || user.id),
    lecturer: () => getLecturerMonitoringData(userId || user.id),
    prl: () => getPRLMonitoring(userId || user.id),
    pl: () => getPLMonitoring()
  };
  
  return baseEndpoints[user.role] ? baseEndpoints[user.role]() : getStudentMonitoring(userId);
};

export default API;
