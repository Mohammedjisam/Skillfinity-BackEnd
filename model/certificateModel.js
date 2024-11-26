const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Reference to the User model
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Reference to the User model (assuming tutors are also stored in the User collection)
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'courses', // Reference to the Courses model
      required: true,
    },
    quizScorePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model('Certificate', CertificateSchema);

module.exports = Certificate;
