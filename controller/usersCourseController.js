const Course = require("../model/courseModel");
const Purchase = require("../model/purchaseModel");

const getUsersByTutorCourses = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId) {
      return res.status(400).json({ message: "Tutor ID is required." });
    }

    const courses = await Course.find({ tutor: tutorId }).select("_id");

    if (!courses.length) {
      return res
        .status(404)
        .json({ message: "No courses found for this tutor." });
    }

    const courseIds = courses.map((course) => course._id);

    // Find all purchases that include these courses
    const purchases = await Purchase.find({
      "items.courseId": { $in: courseIds },
    }).populate("userId", "name email"); // Populate user details (customize fields as needed)

    if (!purchases.length) {
      return res
        .status(404)
        .json({ message: "No users have purchased these courses." });
    }

    // Extract unique users from the purchases
    const uniqueUsers = Array.from(
      new Set(purchases.map((purchase) => purchase.userId._id.toString()))
    ).map((userId) => {
      const user = purchases.find(
        (p) => p.userId._id.toString() === userId
      ).userId;
      return { id: user._id, name: user.name, email: user.email };
    });

    return res.status(200).json({ users: uniqueUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports = { getUsersByTutorCourses };
