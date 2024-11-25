const mongoose = require('mongoose');

const UserQuizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true, // Index for faster lookup
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'courses',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'quizzes',
      required: true,
      index: true, // Index for faster lookup
    },
    questionResults: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        userAnswer: {
          type: String,
          required: [true, 'User answer is required.'],
          maxlength: [500, 'User answer cannot exceed 500 characters.'], // Prevent overly long answers
        },
      },
    ],
    totalMarks: {
      type: Number,
      required: true,
      min: [0, 'Total marks cannot be negative.'],
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: [1, 'Total questions must be at least 1.'], // Validate non-zero quizzes
    },
    percentageScore: {
      type: Number,
      required: true,
      min: [0, 'Percentage score cannot be less than 0.'],
      max: [100, 'Percentage score cannot exceed 100.'],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Add compound index for unique user quiz attempts (if necessary)
UserQuizResultSchema.index({ userId: 1, quizId: 1 }, { unique: true });

const UserQuizResult = mongoose.model('UserQuizResult', UserQuizResultSchema);
module.exports = UserQuizResult;
