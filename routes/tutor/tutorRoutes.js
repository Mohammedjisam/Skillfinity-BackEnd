const express = require("express");
const tutorRoute = express.Router();
const{signUp,login,logoutTutor,updateTutor,sendOtp,forgotPassword,resetPassword,viewProfile}=require('../../controller/tutorController')
const { verifyOtp}  = require('../../middleware/verifyOtp')
const verifyTutor = require('../../middleware/verifyTutor')

tutorRoute.post('/sendotp',sendOtp)
tutorRoute.post('/create',verifyOtp,signUp)
tutorRoute.post('/login',login)
tutorRoute.post('/forgot', forgotPassword);
tutorRoute.post('/reset/:token', resetPassword);
tutorRoute.put('/update',verifyTutor,updateTutor)
tutorRoute.post("/logout",verifyTutor,logoutTutor)
tutorRoute.get('/profile',verifyTutor,viewProfile)

module.exports=tutorRoute;
