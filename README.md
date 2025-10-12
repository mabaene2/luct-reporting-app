# LUCT Reporting System

A comprehensive web-based reporting application for Limkokwing University of Creative Technology (LUCT) designed to streamline academic reporting, attendance tracking, and performance monitoring.

## 🚀 Features

### Core Features
- **Multi-role Access**: Students, Lecturers, Principal Lecturers, and Program Leaders
- **Comprehensive Reporting**: Detailed lecture reports with attendance tracking
- **Real-time Monitoring**: Track class performance and attendance rates
- **Course Management**: Manage courses, classes, and student information
- **User Management**: Role-based user management system
- **Search & Filter**: Advanced search functionality across all modules
- **Excel Export**: Generate downloadable reports in Excel format
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### User Roles & Permissions

#### Students
- View enrolled courses and classes
- Rate lectures and provide feedback
- Monitor attendance and performance

#### Lecturers
- Create and manage lecture reports
- Track student attendance
- View class schedules and timetables
- Add recommendations and learning outcomes

#### Principal Lecturers
- Review and approve reports
- Monitor teaching performance
- Manage courses under their faculty
- Provide feedback on reports

#### Program Leaders
- Full system administration
- Manage all users, courses, and classes
- View comprehensive analytics
- Generate system-wide reports

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Material-UI (MUI)** for beautiful, responsive UI components
- **React Router** for client-side routing
- **Axios** for HTTP requests
- **Date-fns** for date manipulation

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **JWT** for secure authentication
- **bcryptjs** for password hashing
- **ExcelJS** for Excel report generation

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone [your-repository-url]
cd luct-reporting-app

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

#### Server Environment Variables
Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/luct_reporting
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

#### Client Environment Variables
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

Start MongoDB service:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services
```

### 4. Start the Application

#### Development Mode

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 📊 Database Schema

### User Collection
- `username` (unique, required)
- `email` (unique, required)
- `password` (hashed, required)
- `firstName`, `lastName`
- `role`: student, lecturer, principal_lecturer, program_leader
- `faculty`, `program` (for students)
- `createdAt`, `lastLogin`, `isActive`

### Course Collection
- `courseCode` (unique, required)
- `courseName` (required)
- `faculty`, `program` (required)
- `totalStudents` (required)
- `assignedLecturers` (array of User references)
- `programLeader`, `principalLecturer` (User references)

### Report Collection
- All required fields from the assignment specification
- `facultyName`, `className`, `weekOfReporting`
- `dateOfLecture`, `courseName`, `courseCode`
- `lecturerName`, `actualStudentsPresent`, `totalRegisteredStudents`
- `venue`, `scheduledLectureTime`, `topicTaught`
- `learningOutcomes` (array), `lecturerRecommendations`
- `principalLecturerFeedback`, `programLeaderFeedback`
- `attendanceRate` (calculated automatically)
- `status`: draft, submitted, reviewed, approved

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - Get all reports (with filtering)
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/export/excel` - Export reports to Excel
- `GET /api/reports/search` - Search reports

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎯 Usage Guide

### For Students
1. Register with your student credentials
2. View enrolled courses and classes
3. Rate lectures and provide feedback
4. Monitor your attendance and performance

### For Lecturers
1. Login with your lecturer credentials
2. Create new lecture reports
3. Track student attendance
4. Add learning outcomes and recommendations
5. View your class schedules

### For Principal Lecturers
1. Login with your principal lecturer credentials
2. Review submitted reports
3. Provide feedback on reports
4. Monitor teaching performance
5. Manage courses under your faculty

### For Program Leaders
1. Login with your program leader credentials
2. Manage all users, courses, and classes
3. View comprehensive analytics
4. Generate system-wide reports
5. Export data to Excel

## 📈 Features Implemented

### ✅ Completed Features
- [x] JWT-based authentication system
- [x] Role-based access control
- [x] Multi-role dashboards
- [x] Comprehensive reporting form
- [x] Real-time data validation
- [x] Responsive design for all devices
- [x] Search functionality across all modules
- [x] Excel report generation
- [x] User management system
- [x] Course and class management
- [x] Rating and feedback system
- [x] Beautiful, modern UI with Material-UI

### 🎯 Assignment Requirements Met
- [x] Faculty Name ✓
- [x] Class Name ✓
- [x] Week of Reporting ✓
- [x] Date of Lecture ✓
- [x] Course Name ✓
- [x] Course Code ✓
- [x] Lecturer's Name ✓
- [x] Actual Number of Students Present ✓
- [x] Total Number of Registered Students ✓
- [x] Venue of the Class ✓
- [x] Scheduled Lecture Time ✓
- [x] Topic Taught ✓
- [x] Learning Outcomes of the Topic ✓
- [x] Lecturer's Recommendations ✓
- [x] Search functionality ✓
- [x] Excel export ✓

## 🚀 Deployment

### Local Development
```bash
# Start MongoDB
mongod

# Start server
cd server && npm run dev

# Start client
cd client && npm run dev
```

### Production Deployment
1. Build the client:
```bash
cd client
npm run build
```

2. Start the server in production:
```bash
cd server
NODE_ENV=production npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Limkokwing University of Creative Technology**