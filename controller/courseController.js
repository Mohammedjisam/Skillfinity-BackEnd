const Course = require('../model/courseModel');
const Lesson = require('../model/lessonModel')
const Category= require('../model/categoryModel')


const addCourse = async (req, res) => {
  try {
    const { coursetitle, category, price, features, thumbnail, tutor, difficulty, courseStructure } = req.body;
    
    const categoryData = await Category.findById(category);
    if (!categoryData) {
      return res.status(404).send("Category not found");
    }

    const newCourse = new Course({
      coursetitle,
      category: categoryData._id,
      price,
      features,
      thumbnail,
      tutor,
      difficulty,
      courseStructure,
    });

    await newCourse.save();

    categoryData.courses.push(newCourse._id);
    categoryData.tutors.push(tutor);
    await categoryData.save();

    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    console.error("Error in addCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const addLesson = async (req, res) => {
  try {
    const lessonData = req.body;
    console.log("Received lesson data:", lessonData);

    
    const { title, duration, videoUrl, pdfUrl, course, tutor, description } = lessonData;
    
    if (!title || !duration || !course || !tutor) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const newLesson = new Lesson({
      lessontitle: title,
      duration,
      Video: videoUrl,
      pdfnotes: pdfUrl,
      course,
      tutor,
      description,
    });

    await newLesson.save();

    const courseData = await Course.findById(course);
    if (!courseData) {
      return res.status(404).json({ message: "Course not found" });
    }
    courseData.lessons.push(newLesson._id);

    await courseData.save();

    res.status(201).json({ message: "Lesson added successfully", lesson: newLesson });
  } catch (error) {
    console.error("Error in addLesson:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewCourse = async (req, res) => {
  try {
    const tutorId = req.params.id;
    console.log("gfshgvfsh",tutorId)
    const courses = await Course.find({ tutor: tutorId }).populate('category').populate('tutor');
    
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error in viewCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId,tutorId } = req.query; 

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.tutor.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this course" });
    }

    await Lesson.deleteMany({ course: courseId });

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewData = async (req, res) => {
  try {
    const  courseId  = req.params.id 
    const {tutorId} = req.body
    console.log("gfshgvfsh",tutorId)  

 
    const course = await Course.findOne({ _id: courseId, tutor: tutorId })
      .populate('category') 
      .populate('lessons')
      .populate('tutor', 'name email'); 
      console.log(course)

    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    res.status(200).json({ course });
  } catch (error) {
    console.error("Error in viewData:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editCourse = async (req, res) => {
  try {
    const courseId = req.params.id; 
    const { tutorId, coursetitle, price, features, courseStructure, thumbnail } = req.body;

    const course = await Course.findOne({ _id: courseId, tutor: tutorId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    if (coursetitle) course.coursetitle = coursetitle;
    if (price) course.price = price;
    if (features) course.features = features;
    if (courseStructure) course.courseStructure = courseStructure;
    if (thumbnail) course.thumbnail = thumbnail;

    await course.save();

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error in editCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const deleteLesson = async (req, res) => {
  try {
    const { lessonId,tutorId } = req.query; 
    console.log("lesson",lessonId)
    console.log("tutor",tutorId)
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findOne({ _id: lesson.course, tutor: tutorId });
    if (!course) {
      return res.status(403).json({ message: "Unauthorized to delete this lesson" });
    }

    course.lessons = course.lessons.filter(id => id.toString() !== lessonId);
    await course.save();

    await Lesson.findByIdAndDelete(lessonId);

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error in deleteLesson:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editLesson = async (req, res) => {
  try {
    const { lessonId,tutorId } = req.query; 
    const { title, duration, videoUrl, pdfUrl, description} = req.body; 
      console.log(tutorId);
      console.log("lessonId-->",lessonId);
      
    const lesson = await Lesson.findById(lessonId);
    console.log(lesson);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course = await Course.findOne({ _id: lesson.course, tutor: tutorId });
    if (!course) {
      return res.status(403).json({ message: 'Unauthorized to access or modify this lesson' });
    }

    if (title) lesson.lessontitle = title;
    if (duration) lesson.duration = duration;
    if (videoUrl) lesson.Video = videoUrl;
    if (pdfUrl) lesson.pdfnotes = pdfUrl;
    if (description) lesson.description = description;

    await lesson.save();

    res.status(200).json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    console.error('Error in editLesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { lessonId,tutorId } = req.body; 
    const { title, duration, videoUrl, pdfUrl, description} = req.body; 
      console.log(tutorId);
      console.log("lessonId-->",lessonId);
      
      
    
  
    const lesson = await Lesson.findById(lessonId);
    console.log(lesson);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course = await Course.findOne({ _id: lesson.course, tutor: tutorId });
    if (!course) {
      return res.status(403).json({ message: 'Unauthorized to access or modify this lesson' });
    }

    if (title) lesson.lessontitle = title;
    if (duration) lesson.duration = duration;
    if (videoUrl) lesson.Video = videoUrl;
    if (pdfUrl) lesson.pdfnotes = pdfUrl;
    if (description) lesson.description = description;

    await lesson.save();

    res.status(200).json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    console.error('Error in editLesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = { addCourse, addLesson, viewCourse, deleteCourse,viewData,editCourse ,deleteLesson,editLesson, updateLesson};