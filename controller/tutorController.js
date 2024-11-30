const express = require("express");
const User = require("../model/userModel");
const Purchase = require('../model/purchaseModel');
const Course = require('../model/courseModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const otpSchema = require("../model/otpStore");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const { mailSender, otpEmailTemplate } = require("../utils/nodeMailer");
const { generateAccessTokenTutor } = require("../utils/genarateAccesTocken");
const { generateRefreshTokenTutor } = require("../utils/genarateRefreshTocken");

const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email, role: "tutor" });
    if (existingUser)
      return res
        .status(409)
        .json({ success: false, message: "E-mail already exists" });

    const otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    await otpSchema.create({ email, otp });

    const { subject, htmlContent } = otpEmailTemplate(otp);
    await mailSender(email, subject, htmlContent);

    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully", otp });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const securePassword = async (password) => bcrypt.hash(password, 10);

const signUp = async (req, res) => {
  try {
    const { name, password, email, phone } = req.body;
    const userExists = await User.findOne({ email, role: "tutor" });
    if (userExists)
      return res.status(409).json({ message: "Tutor already exists" });

    const userId = await generateUniqueUserId();
    const passwordHash = await securePassword(password);
    const newUser = await User.create({
      name,
      password: passwordHash,
      email,
      phone,
      role: "tutor",
      user_id: userId,
    });

    // Generate access and refresh tokens
    generateAccessTokenTutor(res, newUser);
    generateRefreshTokenTutor(res, newUser);

    res.status(200).json({ 
      success: true,
      message: "Tutor registered successfully", 
      userData: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        user_id: newUser.user_id
      }
    });
  } catch (error) {
    console.error("Error in signUp:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "tutor" });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    if (user.isActive === false)
      return res
        .status(403)
        .json({ message: "Your account is blocked. Contact support." });

    if (await bcrypt.compare(password, user.password)) {
      generateAccessTokenTutor(res, user); 
      generateRefreshTokenTutor(res, user); 
      res.status(200).json({ message: "Login successful", userData: user });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const passwordResetTemplate = (resetURL) => {
  return {
    subject: "Password Reset Request",
    htmlContent: `
            <h1>Password Reset Request</h1>
            <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `,
  };
};

const generateUniqueUserId = async (prefix = "ttrskfnty") => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  const userId = `${prefix}${randomNumber}`;
  const exists = await User.findOne({ user_id: userId });
  return exists ? generateUniqueUserId(prefix) : userId;
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email, role: "tutor" });
    if (!user) return res.status(404).json({ message: "Tutor doesn't exist" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `http://localhost:5173/tutor/reset-password/${resetToken}`;
    const { subject, htmlContent } = passwordResetTemplate(resetURL);
    await mailSender(email, subject, htmlContent);

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
      role: "tutor",
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateTutor = async (req, res) => {
  try {
    const { _id, email, name, phone, profileImage } = req.body;
    console.log("Received update request:", {
      _id,
      email,
      name,
      phone,
      profileImage,
    });

    const user = await User.findById(_id);
    if (!user) {
      console.log("User not found:", _id);
      return res.status(404).json({ message: "User not found" });
    }

    const updatedData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(profileImage && { profileImage }),
    };
    console.log("Updating user with data:", updatedData);

    const updatedUser = await User.findByIdAndUpdate(_id, updatedData, {
      new: true,
    });
    console.log("Updated user:", updatedUser);

    res.json({ message: "Update successful", updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logoutTutor = (req, res) => {
    console.log("logut reacheddddd")
  res.clearCookie("accessTokenTutor");
  res.clearCookie("refreshTokenTutor");
  res.status(200).json({ message: "Logged out successfully" });
};

const viewProfile = async (req, res) => {
  try {
    const tutor = await User.findById(req.user.id).select("-password");
    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Tutor not found" });
    }
    res.status(200).json({ success: true, tutor });
  } catch (error) {
    console.error("Error in viewProfile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTutorCourseOrders = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Find all courses by this tutor
    const tutorCourses = await Course.find({ tutor: tutorId });

    if (tutorCourses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          orders: [],
          totalPages: 0,
          currentPage: page,
          totalOrders: 0,
          totalRevenue: 0
        }
      });
    }

    const courseIds = tutorCourses.map(course => course._id);

    const orders = await Purchase.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.courseId': { $in: courseIds }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'items.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: '$courseDetails'
      },
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          createdAt: { $first: '$createdAt' },
          items: {
            $push: {
              courseId: '$items.courseId',
              isReported: '$items.isReported',
              courseName: '$courseDetails.coursetitle',
              coursePrice: '$courseDetails.price'
            }
          },
          totalAmount: {
            $sum: '$courseDetails.price'
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          'user.name': '$userDetails.name',
          'user.email': '$userDetails.email',
          items: 1,
          totalAmount: 1
        }
      }
    ]);

    const totalOrders = await Purchase.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.courseId': { $in: courseIds }
        }
      },
      {
        $group: {
          _id: '$_id'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalOrders[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const revenueAggregation = await Purchase.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.courseId': { $in: courseIds }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'items.courseId',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: '$courseDetails'
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$courseDetails.price' }
        }
      }
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalPages,
        currentPage: page,
        totalOrders: total,
        totalRevenue
      }
    });

  } catch (error) {
    console.error('Error in getTutorCourseOrders:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching course order details',
      error: error.message
    });
  }
};



module.exports = {
  signUp,
  login,
  updateTutor,
  logoutTutor,
  forgotPassword,
  resetPassword,
  sendOtp,
  viewProfile,
  getTutorCourseOrders
};
