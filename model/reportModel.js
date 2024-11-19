const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'courses',
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', 
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: false, 
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
);

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;
