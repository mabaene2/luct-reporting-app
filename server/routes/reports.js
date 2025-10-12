const express = require('express');
const Report = require('../models/Report');
const ExcelJS = require('exceljs');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all reports
router.get('/', auth, async (req, res) => {
  try {
    const { lecturer, course, week, status } = req.query;
    let query = {};
    
    if (lecturer) query.lecturer = lecturer;
    if (course) query.courseCode = course;
    if (week) query.weekOfReporting = parseInt(week);
    if (status) query.status = status;
    
    const reports = await Report.find(query)
      .populate('lecturer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('lecturer', 'firstName lastName email');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create report (lecturer only)
router.post('/', auth, authorize('lecturer', 'principal_lecturer'), async (req, res) => {
  try {
    const report = new Report({
      ...req.body,
      lecturer: req.user._id,
      lecturerName: `${req.user.firstName} ${req.user.lastName}`
    });
    
    await report.save();
    
    const populatedReport = await Report.findById(report._id)
      .populate('lecturer', 'firstName lastName email');
    
    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report
router.put('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check authorization
    if (req.user.role === 'lecturer' && report.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }
    
    // Update feedback based on user role
    if (req.user.role === 'principal_lecturer') {
      report.principalLecturerFeedback = req.body.principalLecturerFeedback || report.principalLecturerFeedback;
    } else if (req.user.role === 'program_leader') {
      report.programLeaderFeedback = req.body.programLeaderFeedback || report.programLeaderFeedback;
    }
    
    // Update other fields
    Object.assign(report, req.body);
    report.updatedAt = Date.now();
    
    await report.save();
    
    const populatedReport = await Report.findById(report._id)
      .populate('lecturer', 'firstName lastName email');
    
    res.json(populatedReport);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check authorization
    if (req.user.role === 'lecturer' && report.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }
    
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate Excel report
router.get('/export/excel', auth, async (req, res) => {
  try {
    const { lecturer, course, week, status } = req.query;
    let query = {};
    
    if (lecturer) query.lecturer = lecturer;
    if (course) query.courseCode = course;
    if (week) query.weekOfReporting = parseInt(week);
    if (status) query.status = status;
    
    const reports = await Report.find(query)
      .populate('lecturer', 'firstName lastName email')
      .sort({ dateOfLecture: 1 });
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('LUCT Reports');
    
    // Add headers
    worksheet.columns = [
      { header: 'Faculty Name', key: 'facultyName', width: 20 },
      { header: 'Class Name', key: 'className', width: 15 },
      { header: 'Week', key: 'weekOfReporting', width: 8 },
      { header: 'Date', key: 'dateOfLecture', width: 12 },
      { header: 'Course Name', key: 'courseName', width: 25 },
      { header: 'Course Code', key: 'courseCode', width: 12 },
      { header: 'Lecturer', key: 'lecturerName', width: 20 },
      { header: 'Students Present', key: 'actualStudentsPresent', width: 12 },
      { header: 'Total Students', key: 'totalRegisteredStudents', width: 12 },
      { header: 'Attendance Rate', key: 'attendanceRate', width: 12 },
      { header: 'Venue', key: 'venue', width: 15 },
      { header: 'Time', key: 'scheduledLectureTime', width: 12 },
      { header: 'Topic', key: 'topicTaught', width: 30 },
      { header: 'Learning Outcomes', key: 'learningOutcomes', width: 40 },
      { header: 'Recommendations', key: 'lecturerRecommendations', width: 30 },
      { header: 'PRL Feedback', key: 'principalLecturerFeedback', width: 30 },
      { header: 'PL Feedback', key: 'programLeaderFeedback', width: 30 },
      { header: 'Status', key: 'status', width: 12 }
    ];
    
    // Add data
    reports.forEach(report => {
      worksheet.addRow({
        facultyName: report.facultyName,
        className: report.className,
        weekOfReporting: report.weekOfReporting,
        dateOfLecture: report.dateOfLecture.toLocaleDateString(),
        courseName: report.courseName,
        courseCode: report.courseCode,
        lecturerName: report.lecturerName,
        actualStudentsPresent: report.actualStudentsPresent,
        totalRegisteredStudents: report.totalRegisteredStudents,
        attendanceRate: `${report.attendanceRate.toFixed(1)}%`,
        venue: report.venue,
        scheduledLectureTime: report.scheduledLectureTime,
        topicTaught: report.topicTaught,
        learningOutcomes: report.learningOutcomes.join('; '),
        lecturerRecommendations: report.lecturerRecommendations,
        principalLecturerFeedback: report.principalLecturerFeedback,
        programLeaderFeedback: report.programLeaderFeedback,
        status: report.status
      });
    });
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=luct-reports.xlsx');
    
    // Send the file
    await workbook.xlsx.write(res);
  } catch (error) {
    res.status(500).json({ message: 'Server error generating Excel file' });
  }
});

// Search reports
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchQuery = {
      $or: [
        { facultyName: { $regex: q, $options: 'i' } },
        { className: { $regex: q, $options: 'i' } },
        { courseName: { $regex: q, $options: 'i' } },
        { courseCode: { $regex: q, $options: 'i' } },
        { lecturerName: { $regex: q, $options: 'i' } },
        { topicTaught: { $regex: q, $options: 'i' } },
        { venue: { $regex: q, $options: 'i' } }
      ]
    };
    
    const reports = await Report.find(searchQuery)
      .populate('lecturer', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;