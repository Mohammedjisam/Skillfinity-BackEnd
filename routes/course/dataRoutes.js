const express = require("express");
const dataRoute = express.Router();
const { viewAllCourse, viewCourse,viewCourseAdmin, addCart,cartCount,checkPurchaseStatus, viewCart,viewLessons,removeCart,viewAllCategory,viewCategory,viewAllTutors,viewTutor,toggleCourseVisibility,viewMyCoursesAsTutor,buyCourse,buyAllCourses,purchaseCourse ,getPurchasedCourses ,viewLessonsByCourse,getBuyedCourses,getUserOrderHistory,reportCourse,addToWishlist,viewWishlist,checkWishlistStatus,removeFromWishlist,getCourseCompletionCertificate,} = require('../../controller/dataController');
const {addQuiz,getQuiz,submitQuizResult,issueCertificate,checkCertificate,getUserCertificates,downloadCertificate} = require('../../controller/quizController')
const {getTutorRevenue} = require("../../controller/revnueController")
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
dataRoute.post('/addtowishlist/:courseId/:userId', verifyUser, addToWishlist);
dataRoute.get('/viewwishlist/:userId', verifyUser, viewWishlist);
dataRoute.get('/checkwishlist/:courseId/:userId', verifyUser, checkWishlistStatus);
dataRoute.delete('/removefromwishlist/:courseId/:userId', verifyUser, removeFromWishlist);
dataRoute.post('/addquiz/:courseId', addQuiz);
dataRoute.get('/getquiz/:courseId',verifyUser, getQuiz)
dataRoute.post('/submitquizresult', submitQuizResult);
dataRoute.post('/certificate/:courseId', issueCertificate);
dataRoute.get('/certificate/:courseId/:userId', verifyUser, getCourseCompletionCertificate);
dataRoute.get('/certificate/check/:userId/:courseId', verifyUser, checkCertificate);
dataRoute.get('/usercertificates/:userId', verifyUser, getUserCertificates);
dataRoute.get('/revenue/:tutorId', getTutorRevenue);



module.exports = dataRoute;
