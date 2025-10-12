const express = require('express');
const Rating = require('../models/Rating');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all ratings
router.get('/', auth, async (req, res) => {
  try {
    const { ratedEntity, ratedEntityType } = req.query;
    let query = {};
    
    if (ratedEntity) query.ratedEntity = ratedEntity;
    if (ratedEntityType) query.ratedEntityType = ratedEntityType;
    
    const ratings = await Rating.find(query)
      .populate('rater', 'firstName lastName email')
      .populate('ratedEntity')
      .sort({ createdAt: -1 });
    
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rating by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id)
      .populate('rater', 'firstName lastName email')
      .populate('ratedEntity');
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create rating
router.post('/', auth, async (req, res) => {
  try {
    const { ratedEntity, ratedEntityType, rating, comment } = req.body;
    
    // Check if user has already rated this entity
    const existingRating = await Rating.findOne({
      rater: req.user._id,
      ratedEntity,
      ratedEntityType
    });
    
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this item' });
    }
    
    const newRating = new Rating({
      rater: req.user._id,
      ratedEntity,
      ratedEntityType,
      rating,
      comment
    });
    
    await newRating.save();
    
    const populatedRating = await Rating.findById(newRating._id)
      .populate('rater', 'firstName lastName email')
      .populate('ratedEntity');
    
    res.status(201).json(populatedRating);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update rating
router.put('/:id', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user owns this rating
    if (rating.rater.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }
    
    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('rater', 'firstName lastName email')
    .populate('ratedEntity');
    
    res.json(updatedRating);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete rating
router.delete('/:id', auth, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Check if user owns this rating or is admin
    if (rating.rater.toString() !== req.user._id.toString() && req.user.role !== 'program_leader') {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }
    
    await Rating.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get average rating for an entity
router.get('/average/:entityType/:entityId', auth, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const ratings = await Rating.aggregate([
      {
        $match: {
          ratedEntity: entityId,
          ratedEntityType: entityType
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    
    if (ratings.length === 0) {
      return res.json({ averageRating: 0, totalRatings: 0 });
    }
    
    res.json(ratings[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;