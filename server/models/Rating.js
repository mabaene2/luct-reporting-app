const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'ratedEntityType',
    required: true
  },
  ratedEntityType: {
    type: String,
    enum: ['User', 'Course', 'Class', 'Report'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ratingSchema.index({ rater: 1, ratedEntity: 1, ratedEntityType: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);