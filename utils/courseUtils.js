const Course = require('../model/courseModel');

async function checkAndUpdateCourseVisibility(courseId) {
  const course = await Course.findById(courseId);
  
  if (!course) {
    console.error(`Course not found with id: ${courseId}`);
    return;
  }

  const shouldHideCourse = 
    (course.totalStudents > 10 && course.reportedCount > 0.4 * course.totalStudents) || 
    (course.totalStudents <= 10 && course.reportedCount >= 4);

  if (shouldHideCourse && course.isVisible) {
    course.isVisible = false;
    await course.save();
    console.log(`Course ${courseId} has been hidden due to high report count.`);
  } else if (!shouldHideCourse && !course.isVisible) {
    course.isVisible = true;
    await course.save();
    console.log(`Course ${courseId} has been made visible again.`);
  }
}

module.exports = { checkAndUpdateCourseVisibility };

