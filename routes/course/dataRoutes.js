const express = require("express");
const dataRoute = express.Router();
const { viewAllCourse, viewCourse,viewCourseAdmin, addCart,cartCount,checkPurchaseStatus, viewCart,viewLessons,removeCart,viewAllCategory,viewCategory,viewAllTutors,viewTutor,toggleCourseVisibility,viewMyCoursesAsTutor,buyCourse,buyAllCourses,purchaseCourse ,getPurchasedCourses ,viewLessonsByCourse,getBuyedCourses,getUserOrderHistory,reportCourse} = require('../../controller/dataController');
const verifyUser = require('../../middleware/verifyUser')

dataRoute.get('/viewallcourse',verifyUser, viewAllCourse); 
dataRoute.get('/viewallcategory',verifyUser, viewAllCategory)
dataRoute.get('/viewcourse/:courseId/:userId',verifyUser, viewCourse);
dataRoute.get('/viewcourseadmin/:courseId', viewCourseAdmin);
dataRoute.get('/viewcategory/:categoryId',verifyUser, viewCategory);
dataRoute.post('/addcart/:courseId',verifyUser, addCart);
dataRoute.get('/viewlessons/:courseId',viewLessons)
dataRoute.post('/cart',verifyUser,viewCart);
dataRoute.post('/cartcount/:userId',cartCount)
dataRoute.delete('/removecart',verifyUser, removeCart);
dataRoute.get('/viewalltutors',verifyUser,viewAllTutors)
dataRoute.get('/viewtutor/:id',verifyUser,viewTutor)
dataRoute.put('/togglecoursevisibility/:courseId', toggleCourseVisibility);
dataRoute.get('/viewmycoursestutor', viewMyCoursesAsTutor);
dataRoute.post('/buycourse/:courseId', verifyUser,buyCourse);
dataRoute.post('/buyallcourses', buyAllCourses);
dataRoute.post("/purchase",verifyUser,purchaseCourse)
dataRoute.get('/checkpurchase/:userId/:courseId', verifyUser, checkPurchaseStatus);
dataRoute.get('/purchasedcourses/:userId', verifyUser, getPurchasedCourses);
dataRoute.get('/viewcourselessons/:courseId', verifyUser, viewLessonsByCourse);
dataRoute.get('/buyedcourses/:userId', verifyUser, getBuyedCourses);
dataRoute.get('/orderhistory/:userId', verifyUser, getUserOrderHistory);
dataRoute.post('/reportcourse', verifyUser, reportCourse);

module.exports = dataRoute;
