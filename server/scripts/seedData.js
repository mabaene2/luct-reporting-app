const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Class = require('../models/Class');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luct_reporting');
    
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Class.deleteMany({});
    await Report.deleteMany({});

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@luct.edu',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'program_leader',
        faculty: 'Faculty of Computing and Informatics',
        isActive: true
      },
      {
        username: 'principal1',
        email: 'principal@luct.edu',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Principal',
        role: 'principal_lecturer',
        faculty: 'Faculty of Computing and Informatics',
        isActive: true
      },
      {
        username: 'lecturer1',
        email: 'lecturer@luct.edu',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Lecturer',
        role: 'lecturer',
        faculty: 'Faculty of Computing and Informatics',
        isActive: true
      },
      {
        username: 'student1',
        email: 'student@luct.edu',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Student',
        role: 'student',
        faculty: 'Faculty of Computing and Informatics',
        program: 'BSc in Computer Science',
        isActive: true
      }
    ]);

    // Create courses
    const courses = await Course.insertMany([
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        faculty: 'Faculty of Computing and Informatics',
        program: 'BSc in Computer Science',
        totalStudents: 50,
        assignedLecturers: [users[2]._id],
        programLeader: users[0]._id,
        principalLecturer: users[1]._id,
        isActive: true
      },
      {
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        faculty: 'Faculty of Computing and Informatics',
        program: 'BSc in Computer Science',
        totalStudents: 45,
        assignedLecturers: [users[2]._id],
        programLeader: users[0]._id,
        principalLecturer: users[1]._id,
        isActive: true
      }
    ]);

    // Create classes
    const classes = await Class.insertMany([
      {
        className: 'CS101-A',
        course: courses[0]._id,
        lecturer: users[2]._id,
        venue: 'Room A101',
        scheduledTime: '09:00-11:00',
        dayOfWeek: 'Monday',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        isActive: true
      },
      {
        className: 'CS201-A',
        course: courses[1]._id,
        lecturer: users[2]._id,
        venue: 'Room B205',
        scheduledTime: '14:00-16:00',
        dayOfWeek: 'Wednesday',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        isActive: true
      }
    ]);

    // Create sample reports - SIMPLE VERSION FOR YOUR 5 FIELDS
    await Report.insertMany([
      {
        facultyName: 'Faculty of Computing and Informatics',
        className: 'CS101-A',
        weekOfReporting: 1,
        dateOfLecture: new Date('2024-01-15'),
        courseName: 'Introduction to Computer Science',
        courseCode: 'CS101',
        lecturerName: 'Jane Lecturer',
        lecturer: users[2]._id,
        actualStudentsPresent: 45,
        totalRegisteredStudents: 50,
        venue: 'Room A101',
        scheduledLectureTime: '09:00-11:00',
        topicTaught: 'Introduction to Programming',
        learningOutcomes: ['Understand basic programming concepts', 'Write simple programs'],
        lecturerRecommendations: 'Students should practice more coding exercises',
        status: 'submitted'
      },
      {
        facultyName: 'Faculty of Computing and Informatics',
        className: 'CS201-A',
        weekOfReporting: 2,
        dateOfLecture: new Date('2024-01-17'),
        courseName: 'Data Structures and Algorithms',
        courseCode: 'CS201',
        lecturerName: 'Jane Lecturer',
        lecturer: users[2]._id,
        actualStudentsPresent: 42,
        totalRegisteredStudents: 45,
        venue: 'Room B205',
        scheduledLectureTime: '14:00-16:00',
        topicTaught: 'Arrays and Linked Lists',
        learningOutcomes: ['Understand array operations', 'Implement linked lists'],
        lecturerRecommendations: 'Focus on time complexity analysis',
        status: 'submitted'
      },
      // ADDED SIMPLE REPORTS FOR YOUR 5 FIELDS
      {
        courseCode: 'IT101',
        courseName: 'Introduction to Programming',
        topicTaught: 'Python Basics',
        dateOfLecture: new Date('2024-01-15'),
        lecturerName: 'Dr. Smith',
        actualStudentsPresent: 45,
        totalRegisteredStudents: 50,
        status: 'submitted'
      },
      {
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms', 
        topicTaught: 'Database Design',
        dateOfLecture: new Date('2024-01-16'),
        lecturerName: 'Prof. Johnson',
        actualStudentsPresent: 38,
        totalRegisteredStudents: 40,
        status: 'submitted'
      },
      {
        courseCode: 'WEB301',
        courseName: 'Web Development',
        topicTaught: 'React Components',
        dateOfLecture: new Date('2024-01-17'),
        lecturerName: 'Dr. Williams',
        actualStudentsPresent: 35,
        totalRegisteredStudents: 35,
        status: 'submitted'
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('Test accounts created:');
    console.log('- Admin: admin@luct.edu / password123');
    console.log('- Principal: principal@luct.edu / password123');
    console.log('- Lecturer: lecturer@luct.edu / password123');
    console.log('- Student: student@luct.edu / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;