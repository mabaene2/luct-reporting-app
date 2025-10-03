# LUCT Reporting Application

A comprehensive web-based reporting system for LUCT faculty members including Students, Lecturers, Principal Lecturers (PRL), and Program Leaders (PL).

## Features

### 👨‍🎓 Student Module
- Login/Register
- Monitor classes and progress
- Rate courses and lecturers

### 👨‍🏫 Lecturer Module
- Submit detailed lecture reports
- View assigned classes
- Monitor student progress
- View ratings and feedback

### 🎓 Principal Lecturer (PRL) Module
- Review reports from stream
- Provide feedback on submissions
- Monitor stream activities
- Manage quality standards

### 👨‍💼 Program Leader (PL) Module
- Manage course modules
- Assign lectures to staff
- Oversee program activities
- Monitor overall performance

## Tech Stack

- **Frontend**: React, CSS, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd luct-reporting-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
# Edit the .env file with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=luct_reporting

# Initialize database (creates tables and sample data)
npm run init-db

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Database Setup

The application uses MySQL database. The database initialization script will create:

- **users** - User authentication and roles
- **reports** - Lecturer reports storage
- **courses** - Course information
- **classes** - Class information
- **lectures** - Lecture assignments
- **feedback** - PRL feedback on reports
- **attendance** - Student attendance tracking
- **ratings** - Course and lecturer ratings

### Sample Users Created

After running `npm run init-db`, the following users will be available for testing:

1. **Lecturer**: john.smith@luct.edu / password123
2. **PRL**: sarah.johnson@luct.edu / password123
3. **PL**: michael.brown@luct.edu / password123
4. **Student**: alice.cooper@student.luct.edu / password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class

### Other Modules
- `GET/POST /api/lectures` - Lecture management
- `GET/POST /api/feedback` - Feedback system
- `GET/POST /api/attendance` - Attendance tracking
- `GET/POST /api/ratings` - Rating system

## Project Structure

```
luct-reporting-app/
├── backend/
│   ├── server.js          # Main server file
│   ├── db.js             # Database configuration
│   ├── database.sql      # Database schema
│   ├── init-db.js        # Database initialization
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── App.js       # Main React app
│   └── public/          # Static files
└── README.md
```

## Development

### Running in Development Mode

1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend && npm start`

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend (production)
cd backend
npm start
```

## Features Implemented

✅ **Authentication System**
- JWT-based authentication
- Role-based access control
- Protected routes

✅ **User Management**
- Registration with role selection
- Login/logout functionality
- Profile management

✅ **Report System**
- Comprehensive lecturer reporting form
- Report listing and viewing
- All required fields implemented

✅ **Role-based Dashboards**
- Different interfaces for each user role
- Role-specific navigation
- Appropriate permissions

✅ **Database Integration**
- Complete MySQL schema
- Sample data for testing
- Proper relationships

✅ **Responsive Design**
- Modern UI with Bootstrap
- Mobile-friendly interface
- Professional styling

## Testing the Application

1. **Register a new user** or use sample credentials
2. **Login** with your credentials
3. **Explore role-specific features**:
   - Students: Monitor classes, rate courses
   - Lecturers: Submit reports, view classes
   - PRL: Review reports, provide feedback
   - PL: Manage courses, assign lectures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Note**: This application is designed for educational purposes and demonstrates a complete full-stack web application with role-based access control and comprehensive reporting features.
