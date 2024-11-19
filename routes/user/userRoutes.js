const express = require("express");
const userRoute = express.Router();
const { signUp, login, logoutUser, updateUser, forgotPassword, resetPassword, sendOtp } = require('../../controller/userController');
const { verifyOtp}  = require('../../middleware/verifyOtp')
const verifyUser= require('../../middleware/verifyUser')

userRoute.post('/sendotp', sendOtp);
userRoute.post('/create', signUp);
userRoute.post('/login', login);
userRoute.post('/forgot', forgotPassword);
userRoute.post('/reset/:token', resetPassword);
userRoute.put('/update',verifyUser, updateUser);
userRoute.post("/logout",verifyUser, logoutUser);

module.exports = userRoute;