const express = require("express");
const courseRoute = express.Router();
const { addCourse ,addLesson,viewCourse,deleteCourse,viewData,editCourse,deleteLesson,editLesson, updateLesson} = require('../../controller/courseController');
const verifyTutor = require('../../middleware/verifyTutor')

courseRoute.post('/addcourse',verifyTutor, addCourse);
courseRoute.post('/addlesson/:id',verifyTutor, addLesson);
courseRoute.get('/viewcourse/:id',verifyTutor,viewCourse);
courseRoute.delete('/viewcourse/',verifyTutor,deleteCourse);
courseRoute.post('/viewdata/:id',verifyTutor,viewData)
courseRoute.put('/editData/:id',verifyTutor,editCourse)
courseRoute.get('/editlesson',verifyTutor,editLesson);
courseRoute.put('/editlesson',verifyTutor,updateLesson);
courseRoute.delete('/editlesson/',verifyTutor,deleteLesson);


module.exports = courseRoute;