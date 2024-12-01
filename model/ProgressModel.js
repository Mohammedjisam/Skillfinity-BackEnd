const mongoose = require('mongoose');

const LessonProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'lessons',
    required: true
  },
  percentWatched: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalWatchTime: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  indexes: [
    { fields: { user: 1, course: 1, lesson: 1 }, unique: true }
  ]
});

const LessonProgress = mongoose.model('lesson_progress', LessonProgressSchema);
module.exports = LessonProgress;