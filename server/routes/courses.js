const express = require('express');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const { faculty, program } = req.query;
    let query = {};
    
    if (faculty) query.faculty = faculty;
    if (program) query.program = program;
    
    const courses = await Course.find(query)
      .populate('assignedLecturers', 'firstName lastName email')
      .populate('programLeader', 'firstName lastName email')
      .populate('principalLecturer', 'firstName lastName email');
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('assignedLecturers', 'firstName lastName email')
      .populate('programLeader', 'firstName lastName email')
      .populate('principalLecturer', 'firstName lastName email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (program leader only)
router.post('/', auth, authorize('program_leader'), async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    
    const populatedCourse = await Course.findById(course._id)
      .populate('assignedLecturers', 'firstName lastName email')
      .populate('programLeader', 'firstName lastName email')
      .populate('principalLecturer', 'firstName lastName email');
    
    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', auth, authorize('program_leader'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignedLecturers', 'firstName lastName email')
    .populate('programLeader', 'firstName lastName email')
    .populate('principalLecturer', 'firstName lastName email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course
router.delete('/:id', auth, authorize('program_leader'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;