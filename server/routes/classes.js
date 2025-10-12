const express = require('express');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', auth, async (req, res) => {
  try {
    const { course, lecturer } = req.query;
    let query = {};
    
    if (course) query.course = course;
    if (lecturer) query.lecturer = lecturer;
    
    const classes = await Class.find(query)
      .populate('course', 'courseCode courseName')
      .populate('lecturer', 'firstName lastName email');
    
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get class by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate('course', 'courseCode courseName')
      .populate('lecturer', 'firstName lastName email');
    
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(classDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create class (program leader only)
router.post('/', auth, authorize('program_leader'), async (req, res) => {
  try {
    const classDoc = new Class(req.body);
    await classDoc.save();
    
    const populatedClass = await Class.findById(classDoc._id)
      .populate('course', 'courseCode courseName')
      .populate('lecturer', 'firstName lastName email');
    
    res.status(201).json(populatedClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update class
router.put('/:id', auth, authorize('program_leader'), async (req, res) => {
  try {
    const classDoc = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('course', 'courseCode courseName')
    .populate('lecturer', 'firstName lastName email');
    
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(classDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete class
router.delete('/:id', auth, authorize('program_leader'), async (req, res) => {
  try {
    const classDoc = await Class.findByIdAndDelete(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;