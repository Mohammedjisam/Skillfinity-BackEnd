const Quiz = require('../model/quizModel');
const Course = require('../model/courseModel');

const addQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { questions } = req.body;

    // Validate input
    if (!courseId || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Course ID and questions are required." });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Create the quiz
    const newQuiz = new Quiz({
      courseId,
      questions,
    });

    await newQuiz.save();

    const courseData = await Course.findById(courseId);
    if (!courseData) {
        return res.status(404).json({ message: "Course not found" });
      }
      courseData.quizzes.push(newQuiz._id);
      await courseData.save();


    res.status(201).json({ message: "Quiz added successfully.", quiz: newQuiz });
  } catch (error) {
    console.error("Error adding quiz:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
    addQuiz
};
