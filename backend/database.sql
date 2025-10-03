-- LUCT Reporting Application Database Schema
-- Updated to match the backend code requirements

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS luct_reporting;
USE luct_reporting;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer', 'prl', 'pl') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Programs table
CREATE TABLE IF NOT EXISTS PROGRAMS (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    program_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streams table
CREATE TABLE IF NOT EXISTS STREAMS (
    stream_id INT AUTO_INCREMENT PRIMARY KEY,
    stream_name VARCHAR(255) NOT NULL,
    stream_code VARCHAR(20) UNIQUE NOT NULL,
    program_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES PROGRAMS(program_id)
);

-- Students table
CREATE TABLE IF NOT EXISTS STUDENTS (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    program_id INT NOT NULL,
    stream_id INT NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (program_id) REFERENCES PROGRAMS(program_id),
    FOREIGN KEY (stream_id) REFERENCES STREAMS(stream_id)
);

-- Lecturers table
CREATE TABLE IF NOT EXISTS LECTURERS (
    lecturer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

-- Principal Lecturers table
CREATE TABLE IF NOT EXISTS PRINCIPAL_LECTURERS (
    prl_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    stream_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (stream_id) REFERENCES STREAMS(stream_id)
);

-- Program Leaders table
CREATE TABLE IF NOT EXISTS PROGRAM_LEADERS (
    pl_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    program_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (program_id) REFERENCES PROGRAMS(program_id)
);

-- Courses table
CREATE TABLE IF NOT EXISTS COURSES (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    credits INT DEFAULT 3,
    stream_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES STREAMS(stream_id)
);

-- Classes table
CREATE TABLE IF NOT EXISTS CLASSES (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(50) UNIQUE NOT NULL,
    course_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    venue VARCHAR(100),
    schedule_time TIME,
    schedule_days VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES COURSES(course_id),
    FOREIGN KEY (lecturer_id) REFERENCES LECTURERS(lecturer_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_name VARCHAR(255),
    class_name VARCHAR(100) NOT NULL,
    week_of_reporting INT,
    date_of_lecture DATE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(20),
    lecturer_name VARCHAR(255) NOT NULL,
    actual_students INT NOT NULL,
    total_students INT NOT NULL,
    venue VARCHAR(100),
    lecture_time TIME,
    topic_taught TEXT,
    learning_outcomes TEXT,
    recommendations TEXT,
    prl_feedback TEXT,
    feedback_date DATETIME,
    status ENUM('submitted', 'pending_review', 'approved', 'rejected') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE IF NOT EXISTS RATINGS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lecturer_id INT NOT NULL,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rating (student_id, lecturer_id, course_id),
    FOREIGN KEY (lecturer_id) REFERENCES LECTURERS(lecturer_id),
    FOREIGN KEY (course_id) REFERENCES COURSES(course_id),
    FOREIGN KEY (student_id) REFERENCES STUDENTS(student_id)
);

-- Student Monitoring table
CREATE TABLE IF NOT EXISTS STUDENT_MONITORING (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT,
    attendance_percentage DECIMAL(5,2),
    assignments_submitted INT DEFAULT 0,
    assignments_pending INT DEFAULT 0,
    average_grade DECIMAL(5,2),
    overall_performance VARCHAR(50),
    risk_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES STUDENTS(student_id),
    FOREIGN KEY (course_id) REFERENCES COURSES(course_id)
);

-- Lecturer Monitoring table
CREATE TABLE IF NOT EXISTS LECTURER_MONITORING (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lecturer_id INT NOT NULL,
    monitoring_date DATE NOT NULL,
    attendance_rate DECIMAL(5,2),
    average_class_score DECIMAL(5,2),
    student_engagement_score DECIMAL(5,2),
    completion_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES LECTURERS(lecturer_id)
);

-- PRL Monitoring table
CREATE TABLE IF NOT EXISTS PRL_MONITORING (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prl_id INT NOT NULL,
    monitoring_date DATE NOT NULL,
    overall_attendance_rate DECIMAL(5,2),
    average_course_score DECIMAL(5,2),
    student_satisfaction DECIMAL(3,1),
    completion_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prl_id) REFERENCES PRINCIPAL_LECTURERS(prl_id)
);

-- PL Monitoring table
CREATE TABLE IF NOT EXISTS PL_MONITORING (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pl_id INT NOT NULL,
    monitoring_date DATE NOT NULL,
    enrollment_rate DECIMAL(5,2),
    program_completion_rate DECIMAL(5,2),
    overall_attendance_rate DECIMAL(5,2),
    budget_utilization DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pl_id) REFERENCES PROGRAM_LEADERS(pl_id)
);

-- Insert sample data for testing

-- Programs
INSERT IGNORE INTO PROGRAMS (program_name, program_code) VALUES
('Bachelor of Science in Information Technology', 'BSCIT'),
('Bachelor of Science in Computer Science', 'BSCS');

-- Streams
INSERT IGNORE INTO STREAMS (stream_name, stream_code, program_id) VALUES
('Information Technology', 'IT', 1),
('Software Engineering', 'SE', 2);

-- Users
INSERT IGNORE INTO USERS (email, password_hash, role, first_name, last_name, phone) VALUES
('admin@luct.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pl', 'Admin', 'User', '1234567890'),
('student@luct.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'John', 'Doe', '1234567891'),
('lecturer@luct.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lecturer', 'Dr.', 'Smith', '1234567892'),
('prl@luct.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'prl', 'Dr.', 'Johnson', '1234567893');

-- Students
INSERT IGNORE INTO STUDENTS (user_id, student_number, program_id, stream_id) VALUES
(2, 'STU001', 1, 1);

-- Lecturers
INSERT IGNORE INTO LECTURERS (user_id, employee_number, qualification, specialization) VALUES
(3, 'LEC001', 'PhD', 'Information Technology');

-- Principal Lecturers
INSERT IGNORE INTO PRINCIPAL_LECTURERS (user_id, employee_number, stream_id) VALUES
(4, 'PRL001', 1);

-- Program Leaders
INSERT IGNORE INTO PROGRAM_LEADERS (user_id, employee_number, program_id) VALUES
(1, 'PL001', 1);

-- Courses
INSERT IGNORE INTO COURSES (course_name, course_code, credits, stream_id) VALUES
('Java Programming', 'BIT2101', 3, 1),
('Web Development', 'BIT2201', 4, 1),
('Database Management', 'BIT2301', 4, 1),
('Data Communications', 'BIT2401', 3, 1);

-- Classes
INSERT IGNORE INTO CLASSES (class_code, course_id, lecturer_id, venue, schedule_time, schedule_days) VALUES
('BIT2101-A', 1, 1, 'Lab 301', '09:00:00', 'Mon, Wed, Fri'),
('BIT2201-A', 2, 1, 'Lab 302', '11:00:00', 'Tue, Thu'),
('BIT2301-A', 3, 1, 'Lab 303', '14:00:00', 'Mon, Wed');
