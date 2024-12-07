const Course = require("../model/courseModel");
const Purchase = require("../model/purchaseModel");

const getUsersByTutorCourses = async (req, res) => {
  try {
    const { tutorId } = req.params;

    console.log('Received tutorId:', tutorId);

    if (!tutorId) {
      return res.status(400).json({ message: "Tutor ID is required." });
    }

    const courses = await Course.find({ tutor: tutorId }).select("_id");
    console.log('Found courses:', courses);

    if (!courses.length) {
      return res
        .status(404)
        .json({ message: "No courses found for this tutor." });
    }

    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      "items.courseId": { $in: courseIds },
    }).populate("userId", "name email");

    console.log('Found purchases:', purchases);

    if (!purchases.length) {
      return res
        .status(404)
        .json({ message: "No users have purchased these courses." });
    }

    const uniqueUsers = Array.from(
      new Set(purchases.map((purchase) => purchase.userId._id.toString()))
    ).map((userId) => {
      const user = purchases.find(
        (p) => p.userId._id.toString() === userId
      ).userId;
      return { id: user._id, name: user.name, email: user.email };
    });

    console.log('Unique users:', uniqueUsers);

    return res.status(200).json({ users: uniqueUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message,
      stack: error.stack 
    });
  }
};

const getTutorsByUserBuyedCourse = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is available in the request after authentication
    console.log(
      "..................",userId
    )

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const purchases = await Purchase.find({ userId }).select("items");

    if (!purchases.length) {
      return res.status(404).json({ message: "No purchases found for this user." });
    }

    const courseIds = purchases.flatMap(purchase => 
      purchase.items.map(item => item.courseId)
    );

    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("tutor", "name email _id");

    if (!courses.length) {
      return res.status(404).json({ message: "No courses found for the purchased items." });
    }

    const uniqueTutors = Array.from(
      new Set(courses.map(course => course.tutor._id.toString()))
    ).map(tutorId => {
      const tutor = courses.find(c => c.tutor._id.toString() === tutorId).tutor;
      return { 
        id: tutor._id, 
        name: tutor.name, 
        email: tutor.email,
        courses: courses
          .filter(c => c.tutor._id.toString() === tutorId)
          .map(c => ({ id: c._id, title: c.coursetitle }))
      };
    });

    return res.status(200).json({ tutors: uniqueTutors });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


module.exports = { getUsersByTutorCourses,getTutorsByUserBuyedCourse };
