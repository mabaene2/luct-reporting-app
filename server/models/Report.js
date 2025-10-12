const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  facultyName: {
    type: String,
    required: true,
    trim: true
  },
  className: {
    type: String,
    required: true,
    trim: true
  },
  weekOfReporting: {
    type: Number,
    required: true,
    min: 1,
    max: 52
  },
  dateOfLecture: {
    type: Date,
    required: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  lecturerName: {
    type: String,
    required: true,
    trim: true
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actualStudentsPresent: {
    type: Number,
    required: true,
    min: 0
  },
  totalRegisteredStudents: {
    type: Number,
    required: true,
    min: 0
  },
  attendanceRate: {
    type: Number,
    min: 0,
    max: 100
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  scheduledLectureTime: {
    type: String,
    required: true
  },
  topicTaught: {
    type: String,
    required: true,
    trim: true
  },
  learningOutcomes: [{
    type: String,
    required: true,
    trim: true
  }],
  lecturerRecommendations: {
    type: String,
    trim: true
  },
  principalLecturerFeedback: {
    type: String,
    trim: true
  },
  programLeaderFeedback: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.pre('save', function(next) {
  this.attendanceRate = (this.actualStudentsPresent / this.totalRegisteredStudents) * 100;
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema);