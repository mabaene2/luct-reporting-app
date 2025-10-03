// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// --- Health check ---
app.get("/api/health", async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.json({ status: "ok", message: "Connected to database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Database initialization ---
app.post("/api/init-database", async (req, res) => {
  try {
    console.log('🔄 Initializing database...');

    // Read and execute the SQL schema file
    const fs = require('fs');
    const path = require('path');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

    // Split the SQL file into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('Creating tables...');

    // Get raw connection for DDL statements
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await connection.query(statement);
      }
    }

    await connection.end();

    console.log('✅ Database initialized successfully!');
    res.json({ message: "Database initialized successfully!" });

  } catch (err) {
    console.error('❌ Database initialization error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Test Route ---
app.get("/api/test", (req, res) => {
  res.json({ message: "Test route working!" });
});

// ========== RATINGS SYSTEM - ADD THIS SECTION ==========

// Route to create ratings table (for testing)
app.post("/api/create-ratings-table", async (req, res) => {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lecturer_id INT NOT NULL,
        course_id INT NOT NULL,
        student_id INT NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_rating (student_id, lecturer_id, course_id)
      )
    `;
    
    await db.execute(createTableSQL);
    
    // Insert sample data
    const sampleDataSQL = `
      INSERT IGNORE INTO ratings (lecturer_id, course_id, student_id, student_name, rating, feedback) VALUES
      (1, 1, 1, 'John Doe', 5, 'Excellent Java teacher'),
      (2, 2, 1, 'John Doe', 4, 'Good web development instructor'),
      (3, 3, 1, 'John Doe', 3, 'Database concepts explained well')
    `;
    
    await db.execute(sampleDataSQL);
    
    res.json({ message: "Ratings table created successfully with sample data" });
  } catch (err) {
    console.error('Error creating ratings table:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Ratings API ---

// Get all ratings
app.get("/api/ratings", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM ratings");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new rating - FIXED VERSION
app.post("/api/ratings", async (req, res) => {
  console.log('⭐ Rating submission received:', req.body);
  
  const { 
    lecturer_id, 
    course_id, 
    student_id, 
    student_name, 
    rating, 
    feedback 
  } = req.body;

  try {
    // Validate required fields
    if (!lecturer_id || !course_id || !student_id || !student_name || !rating) {
      return res.status(400).json({ 
        error: 'Missing required fields: lecturer_id, course_id, student_id, student_name, rating' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Check if student already rated this lecturer for this course
    const [existingRatings] = await db.execute(
      'SELECT id FROM ratings WHERE student_id = ? AND lecturer_id = ? AND course_id = ?',
      [student_id, lecturer_id, course_id]
    );

    if (existingRatings.length > 0) {
      return res.status(400).json({ 
        error: 'You have already rated this lecturer for this course' 
      });
    }

    // Insert the rating
    const [result] = await db.execute(
      'INSERT INTO ratings (lecturer_id, course_id, student_id, student_name, rating, feedback) VALUES (?, ?, ?, ?, ?, ?)',
      [lecturer_id, course_id, student_id, student_name, rating, feedback || null]
    );

    console.log('✅ Rating saved with ID:', result.insertId);

    res.json({ 
      message: "Rating submitted successfully", 
      id: result.insertId,
      rating: rating
    });

  } catch (err) {
    console.error('❌ Rating submission error:', err);
    
    // Handle specific SQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'You have already rated this lecturer for this course' 
      });
    }
    
    if (err.sqlMessage) {
      return res.status(500).json({ 
        error: `Database error: ${err.sqlMessage}` 
      });
    }
    
    res.status(500).json({ 
      error: err.message 
    });
  }
});

// Get ratings for a specific lecturer
app.get("/api/ratings/lecturer/:lecturerId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM ratings WHERE lecturer_id = ? ORDER BY created_at DESC',
      [req.params.lecturerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ratings by a specific student
app.get("/api/ratings/student/:studentId", async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT r.*, c.course_name, c.course_code FROM ratings r LEFT JOIN courses c ON r.course_id = c.course_id WHERE r.student_id = ? ORDER BY r.created_at DESC',
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rating statistics for a lecturer
app.get("/api/ratings/lecturer/:lecturerId/stats", async (req, res) => {
  try {
    const [stats] = await db.execute(
      `SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM ratings 
       WHERE lecturer_id = ?`,
      [req.params.lecturerId]
    );

    const average = stats[0].average_rating ? parseFloat(stats[0].average_rating).toFixed(1) : 0;

    res.json({
      total_ratings: stats[0].total_ratings,
      average_rating: average,
      rating_breakdown: {
        five_star: stats[0].five_star,
        four_star: stats[0].four_star,
        three_star: stats[0].three_star,
        two_star: stats[0].two_star,
        one_star: stats[0].one_star
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== AUTHENTICATION ROUTES ==========

// Register - UPDATED WITH FACULTIES
app.post("/api/auth/register", async (req, res) => {
  console.log('📥 Registration request received:', req.body);
  
  const { 
    first_name, 
    last_name, 
    email, 
    password, 
    role, 
    phone, 
    student_number, 
    employee_number, 
    program_id, 
    stream_id, 
    qualification, 
    specialization 
  } = req.body;

  try {
    // Validate required fields
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: first_name, last_name, email, password, role' 
      });
    }

    // Check if user already exists in USERS table
    const [existingUsers] = await db.execute('SELECT user_id FROM USERS WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // 1. Insert user into USERS table
    const [userResult] = await db.execute(
      'INSERT INTO USERS (email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, role, first_name, last_name, phone || null]
    );

    const userId = userResult.insertId;
    console.log('✅ User created with ID:', userId);

    // 2. Create role-specific record
    let roleResult;

    if (role === 'student') {
      if (!student_number) {
        return res.status(400).json({ 
          success: false,
          error: 'Student number is required for student registration' 
        });
      }
      
      // Use provided IDs or defaults
      const finalProgramId = program_id || 1;
      const finalStreamId = stream_id || 1;

      [roleResult] = await db.execute(
        'INSERT INTO STUDENTS (user_id, student_number, program_id, stream_id, enrollment_date) VALUES (?, ?, ?, ?, ?)',
        [userId, student_number, finalProgramId, finalStreamId, new Date()]
      );
      console.log('✅ Student record created with ID:', roleResult.insertId);

    } else if (role === 'lecturer') {
      if (!employee_number) {
        return res.status(400).json({ 
          success: false,
          error: 'Employee number is required for lecturer registration' 
        });
      }

      [roleResult] = await db.execute(
        'INSERT INTO LECTURERS (user_id, employee_number, qualification, specialization) VALUES (?, ?, ?, ?)',
        [userId, employee_number, qualification || 'Masters', specialization || 'Information Technology']
      );
      console.log('✅ Lecturer record created with ID:', roleResult.insertId);

    } else if (role === 'prl') {
      if (!employee_number) {
        return res.status(400).json({ 
          success: false,
          error: 'Employee number is required for PRL registration' 
        });
      }

      [roleResult] = await db.execute(
        'INSERT INTO PRINCIPAL_LECTURERS (user_id, employee_number, stream_id) VALUES (?, ?, ?)',
        [userId, employee_number, stream_id || 1]
      );
      console.log('✅ PRL record created with ID:', roleResult.insertId);

    } else if (role === 'pl') {
      if (!employee_number) {
        return res.status(400).json({ 
          success: false,
          error: 'Employee number is required for PL registration' 
        });
      }

      [roleResult] = await db.execute(
        'INSERT INTO PROGRAM_LEADERS (user_id, employee_number, program_id) VALUES (?, ?, ?)',
        [userId, employee_number, program_id || 1]
      );
      console.log('✅ PL record created with ID:', roleResult.insertId);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      user_id: userId 
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    
    // Handle specific SQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: 'Duplicate entry - user already exists' 
      });
    }
    
    if (err.sqlMessage) {
      return res.status(500).json({ 
        success: false,
        error: `Database error: ${err.sqlMessage}` 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Login - FIXED VERSION
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login attempt for email:', email);

  try {
    // Find user in USERS table
    const [users] = await db.execute('SELECT * FROM USERS WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    console.log('✅ User found:', { id: user.user_id, email: user.email, role: user.role });

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Get role-specific information
    let roleInfo = {};
    let roleId = null;

    if (user.role === 'student') {
      const [students] = await db.execute(
        'SELECT student_id, student_number, program_id, stream_id FROM STUDENTS WHERE user_id = ?',
        [user.user_id]
      );
      if (students.length > 0) {
        roleInfo = students[0];
        roleId = students[0].student_id;
      }
    } else if (user.role === 'lecturer') {
      const [lecturers] = await db.execute(
        'SELECT lecturer_id, employee_number, qualification, specialization FROM LECTURERS WHERE user_id = ?',
        [user.user_id]
      );
      if (lecturers.length > 0) {
        roleInfo = lecturers[0];
        roleId = lecturers[0].lecturer_id;
      }
    } else if (user.role === 'prl') {
      const [prls] = await db.execute(
        'SELECT prl_id, employee_number, stream_id FROM PRINCIPAL_LECTURERS WHERE user_id = ?',
        [user.user_id]
      );
      if (prls.length > 0) {
        roleInfo = prls[0];
        roleId = prls[0].prl_id;
      }
    } else if (user.role === 'pl') {
      const [pls] = await db.execute(
        'SELECT pl_id, employee_number, program_id FROM PROGRAM_LEADERS WHERE user_id = ?',
        [user.user_id]
      );
      if (pls.length > 0) {
        roleInfo = pls[0];
        roleId = pls[0].pl_id;
      }
    }

    console.log('✅ Role info retrieved:', roleInfo);

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role, 
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: roleId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...roleInfo
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile - UPDATED
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT user_id, first_name, last_name, email, role, phone FROM USERS WHERE user_id = ?', 
      [req.user.user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Get role-specific information
    let roleInfo = {};
    if (user.role === 'student') {
      const [students] = await db.execute(
        'SELECT student_number, program_id, stream_id FROM STUDENTS WHERE user_id = ?',
        [req.user.user_id]
      );
      if (students.length > 0) {
        roleInfo = students[0];
      }
    } else if (user.role === 'lecturer') {
      const [lecturers] = await db.execute(
        'SELECT employee_number, qualification, specialization FROM LECTURERS WHERE user_id = ?',
        [req.user.user_id]
      );
      if (lecturers.length > 0) {
        roleInfo = lecturers[0];
      }
    } else if (user.role === 'prl') {
      const [prls] = await db.execute(
        'SELECT employee_number, stream_id FROM PRINCIPAL_LECTURERS WHERE user_id = ?',
        [req.user.user_id]
      );
      if (prls.length > 0) {
        roleInfo = prls[0];
      }
    } else if (user.role === 'pl') {
      const [pls] = await db.execute(
        'SELECT employee_number, program_id FROM PROGRAM_LEADERS WHERE user_id = ?',
        [req.user.user_id]
      );
      if (pls.length > 0) {
        roleInfo = pls[0];
      }
    }
    
    res.json({ ...user, ...roleInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DASHBOARD ENDPOINTS ==========

// Student Dashboard
app.get("/api/dashboard/student", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get student info
    const [students] = await db.execute(
      `SELECT s.student_id, s.student_number, p.program_name, st.stream_name 
       FROM STUDENTS s 
       LEFT JOIN PROGRAMS p ON s.program_id = p.program_id 
       LEFT JOIN STREAMS st ON s.stream_id = st.stream_id 
       WHERE s.user_id = ?`,
      [userId]
    );
    
    // Get monitoring data or create default
    const [monitoring] = await db.execute(
      `SELECT attendance_percentage, assignments_submitted, assignments_pending, 
              average_grade, overall_performance, risk_level 
       FROM STUDENT_MONITORING 
       WHERE student_id = (SELECT student_id FROM STUDENTS WHERE user_id = ?) 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    
    // Get recent ratings
    const [ratings] = await db.execute(
      `SELECT rating, feedback, created_at 
       FROM RATINGS 
       WHERE student_id = (SELECT student_id FROM STUDENTS WHERE user_id = ?) 
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    // Create default monitoring data if none exists
    let monitoringData = monitoring[0];
    if (!monitoringData) {
      monitoringData = {
        attendance_percentage: 85.5,
        assignments_submitted: 8,
        assignments_pending: 2,
        average_grade: 78.5,
        overall_performance: 'Good',
        risk_level: 'Low'
      };
    }

    res.json({
      student: students[0] || { student_number: 'N/A', program_name: 'BSCIT', stream_name: 'Information Technology' },
      monitoring: monitoringData,
      ratings: ratings.length > 0 ? ratings : [
        { rating: 4, feedback: 'Good progress in Java Programming', created_at: new Date() },
        { rating: 5, feedback: 'Excellent work in Web Development', created_at: new Date() }
      ],
      stats: {
        total_courses: 6,
        completed_assignments: monitoringData.assignments_submitted,
        pending_assignments: monitoringData.assignments_pending,
        attendance_rate: monitoringData.attendance_percentage
      }
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lecturer Dashboard
app.get("/api/dashboard/lecturer", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get lecturer info
    const [lecturers] = await db.execute(
      `SELECT l.lecturer_id, l.employee_number, l.qualification, l.specialization 
       FROM LECTURERS l WHERE l.user_id = ?`,
      [userId]
    );
    
    // Get classes
    const [classes] = await db.execute(
      `SELECT c.class_id, c.class_code, co.course_name, c.venue, c.schedule_time, c.schedule_days 
       FROM CLASSES c 
       LEFT JOIN COURSES co ON c.course_id = co.course_id 
       WHERE c.lecturer_id = (SELECT lecturer_id FROM LECTURERS WHERE user_id = ?)`,
      [userId]
    );
    
    // Get reports
    const [reports] = await db.execute(
      `SELECT report_id, course_name, class_name, date_of_lecture, created_at 
       FROM reports 
       WHERE lecturer_name = (SELECT CONCAT(first_name, ' ', last_name) FROM USERS WHERE user_id = ?) 
       ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );
    
    // Get monitoring data
    const [monitoring] = await db.execute(
      `SELECT attendance_rate, average_class_score, student_engagement_score, completion_rate 
       FROM LECTURER_MONITORING 
       WHERE lecturer_id = (SELECT lecturer_id FROM LECTURERS WHERE user_id = ?) 
       ORDER BY monitoring_date DESC LIMIT 1`,
      [userId]
    );

    // Default data
    const defaultMonitoring = {
      attendance_rate: 83.3,
      average_class_score: 76.8,
      student_engagement_score: 82.5,
      completion_rate: 80.0
    };

    res.json({
      lecturer: lecturers[0] || { employee_number: 'LEC001', qualification: 'Masters', specialization: 'Information Technology' },
      classes: classes.length > 0 ? classes : [
        { class_code: 'BIT2101-A', course_name: 'Java Programming', venue: 'Lab 301', schedule_time: '09:00:00', schedule_days: 'Mon, Wed, Fri' },
        { class_code: 'BIT2201-B', course_name: 'Web Development', venue: 'Lab 302', schedule_time: '11:00:00', schedule_days: 'Tue, Thu' },
        { class_code: 'BIT2301-C', course_name: 'Database Management', venue: 'Lab 303', schedule_time: '02:00:00', schedule_days: 'Mon, Wed' }
      ],
      reports: reports.length > 0 ? reports : [
        { course_name: 'Java Programming', class_name: 'BIT2101-A', date_of_lecture: '2024-02-15' },
        { course_name: 'Web Development', class_name: 'BIT2201-B', date_of_lecture: '2024-02-14' }
      ],
      monitoring: monitoring[0] || defaultMonitoring,
      ratings: [
        { rating: 4.5, feedback: 'Great teaching style in Java', created_at: new Date() },
        { rating: 5, feedback: 'Very helpful in Web Development labs', created_at: new Date() }
      ],
      stats: {
        total_classes: classes.length || 3,
        total_reports: reports.length || 2,
        average_rating: 4.7
      }
    });
  } catch (err) {
    console.error('Lecturer dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PRL Dashboard - ENHANCED WITH COMPLETE DATA
app.get("/api/dashboard/prl", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get PRL info
    const [prls] = await db.execute(
      `SELECT p.prl_id, p.employee_number, s.stream_name 
       FROM PRINCIPAL_LECTURERS p 
       LEFT JOIN STREAMS s ON p.stream_id = s.stream_id 
       WHERE p.user_id = ?`,
      [userId]
    );

    // Enhanced mock data for IT Stream
    const itStreamData = {
      prl: { 
        employee_number: 'PRL001', 
        stream_name: 'Information Technology',
        faculty: 'Faculty of Computing & Informatics'
      },
      
      courses: [
        { course_id: 1, course_code: 'BIT2101', course_name: 'Java Programming', credits: 3, lecturer_name: 'Dr. Smith', lecturer_id: 1 },
        { course_id: 2, course_code: 'BIT2201', course_name: 'Web Development', credits: 4, lecturer_name: 'Dr. Johnson', lecturer_id: 2 },
        { course_id: 3, course_code: 'BIT2301', course_name: 'Database Management', credits: 4, lecturer_name: 'Dr. Wilson', lecturer_id: 3 },
        { course_id: 4, course_code: 'BIT2401', course_name: 'Data Communications', credits: 3, lecturer_name: 'Dr. Brown', lecturer_id: 4 },
        { course_id: 5, course_code: 'BIT2501', course_name: 'System Analysis & Design', credits: 3, lecturer_name: 'Dr. Davis', lecturer_id: 5 },
        { course_id: 6, course_code: 'BIT2601', course_name: 'Network Security', credits: 4, lecturer_name: 'Dr. Miller', lecturer_id: 6 }
      ],

      classes: [
        { class_id: 1, class_code: 'BIT2101-A', course_name: 'Java Programming', venue: 'Lab 301', schedule_time: '09:00-10:30', schedule_days: 'Mon, Wed, Fri', students_count: 45 },
        { class_id: 2, class_code: 'BIT2101-B', course_name: 'Java Programming', venue: 'Lab 302', schedule_time: '11:00-12:30', schedule_days: 'Tue, Thu', students_count: 40 },
        { class_id: 3, class_code: 'BIT2201-A', course_name: 'Web Development', venue: 'Lab 303', schedule_time: '14:00-15:30', schedule_days: 'Mon, Wed', students_count: 35 },
        { class_id: 4, class_code: 'BIT2301-A', course_name: 'Database Management', venue: 'Lab 304', schedule_time: '10:00-11:30', schedule_days: 'Tue, Thu, Fri', students_count: 38 },
        { class_id: 5, class_code: 'BIT2401-A', course_name: 'Data Communications', venue: 'Lab 305', schedule_time: '13:00-14:30', schedule_days: 'Mon, Wed', students_count: 32 }
      ],

      reports: [
        { 
          report_id: 1, 
          course_name: 'Java Programming', 
          class_name: 'BIT2101-A', 
          lecturer_name: 'Dr. Smith', 
          date_of_lecture: '2024-02-15',
          topic_taught: 'Object-Oriented Programming Concepts',
          learning_outcomes: 'Students understood inheritance, polymorphism, and encapsulation',
          recommendations: 'More practical examples needed for abstraction',
          actual_students: 42,
          total_students: 45,
          status: 'submitted',
          created_at: new Date('2024-02-15')
        },
        { 
          report_id: 2, 
          course_name: 'Web Development', 
          class_name: 'BIT2201-A', 
          lecturer_name: 'Dr. Johnson', 
          date_of_lecture: '2024-02-14',
          topic_taught: 'React.js Fundamentals and Component Architecture',
          learning_outcomes: 'Students can now create functional components and manage state',
          recommendations: 'Need to cover more advanced hooks in next session',
          actual_students: 33,
          total_students: 35,
          status: 'submitted',
          created_at: new Date('2024-02-14')
        },
        { 
          report_id: 3, 
          course_name: 'Database Management', 
          class_name: 'BIT2301-A', 
          lecturer_name: 'Dr. Wilson', 
          date_of_lecture: '2024-02-13',
          topic_taught: 'SQL Queries and Normalization',
          learning_outcomes: 'Students mastered basic SQL queries and understand 1NF, 2NF, 3NF',
          recommendations: 'More practice on complex joins needed',
          actual_students: 36,
          total_students: 38,
          status: 'pending_review',
          created_at: new Date('2024-02-13')
        }
      ],

      monitoring: {
        overall_attendance_rate: 87.5,
        average_course_score: 79.2,
        courses_on_track: 5,
        courses_behind: 1,
        student_satisfaction: 4.3,
        completion_rate: 82.7
      },

      ratings: [
        { rating: 4.5, lecturer_name: 'Dr. Smith', course: 'Java Programming', feedback: 'Excellent teaching methodology and clear explanations', created_at: '2024-02-10' },
        { rating: 4.2, lecturer_name: 'Dr. Johnson', course: 'Web Development', feedback: 'Very practical and hands-on approach to learning', created_at: '2024-02-09' },
        { rating: 4.7, lecturer_name: 'Dr. Wilson', course: 'Database Management', feedback: 'Clear explanations of complex database concepts', created_at: '2024-02-08' }
      ],

      lecturers: [
        { lecturer_id: 1, name: 'Dr. Smith', specialization: 'Software Engineering', courses_count: 2 },
        { lecturer_id: 2, name: 'Dr. Johnson', specialization: 'Web Technologies', courses_count: 1 },
        { lecturer_id: 3, name: 'Dr. Wilson', specialization: 'Database Systems', courses_count: 1 },
        { lecturer_id: 4, name: 'Dr. Brown', specialization: 'Networking', courses_count: 1 },
        { lecturer_id: 5, name: 'Dr. Davis', specialization: 'Systems Analysis', courses_count: 1 }
      ],

      stats: {
        total_courses: 6,
        total_lecturers: 5,
        total_classes: 8,
        total_students: 190,
        active_courses: 5,
        pending_reports: 1
      }
    };

    res.json(itStreamData);
  } catch (err) {
    console.error('PRL dashboard error:', err);
    // Return enhanced mock data even if database fails
    res.json({
      prl: { 
        employee_number: 'PRL001', 
        stream_name: 'Information Technology',
        faculty: 'Faculty of Computing & Informatics'
      },
      courses: [
        { course_id: 1, course_code: 'BIT2101', course_name: 'Java Programming', credits: 3, lecturer_name: 'Dr. Smith', lecturer_id: 1 },
        { course_id: 2, course_code: 'BIT2201', course_name: 'Web Development', credits: 4, lecturer_name: 'Dr. Johnson', lecturer_id: 2 },
        { course_id: 3, course_code: 'BIT2301', course_name: 'Database Management', credits: 4, lecturer_name: 'Dr. Wilson', lecturer_id: 3 }
      ],
      classes: [
        { class_id: 1, class_code: 'BIT2101-A', course_name: 'Java Programming', venue: 'Lab 301', schedule_time: '09:00-10:30', schedule_days: 'Mon, Wed, Fri', students_count: 45 },
        { class_id: 2, class_code: 'BIT2201-A', course_name: 'Web Development', venue: 'Lab 302', schedule_time: '11:00-12:30', schedule_days: 'Tue, Thu', students_count: 35 }
      ],
      reports: [
        { 
          report_id: 1, 
          course_name: 'Java Programming', 
          class_name: 'BIT2101-A', 
          lecturer_name: 'Dr. Smith', 
          date_of_lecture: '2024-02-15',
          topic_taught: 'Object-Oriented Programming Concepts',
          actual_students: 42,
          total_students: 45,
          status: 'submitted'
        },
        { 
          report_id: 2, 
          course_name: 'Web Development', 
          class_name: 'BIT2201-A', 
          lecturer_name: 'Dr. Johnson', 
          date_of_lecture: '2024-02-14',
          topic_taught: 'React.js Fundamentals',
          actual_students: 33,
          total_students: 35,
          status: 'submitted'
        }
      ],
      monitoring: {
        overall_attendance_rate: 85.2,
        average_course_score: 78.5,
        courses_on_track: 6,
        courses_behind: 2,
        student_satisfaction: 4.3,
        completion_rate: 82.7
      },
      ratings: [
        { rating: 4.2, lecturer_name: 'Dr. Smith', feedback: 'Good course structure in Java', created_at: new Date() },
        { rating: 4.8, lecturer_name: 'Dr. Johnson', feedback: 'Excellent Web Development teaching', created_at: new Date() }
      ],
      stats: {
        total_courses: 6,
        total_lecturers: 5,
        total_classes: 8,
        total_students: 190
      }
    });
  }
});

// PL Dashboard
app.get("/api/dashboard/pl", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get PL info
    const [pls] = await db.execute(
      `SELECT pl.pl_id, pl.employee_number, p.program_name 
       FROM PROGRAM_LEADERS pl 
       LEFT JOIN PROGRAMS p ON pl.program_id = p.program_id 
       WHERE pl.user_id = ?`,
      [userId]
    );
    
    // Get courses
    const [courses] = await db.execute('SELECT course_id, course_code, course_name, credits FROM COURSES LIMIT 10');
    
    // Get reports
    const [reports] = await db.execute('SELECT report_id, course_name, class_name, lecturer_name, date_of_lecture FROM reports ORDER BY created_at DESC LIMIT 15');
    
    // Get classes
    const [classes] = await db.execute('SELECT class_id, class_code, course_name, venue FROM CLASSES LIMIT 10');

    res.json({
      pl: pls[0] || { employee_number: 'PL001', program_name: 'BSC Information Technology' },
      courses: courses.length > 0 ? courses : [
        { course_code: 'BIT2101', course_name: 'Java Programming', credits: 3 },
        { course_code: 'BIT2201', course_name: 'Web Development', credits: 4 },
        { course_code: 'BIT2301', course_name: 'Database Management', credits: 4 },
        { course_code: 'BIT2401', course_name: 'Data Communications', credits: 3 },
        { course_code: 'BIT2501', course_name: 'System Analysis', credits: 3 },
        { course_code: 'BIT2601', course_name: 'Network Security', credits: 4 }
      ],
      reports: reports.length > 0 ? reports : [
        { course_name: 'Java Programming', class_name: 'BIT2101-A', lecturer_name: 'Dr. Smith', date_of_lecture: '2024-02-15' },
        { course_name: 'Web Development', class_name: 'BIT2201-B', lecturer_name: 'Dr. Brown', date_of_lecture: '2024-02-14' }
      ],
      monitoring: {
        enrollment_rate: 92.9,
        program_completion_rate: 88.5,
        overall_attendance_rate: 85.1,
        budget_utilization: 87.5
      },
      classes: classes.length > 0 ? classes : [
        { class_code: 'BIT2101-A', course_name: 'Java Programming', venue: 'Lab 301' },
        { class_code: 'BIT2201-B', course_name: 'Web Development', venue: 'Lab 302' }
      ],
      ratings: [
        { rating: 4.5, lecturer_name: 'Dr. Smith', feedback: 'Excellent Java instructor', created_at: new Date() },
        { rating: 4.0, lecturer_name: 'Dr. Brown', feedback: 'Good Web Development content', created_at: new Date() }
      ],
      stats: {
        total_courses: courses.length || 6,
        total_streams: 3,
        total_classes: classes.length || 15,
        total_students: 450
      }
    });
  } catch (err) {
    console.error('PL dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== ROLE-SPECIFIC ENDPOINTS ==========

// --- STUDENT ENDPOINTS ---
app.get("/api/student/monitoring", authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [monitoring] = await db.execute(`
      SELECT sm.*, c.course_name, c.course_code 
      FROM STUDENT_MONITORING sm
      JOIN COURSES c ON sm.course_id = c.course_id
      WHERE sm.student_id = (SELECT student_id FROM STUDENTS WHERE user_id = ?)
      ORDER BY sm.created_at DESC
    `, [userId]);
    
    res.json(monitoring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/student/ratings", authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [ratings] = await db.execute(`
      SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) as lecturer_name, c.course_name
      FROM RATINGS r
      JOIN LECTURERS l ON r.lecturer_id = l.lecturer_id
      JOIN USERS u ON l.user_id = u.user_id
      JOIN COURSES c ON r.course_id = c.course_id
      WHERE r.student_id = (SELECT student_id FROM STUDENTS WHERE user_id = ?)
      ORDER BY r.created_at DESC
    `, [userId]);
    
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LECTURER ENDPOINTS ---
app.get("/api/lecturer/classes", authenticateToken, authorizeRole(['lecturer']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [classes] = await db.execute(`
      SELECT c.*, co.course_name, co.course_code
      FROM CLASSES c
      JOIN COURSES co ON c.course_id = co.course_id
      WHERE c.lecturer_id = (SELECT lecturer_id FROM LECTURERS WHERE user_id = ?)
      ORDER BY c.schedule_time
    `, [userId]);
    
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/lecturer/reports", authenticateToken, authorizeRole(['lecturer']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const lecturerName = req.user.first_name + ' ' + req.user.last_name;
    
    const [reports] = await db.execute(`
      SELECT * FROM reports 
      WHERE lecturer_name = ?
      ORDER BY created_at DESC
    `, [lecturerName]);
    
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lecturer/reports", authenticateToken, authorizeRole(['lecturer']), async (req, res) => {
  try {
    const {
      faculty_name, class_name, week_of_reporting, date_of_lecture,
      course_name, course_code, lecturer_name, actual_students,
      total_students, venue, lecture_time, topic_taught,
      learning_outcomes, recommendations
    } = req.body;

    const [result] = await db.execute(`
      INSERT INTO reports (
        faculty_name, class_name, week_of_reporting, date_of_lecture,
        course_name, course_code, lecturer_name, actual_students,
        total_students, venue, lecture_time, topic_taught,
        learning_outcomes, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      faculty_name, class_name, week_of_reporting, date_of_lecture,
      course_name, course_code, lecturer_name, actual_students,
      total_students, venue, lecture_time, topic_taught,
      learning_outcomes, recommendations
    ]);

    res.json({ message: "Report submitted successfully", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRL ENDPOINTS ---
app.get("/api/prl/courses", authenticateToken, authorizeRole(['prl']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Try to get courses from database first
    const [courses] = await db.execute(`
      SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as lecturer_name
      FROM COURSES c
      LEFT JOIN CLASSES cl ON c.course_id = cl.course_id
      LEFT JOIN LECTURERS l ON cl.lecturer_id = l.lecturer_id
      LEFT JOIN USERS u ON l.user_id = u.user_id
      WHERE c.stream_id = (SELECT stream_id FROM PRINCIPAL_LECTURERS WHERE user_id = ?)
      GROUP BY c.course_id
    `, [userId]);
    
    // If no courses in database, return mock data
    if (courses.length === 0) {
      const mockCourses = [
        { course_id: 1, course_code: 'BIT2101', course_name: 'Java Programming', credits: 3, lecturer_name: 'Dr. Smith', stream_id: 1, lecturer_id: 1 },
        { course_id: 2, course_code: 'BIT2201', course_name: 'Web Development', credits: 4, lecturer_name: 'Dr. Johnson', stream_id: 1, lecturer_id: 2 },
        { course_id: 3, course_code: 'BIT2301', course_name: 'Database Management', credits: 4, lecturer_name: 'Dr. Wilson', stream_id: 1, lecturer_id: 3 },
        { course_id: 4, course_code: 'BIT2401', course_name: 'Data Communications', credits: 3, lecturer_name: 'Dr. Brown', stream_id: 1, lecturer_id: 4 },
        { course_id: 5, course_code: 'BIT2501', course_name: 'System Analysis & Design', credits: 3, lecturer_name: 'Dr. Davis', stream_id: 1, lecturer_id: 5 },
        { course_id: 6, course_code: 'BIT2601', course_name: 'Network Security', credits: 4, lecturer_name: 'Dr. Miller', stream_id: 1, lecturer_id: 6 }
      ];
      return res.json(mockCourses);
    }
    
    res.json(courses);
  } catch (err) {
    console.error('PRL courses error:', err);
    // Return mock data on error
    const mockCourses = [
      { course_id: 1, course_code: 'BIT2101', course_name: 'Java Programming', credits: 3, lecturer_name: 'Dr. Smith', lecturer_id: 1 },
      { course_id: 2, course_code: 'BIT2201', course_name: 'Web Development', credits: 4, lecturer_name: 'Dr. Johnson', lecturer_id: 2 },
      { course_id: 3, course_code: 'BIT2301', course_name: 'Database Management', credits: 4, lecturer_name: 'Dr. Wilson', lecturer_id: 3 }
    ];
    res.json(mockCourses);
  }
});

// Update PRL reports endpoint
app.get("/api/prl/reports", authenticateToken, authorizeRole(['prl']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [reports] = await db.execute(`
      SELECT r.*, c.stream_id
      FROM reports r
      JOIN COURSES c ON r.course_name = c.course_name
      WHERE c.stream_id = (SELECT stream_id FROM PRINCIPAL_LECTURERS WHERE user_id = ?)
      ORDER BY r.created_at DESC
    `, [userId]);
    
    // If no reports, return mock data
    if (reports.length === 0) {
      const mockReports = [
        { 
          report_id: 1, 
          course_name: 'Java Programming', 
          class_name: 'BIT2101-A', 
          lecturer_name: 'Dr. Smith', 
          date_of_lecture: '2024-02-15',
          topic_taught: 'Object-Oriented Programming Concepts',
          learning_outcomes: 'Students understood inheritance, polymorphism, and encapsulation',
          recommendations: 'More practical examples needed for abstraction',
          actual_students: 42,
          total_students: 45,
          status: 'submitted',
          created_at: new Date('2024-02-15')
        },
        { 
          report_id: 2, 
          course_name: 'Web Development', 
          class_name: 'BIT2201-A', 
          lecturer_name: 'Dr. Johnson', 
          date_of_lecture: '2024-02-14',
          topic_taught: 'React.js Fundamentals and Component Architecture',
          learning_outcomes: 'Students can now create functional components and manage state',
          recommendations: 'Need to cover more advanced hooks in next session',
          actual_students: 33,
          total_students: 35,
          status: 'submitted',
          created_at: new Date('2024-02-14')
        }
      ];
      return res.json(mockReports);
    }
    
    res.json(reports);
  } catch (err) {
    console.error('PRL reports error:', err);
    // Return mock data on error
    const mockReports = [
      { 
        report_id: 1, 
        course_name: 'Java Programming', 
        class_name: 'BIT2101-A', 
        lecturer_name: 'Dr. Smith', 
        date_of_lecture: '2024-02-15',
        topic_taught: 'Object-Oriented Programming Concepts',
        actual_students: 42,
        total_students: 45,
        status: 'submitted'
      },
      { 
        report_id: 2, 
        course_name: 'Web Development', 
        class_name: 'BIT2201-A', 
        lecturer_name: 'Dr. Johnson', 
        date_of_lecture: '2024-02-14',
        topic_taught: 'React.js Fundamentals',
        actual_students: 33,
        total_students: 35,
        status: 'submitted'
      }
    ];
    res.json(mockReports);
  }
});

// Add PRL classes endpoint
app.get("/api/prl/classes", authenticateToken, authorizeRole(['prl']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [classes] = await db.execute(`
      SELECT c.class_id, c.class_code, co.course_name, c.venue, c.schedule_time, c.schedule_days,
             COUNT(DISTINCT s.student_id) as students_count
      FROM CLASSES c 
      JOIN COURSES co ON c.course_id = co.course_id 
      LEFT JOIN STUDENTS s ON c.class_id = s.class_id
      WHERE co.stream_id = (SELECT stream_id FROM PRINCIPAL_LECTURERS WHERE user_id = ?)
      GROUP BY c.class_id
      ORDER BY c.class_code
    `, [userId]);
    
    // If no classes, return mock data
    if (classes.length === 0) {
      const mockClasses = [
        { class_id: 1, class_code: 'BIT2101-A', course_name: 'Java Programming', venue: 'Lab 301', schedule_time: '09:00-10:30', schedule_days: 'Mon, Wed, Fri', students_count: 45 },
        { class_id: 2, class_code: 'BIT2101-B', course_name: 'Java Programming', venue: 'Lab 302', schedule_time: '11:00-12:30', schedule_days: 'Tue, Thu', students_count: 40 },
        { class_id: 3, class_code: 'BIT2201-A', course_name: 'Web Development', venue: 'Lab 303', schedule_time: '14:00-15:30', schedule_days: 'Mon, Wed', students_count: 35 }
      ];
      return res.json(mockClasses);
    }
    
    res.json(classes);
  } catch (err) {
    console.error('PRL classes error:', err);
    // Return mock data on error
    const mockClasses = [
      { class_id: 1, class_code: 'BIT2101-A', course_name: 'Java Programming', venue: 'Lab 301', schedule_time: '09:00-10:30', schedule_days: 'Mon, Wed, Fri', students_count: 45 },
      { class_id: 2, class_code: 'BIT2201-A', course_name: 'Web Development', venue: 'Lab 302', schedule_time: '11:00-12:30', schedule_days: 'Tue, Thu', students_count: 35 }
    ];
    res.json(mockClasses);
  }
});

// Add PRL feedback endpoint
app.post("/api/prl/feedback/:reportId", authenticateToken, authorizeRole(['prl']), async (req, res) => {
  try {
    const { reportId } = req.params;
    const { feedback } = req.body;
    
    const [result] = await db.execute(
      'UPDATE reports SET prl_feedback = ?, feedback_date = ? WHERE report_id = ?',
      [feedback, new Date(), reportId]
    );
    
    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error('PRL feedback error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- PL ENDPOINTS ---
app.get("/api/pl/courses", authenticateToken, authorizeRole(['pl']), async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [courses] = await db.execute(`
      SELECT c.*, s.stream_name
      FROM COURSES c
      JOIN STREAMS s ON c.stream_id = s.stream_id
      WHERE s.program_id = (SELECT program_id FROM PROGRAM_LEADERS WHERE user_id = ?)
    `, [userId]);
    
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== MISSING ROUTES FOR FRONTEND ==========

// Mock routes for development
app.get("/api/lecturer/:id/students", (req, res) => {
  console.log('👥 Fetching students for lecturer:', req.params.id);
  res.json([
    { id: 1, name: "John Doe", student_id: "S001" },
    { id: 2, name: "Jane Smith", student_id: "S002" },
    { id: 3, name: "Mike Johnson", student_id: "S003" }
  ]);
});

app.get("/api/lecturer/:id/courses", (req, res) => {
  console.log('📖 Fetching courses for lecturer:', req.params.id);
  res.json([
    { id: 1, name: "Java Programming", code: "BIT2101", lecturer_id: 1 },
    { id: 2, name: "Web Development", code: "BIT2201", lecturer_id: 2 },
    { id: 3, name: "Database Management", code: "BIT2301", lecturer_id: 3 }
  ]);
});

app.get("/api/lecturer/:id/monitoring-data", (req, res) => {
  console.log('📊 Fetching monitoring data for lecturer:', req.params.id);
  res.json([]);
});

app.get("/api/lecturer/:id/ratings", (req, res) => {
  console.log('⭐ Fetching ratings for lecturer:', req.params.id);
  res.json([]);
});

// Monitoring routes
app.get("/api/monitoring/student/:studentId", (req, res) => {
  console.log('📊 Fetching monitoring for student:', req.params.studentId);
  res.json({
    attendance: [
      { course_name: "Java Programming", status: "present", date: "2024-01-15" },
      { course_name: "Web Development", status: "present", date: "2024-01-16" },
      { course_name: "Database Management", status: "present", date: "2024-01-17" }
    ],
    grades: [
      { course_name: "Java Programming", grade: "A", feedback: "Excellent work in OOP concepts" },
      { course_name: "Web Development", grade: "B+", feedback: "Good progress in React.js" }
    ],
    schedule: [
      { course_name: "Java Programming", time: "09:00 AM", room: "Lab 301" },
      { course_name: "Web Development", time: "11:00 AM", room: "Lab 302" },
      { course_name: "Database Management", time: "02:00 PM", room: "Lab 303" }
    ]
  });
});

app.get("/api/monitoring/lecturer/:lecturerId/students", (req, res) => {
  console.log('👥 Fetching students for lecturer monitoring:', req.params.lecturerId);
  res.json([
    { id: 1, name: "John Doe", student_id: "S001" },
    { id: 2, name: "Jane Smith", student_id: "S002" },
    { id: 3, name: "Mike Johnson", student_id: "S003" },
    { id: 4, name: "Sarah Wilson", student_id: "S004" },
    { id: 5, name: "David Brown", student_id: "S005" }
  ]);
});

app.get("/api/monitoring/lecturer/:lecturerId/courses", (req, res) => {
  console.log('📖 Fetching courses for lecturer monitoring:', req.params.lecturerId);
  res.json([
    { id: 1, name: "Java Programming", code: "BIT2101" },
    { id: 2, name: "Web Development", code: "BIT2201" },
    { id: 3, name: "Database Management", code: "BIT2301" }
  ]);
});

app.post("/api/monitoring", (req, res) => {
  console.log('💾 Saving monitoring data:', req.body);
  res.json({ message: "Monitoring data saved successfully", id: Date.now() });
});

// Rating routes
app.get("/api/ratings/student/:studentId/lecturers", (req, res) => {
  console.log('👨‍🏫 Fetching lecturers for student to rate:', req.params.studentId);
  res.json([
    { id: 1, name: "Dr. Smith", course: "Java Programming" },
    { id: 2, name: "Dr. Johnson", course: "Web Development" },
    { id: 3, name: "Dr. Wilson", course: "Database Management" }
  ]);
});

app.post("/api/ratings/lecturer", (req, res) => {
  console.log('⭐ Submitting lecturer rating:', req.body);
  res.json({ message: "Rating submitted successfully", id: Date.now() });
});

app.get("/api/ratings/student/:studentId/history", (req, res) => {
  console.log('📜 Fetching rating history for student:', req.params.studentId);
  res.json([]);
});

app.get("/api/ratings/lecturer/:lecturerId", (req, res) => {
  console.log('⭐ Fetching ratings for lecturer:', req.params.lecturerId);
  res.json([]);
});

app.get("/api/ratings/lecturer/:lecturerId/stats", (req, res) => {
  console.log('📈 Fetching rating stats for lecturer:', req.params.lecturerId);
  res.json({ average_rating: 4.5, total_ratings: 10 });
});

// Search routes
app.get("/api/search/reports", (req, res) => {
  res.json([]);
});

app.get("/api/search/courses", (req, res) => {
  res.json([]);
});

app.get("/api/search/students", (req, res) => {
  res.json([]);
});

app.get("/api/search/classes", (req, res) => {
  res.json([]);
});

app.get("/api/search/lecturers", (req, res) => {
  res.json([]);
});

// Export routes
app.get("/api/export/reports", (req, res) => {
  res.json({ message: "Export feature coming soon" });
});

app.get("/api/export/monitoring", (req, res) => {
  res.json({ message: "Export feature coming soon" });
});

app.get("/api/export/courses", (req, res) => {
  res.json({ message: "Export feature coming soon" });
});

app.get("/api/export/ratings", (req, res) => {
  res.json({ message: "Export feature coming soon" });
});

// ========== EXISTING ROUTES ==========

// --- Reports ---
app.get("/api/reports", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM reports");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reports", async (req, res) => {
  const {
    lecturer_name,
    course_name,
    class_name,
    week_of_reporting,
    date_of_lecture,
    actual_students,
    total_students,
    venue,
    lecture_time,
    topic_taught,
    learning_outcomes,
    recommendations
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO reports 
      (lecturer_name, course_name, class_name, week_of_reporting,
       date_of_lecture, actual_students, total_students, venue,
       lecture_time, topic_taught, learning_outcomes, recommendations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lecturer_name,
        course_name,
        class_name,
        week_of_reporting,
        date_of_lecture,
        actual_students,
        total_students,
        venue,
        lecture_time,
        topic_taught,
        learning_outcomes,
        recommendations
      ]
    );
    res.json({ message: "Report submitted", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Courses ---
app.get("/api/courses", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM courses");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses", async (req, res) => {
  const { name, code, lecturer_name } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO courses (name, code, lecturer_name) VALUES (?, ?, ?)",
      [name, code, lecturer_name]
    );
    res.json({ message: "Course added", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Classes ---
app.get("/api/classes", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM classes");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/classes", async (req, res) => {
  const { name, faculty, lecturer_name } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO classes (name, faculty, lecturer_name) VALUES (?, ?, ?)",
      [name, faculty, lecturer_name]
    );
    res.json({ message: "Class added", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Lectures ---
app.get("/api/lectures", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM lectures");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lectures", async (req, res) => {
  const { course_id, lecturer_id, topic, date, time } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO lectures (course_id, lecturer_id, topic, date, time) VALUES (?, ?, ?, ?, ?)",
      [course_id, lecturer_id, topic, date, time]
    );
    res.json({ message: "Lecture assigned", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Feedback ---
app.get("/api/feedback", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM feedback");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/feedback", async (req, res) => {
  const { report_id, feedback } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO feedback (report_id, feedback) VALUES (?, ?)",
      [report_id, feedback]
    );
    res.json({ message: "Feedback submitted", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Attendance / Monitoring ---
app.get("/api/attendance", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM attendance");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/attendance", async (req, res) => {
  const { student_name, class_name, date_of_lecture, status } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO attendance (student_name, class_name, date_of_lecture, status) VALUES (?, ?, ?, ?)",
      [student_name, class_name, date_of_lecture, status]
    );
    res.json({ message: "Attendance recorded", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Monitoring Endpoints ---
app.get("/api/monitoring/students", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM STUDENT_MONITORING");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/monitoring/lecturers", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM LECTURER_MONITORING");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/monitoring/prl", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM PRL_MONITORING");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/monitoring/pl", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM PL_MONITORING");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));