const Course = require("../model/courseModel");
const Cart = require("../model/cartModel");
const Lesson = require("../model/lessonModel");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const Purchase = require("../model/purchaseModel");
const Report = require('../model/reportModel');

const viewAllCourse = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("tutor")
      .populate("lessons")
      .populate("category");
    res.status(200).json({ courses });
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
    console.log("dvidnvij", courseId);
    const { userId } = req.body;

    console.log("jvifjbijbibjububu", userId);

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
    console.log("In cart count----------");
    const { userId } = req.params;
    console.log("User  ID received:", userId);

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log("Cart not found for user ID:", userId);
      return res.status(200).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const totalItems = cart.items.length;
    console.log("Total items in cart:", totalItems);

    res.status(200).json({ totalItems });
  } catch (error) {
    console.error("Error in cartCount:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCart = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("jvifjbijbibjububu", userId);

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.courseId",
      model: "courses",
      select: "coursetitle thumbnail price",
    });
    // console.log("carttt_______>", cart);

    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error in viewCart:", error);
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
    console.log("categoryId received:", categoryId);

    const category = await Category.findById(categoryId).populate({
      path: "courses",
      model: "courses",
      select: "coursetitle price thumbnail difficulty tutor",
      populate: {
        path: "tutor",
        model: "user",
        select: "name profileImage",
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    console.log("Courses with tutors fetched:", category.courses);
    res.status(200).json({ courses: category.courses });
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

    const tutor = await User.findById(tutorId).select(
      "name profileImage email role"
    );
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const courses = await Course.find({ tutor: tutorId })
      .populate({
        path: "category",
        model: "categories",
        select: "title",
      })
      .select("coursetitle thumbnail price category");

    res.status(200).json({
      tutor,
      courses,
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
    console.log("---------------------")
    const { userId, courseIds } = req.body;

    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate('tutor', 'name')
      .select('coursetitle price thumbnail lessons difficulty');
    
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    const formattedCourses = courses.map(course => ({
      _id: course._id,
      coursetitle: course.coursetitle,
      price: course.price,
      thumbnail: course.thumbnail,
      tutor: course.tutor,
      lessons: course.lessons.map(lesson => ({
        title: lesson.title,
        duration: lesson.duration,
      })),
    }));

    const totalPrice = formattedCourses.reduce((total, course) => total + course.price, 0);

    res.status(200).json({
      courses: formattedCourses,
      totalPrice,
    });
  } catch (error) {
    console.error("Error in buyAllCourses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const purchaseCourse = async (req, res) => {
  try {
    const { userId, courseIds } = req.body;

    if (!userId || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: "User ID and course IDs are required" });
    }

    // Create a new purchase record
    const purchase = new Purchase({
      userId,
      items: courseIds.map((courseId) => ({ courseId })),
      purchaseDate: new Date(),
    });

    await purchase.save();

    res.status(200).json({ message: "Purchase recorded successfully" });
  } catch (error) {
    console.error("Error saving purchase:", error);
    res.status(500).json({ error: "Failed to record purchase" });
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

    // Fetch lessons that belong to the specified course
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
    console.log("Fetching courses for user:", userId);

    // Find all purchases by the user
    const purchases = await Purchase.find({ userId }).populate({
      path: "items.courseId",
      model: "courses",
      select: "coursetitle thumbnail price category tutor difficulty",
      populate: [
        { path: "tutor", model: "user", select: "name profileImage" },
        { path: "category", model: "categories", select: "title" },
      ],
    });

    // Extract purchased courses
    const purchasedCourses = purchases.flatMap((purchase) =>
      purchase.items.map((item) => item.courseId)
    );

    console.log(`Found ${purchasedCourses.length} purchased courses for user ${userId}`);
    res.status(200).json({ purchasedCourses });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;

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
      .sort({ purchaseDate: -1 });

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

    res.status(200).json({ orderHistory });
  } catch (error) {
    console.error("Error fetching user order history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const reportCourse = async (req, res) => {
  try {
    const { userId, courseId, reason, comment } = req.body;

    // Verify that the user has purchased the course
    const purchase = await Purchase.findOne({ userId, "items.courseId": courseId });
    if (!purchase) {
      return res.status(403).json({ message: "You can only report courses you have purchased." });
    }

    // Retrieve the course to get the tutor ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Create a new report
    const report = new Report({
      userId,
      courseId,
      tutorId: course.tutor, // Assuming the tutor is stored in the Course model
      reason,
      comment,
    });

    const savedReport = await report.save();

    // Increment the reported count for the course
    course.reportedCount += 1;
    await course.save();

    res.status(201).json({ message: "Report submitted successfully.", report: savedReport });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {viewAllCourse,viewCourse,addCart,viewCourseAdmin,viewCart,removeCart,viewLessons,viewAllCategory,viewCategory,viewAllTutors,viewTutor,toggleCourseVisibility,viewMyCoursesAsTutor,cartCount,buyCourse,buyAllCourses,purchaseCourse,checkPurchaseStatus,getPurchasedCourses,viewLessonsByCourse,getBuyedCourses,getUserOrderHistory,reportCourse};
