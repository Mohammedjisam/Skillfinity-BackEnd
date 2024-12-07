const Course = require("../model/courseModel");
const Cart = require("../model/cartModel");
const Lesson = require("../model/lessonModel");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const Purchase = require("../model/purchaseModel");
const Report = require('../model/reportModel');
const Wishlist = require('../model/wishlistModel')
const UserQuizResult = require("../model/UserQuizResult");
const { checkAndUpdateCourseVisibility } = require('../utils/courseUtils');

const viewAllCourse = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get user's purchased courses
    let purchasedCourseIds = [];
    if (userId) {
      const purchases = await Purchase.find({ userId });
      purchasedCourseIds = purchases.flatMap(purchase => 
        purchase.items.map(item => item.courseId.toString())
      );
    }

    // Count total visible courses excluding purchased ones
    const totalCourses = await Course.countDocuments({
      isVisible: true,
      _id: { $nin: purchasedCourseIds }
    });

    const totalPages = Math.ceil(totalCourses / limit);

    // Fetch courses
    const courses = await Course.find({
      isVisible: true,
      _id: { $nin: purchasedCourseIds }
    })
      .populate("tutor", "name profileImage")
      .populate("lessons")
      .populate("category", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      courses,
      currentPage: page,
      totalPages,
      totalCourses,
    });
  } catch (error) {
    console.error("Error in viewAllCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewAllCourseAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const searchTerm = req.query.search || '';
    const categoryFilter = req.query.category || 'All';
    
    // Build the filter query
    let filter = {};
    
    // Add search filter
    if (searchTerm) {
      filter.$or = [
        { coursetitle: { $regex: searchTerm, $options: 'i' } },
        { 'tutor.name': { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Add category filter
    if (categoryFilter !== 'All') {
      const category = await Category.findOne({ title: categoryFilter });
      if (category) {
        filter.category = category._id;
      }
    }

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);
    const skip = (page - 1) * limit;

    // Get paginated and filtered courses
    const courses = await Course.find(filter)
      .populate("tutor", "name email")
      .populate("lessons")
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get all categories for filter options
    const categories = await Category.distinct('title');

    res.status(200).json({
      courses,
      currentPage: page,
      totalPages,
      totalCourses,
      categories: ['All', ...categories]
    });
  } catch (error) {
    console.error("Error in viewAllCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const viewCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.params.userId;
    console.log("courseId received:", courseId);

    const course = await Course.findById(courseId)
      .populate("tutor")
      .populate("lessons")
      .populate("category").lean()

      const isUserReported = await Report.findOne({ userId, courseId }) 

      course.isReported = isUserReported ? true : false
      

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log("Course data:", course);
    res.status(200).json({ course });
  } catch (error) {
    console.error("Error in viewCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCourseAdmin = async (req, res) => { 
  try {
    const courseId = req.params.courseId;
    const userId = req.params.userId;
    console.log("courseId received:", courseId);

    // Fetch the course from the database
    const course = await Course.findById(courseId)
      .populate("tutor")
      .populate("lessons")
      .populate("category")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const isUserReported = await Report.findOne({ userId, courseId });
    course.isReported = !!isUserReported;

    console.log("Course data:", course);
    res.status(200).json({ course });
  } catch (error) {
    console.error("Error in viewCourseAdmin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





const toggleCourseVisibility = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    course.isVisible = !course.isVisible;
    await course.save();
    res.status(200).json({ message: "Course visibility updated", course });
  } catch (error) {
    res.status(500).json({
      message: "Error updating course visibility",
      error: error.message,
    });
  }
};



const addCart = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    console.log("dvidnvij==============>", courseId);
    const { userId } = req.body;

    console.log("jvifjbijbibjububu===============>", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    console.log("User ID:", userId, "Course ID:", courseId);

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ courseId, price: course.price }],
        totalCartPrice: course.price,
      });
    } else {
      const itemIndex = cart.items.findIndex((item) =>
        item.courseId.equals(courseId)
      );
      if (itemIndex === -1) {
        cart.items.push({ courseId, price: course.price });
      } else {
        cart.items[itemIndex].price = course.price;
      }

      cart.totalCartPrice = cart.items.reduce(
        (total, item) => total + item.price,
        0
      );
    }

    await cart.save();
    res
      .status(200)
      .json({ message: "Course added to cart successfully!", cart });
  } catch (error) {
    console.error("Error in addCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cartCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    const totalItems = cart ? cart.items.length : 0;
    res.status(200).json({ totalItems });
  } catch (error) {
    console.error("Error in cartCount:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.courseId",
      select: "coursetitle thumbnail price difficulty lessons category tutor",
      populate: [
        { path: "category", select: "title" },
        { path: "tutor", select: "name" },
        { path: "lessons", select: "_id" },
      ],
    });

    // Fetch the user's purchased courses
    const purchases = await Purchase.find({ userId });
    const purchasedCourseIds = purchases.flatMap(purchase => 
      purchase.items.map(item => item.courseId.toString())
    );

    if (!cart) {
      return res.status(200).json({
        cart: { userId, items: [] },
        message: "Your cart is waiting to be filled with amazing courses!",
        success: true,
      });
    }

    // Filter out purchased courses from the cart
    const filteredItems = cart.items.filter(item => 
      !purchasedCourseIds.includes(item.courseId._id.toString())
    );

    const enrichedCart = {
      ...cart.toObject(),
      items: filteredItems.map((item) => {
        if (!item.courseId) return null;
        return {
          ...item.toObject(),
          courseId: {
            ...item.courseId.toObject(),
            totalLessonsCount: item.courseId.lessons ? item.courseId.lessons.length : 0,
            categoryName: item.courseId.category ? item.courseId.category.title : 'Uncategorized',
            tutorName: item.courseId.tutor ? item.courseId.tutor.name : 'Unknown Tutor',
          },
        };
      }).filter(Boolean),
    };

    res.status(200).json({ cart: enrichedCart, success: true });
  } catch (error) {
    console.error("Error in viewCart:", error);
    res.status(500).json({
      message: "Unable to fetch cart at this time. Please try again later.",
      error: error.message,
      success: false,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeCart = async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    console.log("jvifjbijbibjububu", userId);

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) =>
      item.courseId.equals(courseId)
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Course not found in cart" });
    }

    cart.items.splice(itemIndex, 1);

    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res
        .status(200)
        .json({ message: "Cart is empty and has been removed" });
    }

    cart.totalCartPrice = cart.items.reduce(
      (total, item) => total + item.price,
      0
    );

    await cart.save();

    res.status(200).json({ message: "Course removed from cart", cart });
  } catch (error) {
    console.error("Error in removeCart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const checkPurchases = async (req, res) => {
  try {
    const { userId } = req.params;
    const purchases = await Purchase.find({ userId });
    const purchasedCourseIds = purchases.flatMap(purchase => 
      purchase.items.map(item => item.courseId.toString())
    );
    res.status(200).json({ purchasedCourseIds });
  } catch (error) {
    console.error("Error checking purchases:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewAllCategory = async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: "courses",
      model: "courses",
      select: "coursetitle price thumbnail",
    });

    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error in viewAllCategory:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    console.log("categoryId received:", categoryId);

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const totalCourses = await Category.aggregate([
      { $match: { _id: category._id } },
      { $project: { courseCount: { $size: "$courses" } } }
    ]);

    const totalCount = totalCourses[0].courseCount;
    const totalPages = Math.ceil(totalCount / limit);

    const populatedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        model: "courses",
        select: "coursetitle price thumbnail difficulty tutor isVisible",
        options: { skip: skip, limit: limit },
        populate: {
          path: "tutor",
          model: "user",
          select: "name profileImage",
        },
      });

    const visibleCourses = populatedCategory.courses.filter(course => course.isVisible !== false);

    console.log("Courses with tutors fetched:", visibleCourses);
    res.status(200).json({ 
      courses: visibleCourses,
      currentPage: page,
      totalPages: totalPages,
      totalCourses: totalCount
    });
  } catch (error) {
    console.error("Error in viewCategory:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const viewAllTutors = async (req, res) => {
  try {
    const tutors = await User.find({ role: "tutor" });

    if (!tutors || tutors.length === 0) {
      return res.status(404).json({ message: "No tutors found" });
    }

    res.status(200).json({ tutors });
  } catch (error) {
    console.error("Error in viewAllTutors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const viewTutor = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const userId = req.query.userId; // Get userId from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const tutor = await User.findById(tutorId).select(
      "name profileImage email role bio"
    );
    
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Get user's purchased courses
    let purchasedCourseIds = [];
    if (userId) {
      const purchases = await Purchase.find({ userId });
      purchasedCourseIds = purchases.flatMap(purchase => 
        purchase.items.map(item => item.courseId.toString())
      );
    }

    // Count total visible courses by this tutor, excluding purchased ones
    const totalCourses = await Course.countDocuments({ 
      tutor: tutorId,
      isVisible: true,
      _id: { $nin: purchasedCourseIds }
    });

    // Fetch courses
    const courses = await Course.find({ 
      tutor: tutorId, 
      isVisible: true,
      _id: { $nin: purchasedCourseIds }
    })
      .populate({
        path: "category",
        model: "categories",
        select: "title",
      })
      .select("coursetitle thumbnail price category createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCourses / limit);

    res.status(200).json({
      tutor,
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
        coursesPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error in viewTutor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewLessons = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).populate({
      path: "lessons",
      model: "lessons",
      select: "lessontitle description Video pdfnotes duration",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ lessons: course.lessons });
  } catch (error) {
    console.error("Error in viewLessons:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewMyCoursesAsTutor = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user || user.role !== "tutor") {
      return res
        .status(403)
        .json({ message: "Access denied: Only tutors can view their courses" });
    }

    const courses = await Course.find({ tutor: userId })
      .populate({
        path: "category",
        model: "categories",
        select: "title",
      })
      .select("coursetitle price thumbnail category");

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this tutor" });
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error in viewMyCoursesAsTutor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const buyCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("Received Course ID in buyCourse:", courseId);

    const course = await Course.findById(courseId)
      .populate('tutor', 'name') 
      .select('coursetitle price thumbnail lessons difficulty');
    if (!course) {
      console.error("Course not found for ID:", courseId);
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      course: {
        coursetitle: course.coursetitle,
        price: course.price,
        thumbnail: course.thumbnail,
        tutor: course.tutor,
        lessons: course.lessons.map(lesson => ({
          title: lesson.title,
          duration: lesson.duration,
        })),
      },
    });
  } catch (error) {
    console.error("Error in buyCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const buyAllCourses = async (req, res) => {
  try {
    const { userId, courseIds, totalAmount } = req.body;

    // Process the purchase (you may want to add payment integration here)
    const purchase = new Purchase({
      userId,
      courses: courseIds,
      totalAmount,
    });
    await purchase.save();

    // Add courses to user's purchased courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedCourses: { $each: courseIds } },
    });

    // Clear the user's cart
    await Cart.findOneAndDelete({ userId });

    res.status(200).json({ success: true, message: "Courses purchased successfully" });
  } catch (error) {
    console.error("Error in buyAllCourses:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const purchaseCourse = async (req, res) => {
  try {
    const { userId, courseIds } = req.body;

    // Create a new purchase record
    const purchase = new Purchase({
      userId,
      courses: courseIds,
      purchaseDate: new Date(),
    });
    await purchase.save();

    // Add courses to user's purchased courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedCourses: { $each: courseIds } },
    });

    // Clear the user's cart
    await Cart.findOneAndDelete({ userId });

    res.status(200).json({ success: true, message: "Courses purchased successfully" });
  } catch (error) {
    console.error("Error in purchaseCourse:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const checkPurchaseStatus = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    const purchase = await Purchase.findOne({
      userId,
      'items.courseId': courseId
    });

    res.status(200).json({
      isPurchased: !!purchase
    });
  } catch (error) {
    console.error("Error checking purchase status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPurchasedCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    const purchases = await Purchase.find({ userId });
    const purchasedCourseIds = purchases.flatMap(purchase => 
      purchase.items.map(item => item.courseId.toString())
    );

    res.status(200).json({ purchasedCourses: purchasedCourseIds });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("ithaanu :",courseId)

    const lessons = await Lesson.find({ course: courseId })
      .populate('course', 'coursetitle')
      .populate('tutor', 'name');

      console.log("supperjgbiiog========>",lessons)

    if (!lessons || lessons.length === 0) {
      return res.status(404).json({ message: 'No lessons found for this course' });
    }

    res.status(200).json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons by course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBuyedCourses = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9; // Changed to 9 for a 3x3 grid
    const skip = (page - 1) * limit;

    console.log(`Fetching courses for user: ${userId}, page: ${page}, limit: ${limit}`);

    const totalCount = await Purchase.countDocuments({ userId });

    const purchases = await Purchase.find({ userId })
      .populate({
        path: "items.courseId",
        model: "courses",
        select: "coursetitle thumbnail price category tutor difficulty",
        populate: [
          { path: "tutor", model: "user", select: "name profileImage" },
          { path: "category", model: "categories", select: "title" },
        ],
      })
      .skip(skip)
      .limit(limit);

    const purchasedCourses = purchases.flatMap((purchase) =>
      purchase.items.map((item) => item.courseId)
    );

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`Found ${purchasedCourses.length} purchased courses for user ${userId} on page ${page}`);
    console.log(`Total pages: ${totalPages}, Total courses: ${totalCount}`);

    res.status(200).json({
      purchasedCourses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses: totalCount,
        coursesPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // 5 orders per page
    const skip = (page - 1) * limit;

    const totalOrders = await Purchase.countDocuments({ userId });
    const totalPages = Math.ceil(totalOrders / limit);

    const purchases = await Purchase.find({ userId })
      .populate({
        path: "items.courseId",
        model: "courses",
        select: "coursetitle tutor price",
        populate: {
          path: "tutor",
          model: "user",
          select: "name"
        }
      })
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    const orderHistory = purchases.map(purchase => ({
      orderId: purchase._id,
      purchaseDate: purchase.purchaseDate,
      items: purchase.items.map(item => ({
        courseName: item.courseId.coursetitle,
        tutorName: item.courseId.tutor.name,
        price: item.courseId.price
      })),
      totalAmount: purchase.items.reduce((total, item) => total + item.courseId.price, 0)
    }));

    res.status(200).json({
      orderHistory,
      currentPage: page,
      totalPages,
      totalOrders
    });
  } catch (error) {
    console.error("Error fetching user order history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const reportCourse = async (req, res) => {
  try {
    const { userId, courseId, reason, comment } = req.body;

    const purchase = await Purchase.findOne({ userId, "items.courseId": courseId });
    if (!purchase) {
      return res.status(403).json({ message: "You can only report courses you have purchased." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const report = new Report({
      userId,
      courseId,
      tutorId: course.tutor, 
      reason,
      comment,
    });

    const savedReport = await report.save();
    course.reportedCount += 1;
    await course.save();

      const shouldHideCourse = 
      (course.totalStudents > 10 && course.reportedCount > 0.4 * course.totalStudents) || 
      (course.totalStudents <= 10 && course.reportedCount >= 6);
      console.log(shouldHideCourse,"vjdsnjfv----------------------------")
    if (shouldHideCourse && course.isVisible) {
      console.log("iniside blocking-------------------")
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId, 
        { isVisible: false },
        { new: true }
      );
      course.isVisible = updatedCourse.isVisible; 
      console.log(`Course ${courseId} has been hidden due to high report count.`);
    }


    res.status(201).json({ message: "Report submitted successfully.", report: savedReport });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    console.log("Adding to wishlist - Course ID:", courseId, "User ID:", userId);

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [courseId] });
    } else {
      if (!wishlist.items.includes(courseId)) {
        wishlist.items.push(courseId);
      } else {
        return res.status(200).json({ message: "Course already in wishlist" });
      }
    }

    await wishlist.save();
    console.log("Wishlist updated successfully");
    res.status(200).json({ message: "Course added to wishlist successfully!", wishlist });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Items per page
    const skip = (page - 1) * limit;

    console.log(`Viewing wishlist for User ID: ${userId}, Page: ${page}`);

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist || wishlist.items.length === 0) {
      console.log("Wishlist is empty for User ID:", userId);
      return res.status(200).json({ 
        wishlist: [],
        message: "Your wishlist is empty.",
        status: "empty",
        totalPages: 0,
        currentPage: page
      });
    }

    const totalItems = wishlist.items.length;
    const totalPages = Math.ceil(totalItems / limit);

    const paginatedItems = await Wishlist.findOne({ userId })
      .populate({
        path: "items",
        model: "courses",
        select: "coursetitle thumbnail price category",
        options: { skip, limit },
        populate: [
          {
            path: "tutor",
            model: "user",
            select: "name"
          },
          {
            path: "category",
            model: "categories",
            select: "title"
          }
        ]
      });

    const formattedWishlist = paginatedItems.items.map(course => ({
      id: course._id,
      coursetitle: course.coursetitle,
      thumbnail: course.thumbnail,
      price: course.price,
      tutorname: course.tutor ? course.tutor.name : 'Unknown',
      categoryname: course.category ? course.category.title : 'Uncategorized'
    }));

    console.log(`Wishlist page ${page} retrieved successfully for User ID: ${userId}`);
    res.status(200).json({ 
      wishlist: formattedWishlist,
      status: "success",
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Error in viewWishlist:", error);
    res.status(500).json({ 
      message: "We're having trouble fetching your wishlist. Please try again in a moment.",
      error: error.message,
      status: "error"
    });
  }
};


const removeFromWishlist = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    console.log("Removing from wishlist - Course ID:", courseId, "User ID:", userId);

    const result = await Wishlist.updateOne(
      { userId },
      { $pull: { items: courseId } }
    );

    if (result.modifiedCount === 0) {
      console.log("Course not found in wishlist or wishlist is empty");
      return res.status(404).json({ message: "Course not found in wishlist or wishlist is empty" });
    }

    console.log("Course removed from wishlist successfully");
    res.status(200).json({ message: "Course removed from wishlist successfully" });
  } catch (error) {
    console.error("Error in removeFromWishlist:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const checkWishlistStatus = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(200).json({ isInWishlist: false });
    }
    
    const isInWishlist = wishlist.items.includes(courseId);
    
    res.status(200).json({ isInWishlist });
  } catch (error) {
    console.error("Error in checkWishlistStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const getCourseCompletionCertificate = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    const purchase = await Purchase.findOne({ userId, "items.courseId": courseId });
    if (!purchase) {
      return res.status(403).json({ message: "You must purchase the course to receive a certificate." });
    }

    const latestQuizResult = await UserQuizResult.findOne({ userId, courseId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestQuizResult) {
      return res.status(404).json({ message: "No quiz results found for this course." });
    }

    const percentageScore = (latestQuizResult.totalMarks / latestQuizResult.totalQuestions) * 100;

    if (percentageScore < 90) {
      return res.status(403).json({ message: "You need to score at least 90% to receive a certificate." });
    }

    const course = await Course.findById(courseId).populate('tutor', 'name');
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ message: "Course or user not found." });
    }

    const certificateData = {
      studentName: user.name,
      courseName: course.coursetitle,
      tutorId: course.tutor._id, // Add this line to include the tutor ID
      tutorName: course.tutor.name,
      completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      score: percentageScore.toFixed(2)
    };

    res.status(200).json({ certificateData });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTutorData = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const tutor = await User.findById(tutorId).select('name email');
    
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found." });
    }

    res.status(200).json({ tutorData: tutor });
  } catch (error) {
    console.error("Error fetching tutor data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCourseReports = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Fetch the course details
    const course = await Course.findById(courseId).select('coursetitle');
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Fetch all reports for this course
    const reports = await Report.find({ courseId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Prepare the response data
    const reportData = {
      courseTitle: course.coursetitle,
      totalReports: reports.length,
      reports: reports.map(report => ({
        id: report._id,
        userName: report.userId.name,
        userEmail: report.userId.email,
        reason: report.reason,
        comment: report.comment,
        reportedAt: report.createdAt
      }))
    };

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error fetching course reports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {viewAllCourse,viewAllCourseAdmin,viewCourse,addCart,viewCourseAdmin,viewCart,clearCart,removeCart,viewLessons,viewAllCategory,viewCategory,viewAllTutors,viewTutor,toggleCourseVisibility,viewMyCoursesAsTutor,cartCount,buyCourse,buyAllCourses,reportCourse,purchaseCourse,checkPurchases,checkPurchaseStatus,getPurchasedCourses,viewLessonsByCourse,getBuyedCourses,getUserOrderHistory,reportCourse,addToWishlist,viewWishlist,checkWishlistStatus,removeFromWishlist,getCourseCompletionCertificate,viewCourseReports,getTutorData};
