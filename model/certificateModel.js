const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    tutorName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
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
