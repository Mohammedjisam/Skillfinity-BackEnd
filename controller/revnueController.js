const Course = require('../model/courseModel');
const User = require('../model/userModel');
const Purchase = require('../model/purchaseModel');
const moment = require('moment');

const getTutorRevenue = async (req, res) => {
  try {
    const { tutorId } = req.params;
    console.log(tutorId,"/........................")

    if (!tutorId) {
      return res.status(400).json({ success: false, message: "Missing tutorId parameter" });
    }

    // Find all courses by this tutor
    const tutorCourses = await Course.find({ tutor: tutorId });

    if (tutorCourses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          revenue: [],
          totalRevenue: 0,
          totalCourses: 0,
          totalStudents: 0,
          totalOrders: 0
        }
      });
    }

    const courseIds = tutorCourses.map(course => course._id);

    const revenueData = await Purchase.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.courseId': { $in: courseIds }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'items.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$courseDetails.price' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          _id: 0
        }
      }
    ]);

    const totalStats = await Purchase.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.courseId': { $in: courseIds }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'items.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$courseDetails.price' },
          totalOrders: { $sum: 1 },
          uniqueStudents: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          totalStudents: { $size: '$uniqueStudents' }
        }
      }
    ]);

    const stats = totalStats[0] || { totalRevenue: 0, totalOrders: 0, totalStudents: 0 };

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueData,
        totalRevenue: stats.totalRevenue,
        totalCourses: tutorCourses.length,
        totalStudents: stats.totalStudents,
        totalOrders: stats.totalOrders
      }
    });

  } catch (error) {
    console.error('Error in getTutorRevenue:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching revenue details',
      error: error.message
    });
  }
};


const getAdminRevenue = async (req, res) => {
  try {
    // Revenue data aggregation
    const revenueData = await Purchase.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'courses',
          localField: 'items.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$courseDetails.price' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          _id: 0
        }
      }
    ]);


    const overallStats = await Purchase.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'courses',
          localField: 'items.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$courseDetails.price' },
          totalOrders: { $sum: 1 },
          uniqueStudents: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          totalStudents: { $size: '$uniqueStudents' }
        }
      }
    ]);

    // Get total courses
    const totalCourses = await Course.countDocuments();

    // Get total tutors
    const totalTutors = await User.countDocuments({ role: 'tutor' });

    // Get recent orders
    const recentOrders = await Purchase.find()
      .populate('userId', 'name email')
      .populate('items.courseId', 'coursetitle price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Prepare the response
    const stats = overallStats[0] || { totalRevenue: 0, totalOrders: 0, totalStudents: 0 };
    
    res.status(200).json({
      success: true,
      data: {
        revenue: revenueData,
        totalRevenue: stats.totalRevenue,
        totalCourses,
        totalStudents: stats.totalStudents,
        totalTutors,
        totalOrders: stats.totalOrders,
        recentOrders
      }
    });

  } catch (error) {
    console.error('Error in getAdminRevenue:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching revenue details',
      error: error.message
    });
  }
};

module.exports = {
  getTutorRevenue,getAdminRevenue
};
