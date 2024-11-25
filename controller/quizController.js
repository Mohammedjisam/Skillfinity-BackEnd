const Quiz = require('../model/quizModel');
const Course = require('../model/courseModel');
const UserQuizResult = require('../model/UserQuizResult');
const mongoose = require('mongoose');
const Certificate = require('../model/certificateModel');
const User = require("../model/userModel");

const addQuiz = async (req, res) => {
  console.log('addQuiz function called');
  console.log('Request body:', req.body);
  console.log('Course ID:', req.params.courseId);

  try {
    const { courseId } = req.params;
    const { questions } = req.body;

    if (!courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Course ID and valid questions array are required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const newQuiz = new Quiz({
      courseId,
      questions: questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    });

    await newQuiz.save();

    course.quizzes.push(newQuiz._id);
    await course.save();

    console.log('Quiz added successfully:', newQuiz);

    res.status(201).json({ message: "Quiz added successfully.", quiz: newQuiz });
  } catch (error) {
    console.error("Error adding quiz:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
    }

    // Find the quiz for the given course
    const quiz = await Quiz.findOne({ courseId }).select('questions');

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found for this course." });
    }

    res.status(200).json({ message: "Quiz retrieved successfully.", quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const issueCertificate = async (req, res) => {
  try {
    const { userName, tutorName, courseName, quizScorePercentage } = req.body;

    // Validate input
    if (!userName || !tutorName || !courseName || quizScorePercentage == null) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (quizScorePercentage < 0 || quizScorePercentage > 100) {
      return res.status(400).json({ message: "Quiz score percentage must be between 0 and 100." });
    }

    // Create a new certificate
    const newCertificate = new Certificate({
      userName,
      tutorName,
      courseName,
      quizScorePercentage,
    });

    // Save to database
    await newCertificate.save();

    res.status(201).json({
      message: "Certificate issued successfully.",
      certificate: newCertificate,
    });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const submitQuizResult = async (req, res) => {
  try {
    const { userId, courseId, quizId, questionResults } = req.body;

    if (!userId || !courseId || !quizId || !Array.isArray(questionResults) || questionResults.length === 0) {
      return res.status(400).json({ message: "Invalid input. Please provide all required fields." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const totalQuestions = quiz.questions.length;
    let totalMarks = 0;

    // Ensure all questions have valid IDs and user answers
    const processedResults = questionResults.map(result => {
      const question = quiz.questions.find(q => q._id.toString() === result.questionId);

      if (!question) {
        throw new Error(`Invalid question ID: ${result.questionId}`);
      }

      const isCorrect = result.userAnswer === question.correctAnswer;
      if (isCorrect) totalMarks++;

      return {
        questionId: result.questionId,
        userAnswer: result.userAnswer || null, // Default to null if no answer
        isCorrect,
      };
    });

    const percentageScore = (totalMarks / totalQuestions) * 100;

    const newQuizResult = new UserQuizResult({
      userId,
      courseId,
      quizId,
      questionResults: processedResults,
      totalMarks,
      totalQuestions,
      percentageScore,
    });

    await newQuizResult.save();

    let certificateData = null;
    if (percentageScore >= 90) {
      const course = await Course.findById(courseId).populate('tutor', 'name');
      const user = await User.findById(userId);

      if (course && user) {
        const newCertificate = new Certificate({
          userId,
          courseId,
          userName: user.name,
          tutorName: course.tutor.name,
          courseName: course.coursetitle,
          quizScorePercentage: percentageScore,
        });

        await newCertificate.save();
        certificateData = newCertificate;
      }
    }

    res.status(201).json({
      message: "Quiz result submitted successfully.",
      result: {
        totalMarks,
        totalQuestions,
        percentageScore,
        certificateData,
      },
    });

  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  getQuiz,addQuiz,submitQuizResult,submitQuizResult,issueCertificate
};

