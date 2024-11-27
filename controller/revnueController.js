const Purchase = require('../model/purchaseModel');
const Course = require('../model/courseModel');
const moment = require('moment');

const getTutorRevenue = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId) {
      return res.status(400).json({ message: "Missing tutorId parameter" });
    }

    // Fetch all courses by the tutor
    const tutorCourses = await Course.find({ tutor: tutorId });

    if (!tutorCourses || tutorCourses.length === 0) {
      return res.status(404).json({ message: "No courses found for this tutor" });
    }

    const courseIds = tutorCourses.map(course => course._id);

    // Fetch all purchases for the tutor's courses
    const purchases = await Purchase.find({
      'items.courseId': { $in: courseIds },
    }).populate('items.courseId');

    // Calculate revenue data
    const revenueData = {};
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (courseIds.includes(item.courseId._id.toString())) {
          const purchaseDate = moment(purchase.purchaseDate).format('YYYY-MM-DD');
          revenueData[purchaseDate] = (revenueData[purchaseDate] || 0) + item.courseId.price;
        }
      });
    });

    const sortedRevenueData = Object.entries(revenueData)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate total revenue from total students and course price
    const totalRevenueFromStudents = tutorCourses.reduce((acc, course) => {
      return acc + course.totalStudents * course.price;
    }, 0);

    const totalCourses = tutorCourses.length;
    const totalStudents = tutorCourses.reduce((acc, course) => acc + course.totalStudents, 0);

    res.status(200).json({
      tutorId,
      revenue: sortedRevenueData,
      totalRevenue: totalRevenueFromStudents,
      totalCourses,
      totalStudents,
    });
  } catch (error) {
    console.error("Error in getTutorRevenue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTutorRevenue,
};

