const Quiz = require('../model/quizModel');
const Course = require('../model/courseModel');
const UserQuizResult = require('../model/UserQuizResult');
const mongoose = require('mongoose');
const Certificate = require('../model/certificateModel');
const User = require("../model/userModel");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');


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
    const { userId, tutorId, courseName, quizScorePercentage } = req.body;

    if (!userId || !tutorId || !courseName || quizScorePercentage == null) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (quizScorePercentage < 0 || quizScorePercentage > 100) {
      return res.status(400).json({ message: "Quiz score percentage must be between 0 and 100." });
    }

    const user = await User.findById(userId);
    const tutor = await User.findById(tutorId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found." });
    }

    const newCertificate = new Certificate({
      userId,
      tutorId,
      courseName,
      quizScorePercentage,
    });

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

const checkCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "User ID and Course ID are required." });
    }

    const certificate = await Certificate.findOne({ userId, courseId });

    if (certificate) {
      return res.status(200).json({ exists: true, certificate });
    }

    res.status(200).json({ exists: false });
  } catch (error) {
    console.error("Error checking certificate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const submitQuizResult = async (req, res) => {
  try {
    const { userId, tutorId, courseId, quizId, questionResults } = req.body;

    if (!userId || !tutorId || !courseId || !quizId || !Array.isArray(questionResults)) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const totalQuestions = quiz.questions.length;
    let totalMarks = 0;


    const processedResults = questionResults.map((result) => {
      const question = quiz.questions.find((q) => q._id.toString() === result.questionId);

      if (!question) {
        throw new Error(`Invalid question ID: ${result.questionId}`);
      }

      const isCorrect = result.userAnswer === question.correctAnswer;
      if (isCorrect) totalMarks++;

      return {
        questionId: result.questionId,
        userAnswer: result.userAnswer || null, 
        isCorrect,
      };
    });

    const percentageScore = (totalMarks / totalQuestions) * 100;

    // Save quiz result
    const newQuizResult = new UserQuizResult({
      userId,
      courseId,
      tutorId,
      quizId,
      questionResults: processedResults,
      totalMarks,
      totalQuestions,
      percentageScore,
    });

    await newQuizResult.save();

    let certificateData = null;
    if (percentageScore >= 90) {
      const course = await Course.findById(courseId).populate("tutor", "name");
      const user = await User.findById(userId);

      if (course && user) {
        const newCertificate = new Certificate({
          userId,
          tutorId,
          courseId,
          userName: user.name,
          tutorName: course.tutor?.name || "Unknown Tutor",
          courseName: course.coursetitle || "Course",
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

const getUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;

    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'coursetitle')
      .populate('tutorId', 'name')
      .sort({ issuedDate: -1 });

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ message: "No certificates found for this user." });
    }

    res.status(200).json({ certificates });
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  getQuiz,addQuiz,submitQuizResult,issueCertificate,checkCertificate ,getUserCertificates
};

