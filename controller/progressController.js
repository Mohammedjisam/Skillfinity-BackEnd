const LessonProgress = require('../model/ProgressModel');
const Course = require('../model/courseModel');
const Lesson = require('../model/lessonModel');

const updateLessonProgress = async (req, res) => {
    try {
      const { userId, courseId, lessonId, progress } = req.body;
  
      // Validate incoming data
      if (!userId || !courseId || !lessonId || !progress) {
        return res.status(400).json({ 
          message: "Missing required fields",
          details: { userId, courseId, lessonId, progress }
        });
      }
  
      // Your existing logic to update progress
      // Make sure you're handling the progress object correctly
      const updatedProgress = await LessonProgress.findOneAndUpdate(
        { 
          user: userId, 
          course: courseId, 
          lesson: lessonId 
        },
        {
          $set: {
            percentWatched: progress.percentWatched,
            totalWatchTime: progress.totalWatchTime,
            isCompleted: progress.isCompleted
          }
        },
        { upsert: true, new: true }
      );
  
      res.status(200).json({ 
        message: "Lesson progress updated successfully",
        updatedProgress 
      });
    } catch (error) {
      console.error("Detailed error in updateLessonProgress:", error);
      res.status(500).json({ 
        message: "Error updating lesson progress",
        error: error.message 
      });
    }
  };

const getLessonProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Find all lesson progresses for the user in the specific course
    const lessonProgress = await LessonProgress.find({ 
      user: userId, 
      course: courseId 
    });

    // Get watched lessons (completed)
    const watchedLessons = lessonProgress
      .filter(progress => progress.isCompleted)
      .map(progress => ({ 
        lessonId: progress.lesson 
      }));

    res.status(200).json({ 
      lessonProgress,
      watchedLessons 
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Find all lesson progresses for the user in the specific course
    const lessonProgress = await LessonProgress.find({ 
      user: userId, 
      course: courseId 
    });

    // Calculate overall course progress
    const course = await Course.findById(courseId).populate('lessons');
    const totalLessons = course.lessons.length;
    const completedLessons = lessonProgress.filter(progress => progress.isCompleted).length;
    
    const courseProgressPercentage = Math.round((completedLessons / totalLessons) * 100);

    res.status(200).json({ 
      courseProgressPercentage,
      completedLessons,
      totalLessons,
      lessonProgress 
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports={
    getCourseProgress,
    updateLessonProgress,
    getLessonProgress
}