const express = require("express");
const userRoute = express.Router();
const { signUp, login, logoutUser, updateUser, forgotPassword, resetPassword, sendOtp } = require('../../controller/userController');
const {getTutorsByUserBuyedCourse}= require('../../controller/usersCourseController')
const { verifyOtp}  = require('../../middleware/verifyOtp')
const verifyUser= require('../../middleware/verifyUser')
const {updateLessonProgress,getLessonProgress,getCourseProgress} = require('../../controller/progressController')
userRoute.post('/sendotp', sendOtp);
userRoute.post('/create', signUp);
userRoute.post('/login', login);
userRoute.post('/forgot', forgotPassword);
userRoute.post('/reset/:token', resetPassword);
userRoute.put('/update',verifyUser, updateUser);
userRoute.post("/logout",verifyUser, logoutUser);
userRoute.get('/purchasedcoursetutors', verifyUser, getTutorsByUserBuyedCourse);
userRoute.post('/updateLessonProgress', verifyUser, updateLessonProgress);
userRoute.get('/lessonProgress/:userId/:courseId', verifyUser, getLessonProgress);
userRoute.get('/courseProgress/:userId/:courseId', verifyUser, getCourseProgress);


module.exports = userRoute;userRoute.get('/lessonProgress/:userId/:courseId', verifyUser, getLessonProgress);
