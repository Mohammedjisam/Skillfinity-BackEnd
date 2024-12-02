const express = require("express");
const User = require("../model/userModel");
const Category = require('../model/categoryModel');
const Purchase = require('../model/purchaseModel');
const Course = require('../model/courseModel'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const crypto = require('crypto');
const { mailSender } = require('../utils/nodeMailer');
const {generateAccessTokenAdmin} = require("../utils/genarateAccesTocken");
const {generateRefreshTokenAdmin} = require("../utils/genarateRefreshTocken");

const passwordResetTemplate = (resetURL) => {
  return {
    subject: "Password Reset Request",
    htmlContent: `
      <h1>Password Reset Request</h1>
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please click on the following link, or paste this into your browser to complete the process:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `
  };
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    if(user?.role === "admin"){
      const resetToken = crypto.randomBytes(20).toString('hex');

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; 

      await user.save();

      const resetURL = `http://localhost:5173/admin/reset-password/${resetToken}`;

      const { subject, htmlContent } = passwordResetTemplate(resetURL);
      await mailSender(email, subject, htmlContent);

      res.status(200).json({ message: 'Password reset link sent' });
    } else {
      res.status(403).json({ message: 'Not authorized for password reset' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}; 

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    user.password = encryptedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminInfo = await User.findOne({ email, role: "admin" });

    if (!adminInfo) return res.status(401).json({ message: "Invalid email or password" });

    if (await bcrypt.compare(password, adminInfo.password)) {
      generateAccessTokenAdmin(res, adminInfo); 
      generateRefreshTokenAdmin(res, adminInfo); 
      return res.status(200).json({
        message: "Login successful",
        adminData: adminInfo,
      });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const students = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';

    const searchQuery = {
      role: "student",
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { user_id: { $regex: search, $options: 'i' } }
      ]
    };

    const totalStudents = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalStudents / limit);

    const students = await User.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const studentsWithPurchases = await Promise.all(
      students.map(async (student) => {
        const purchases = await Purchase.aggregate([
          { $match: { userId: student._id } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$userId",
              uniqueCourses: { $addToSet: "$items.courseId" },
              totalCourses: { $sum: 1 }
            }
          }
        ]);

        const courseCount = purchases.length > 0 ? purchases[0].uniqueCourses.length : 0;
        
        return {
          ...student.toObject(),
          coursePurchased: courseCount
        };
      })
    );

    return res.status(200).json({
      message: "Students data fetched successfully",
      students: studentsWithPurchases,
      currentPage: page,
      totalPages: totalPages,
      totalStudents: totalStudents
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};



const tutors = async(req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';

    const searchQuery = {
      role: "tutor",
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { user_id: { $regex: search, $options: 'i' } }
      ]
    };

    const totalTutors = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalTutors / limit);

    const tutors = await User.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const tutorsWithCourses = await Promise.all(
      tutors.map(async (tutor) => {
        const courseCount = await Course.countDocuments({ tutor: tutor._id });
        
        return {
          ...tutor.toObject(),
          coursesTaken: courseCount
        };
      })
    );

    return res.status(200).json({
      message: "Tutors data fetched successfully", 
      tutors: tutorsWithCourses,
      currentPage: page,
      totalPages,
      totalTutors
    });

  } catch(error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


const logoutAdmin = async (req, res) => {
  res.clearCookie('accessTokenAdmin', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.clearCookie('refreshTokenAdmin', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const listUser = async(req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: true}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "User not found"});
    } else {
      res.status(200).json({success: true, message: "User is listed"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const unlistUser = async(req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: false}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "User not found"});
    } else {
      res.status(200).json({success: true, message: "User is unlisted"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const lisTtutor = async(req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: true}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "Tutor not found"});
    } else {
      res.status(200).json({success: true, message: "Tutor is listed"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const unlisTtutor = async(req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: false}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "Tutor not found"});
    } else {
      res.status(200).json({success: true, message: "Tutor is unlisted"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const addCategory = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  try {
    const category = new Category({ title, description });
    await category.save();
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';

    const searchQuery = {
      title: { $regex: search, $options: 'i' }
    };

    const totalCategories = await Category.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCategories / limit);

    const categories = await Category.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      categories,
      currentPage: page,
      totalPages,
      totalCategories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }                             
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(id, { title, description }, { new: true });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

const getAllStudentOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; 
    const filterOption = req.query.filterOption || 'all';

    let dateFilter = {};
    const now = new Date();

    switch (filterOption) {
      case 'lastDay':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case 'lastWeek':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'lastMonth':
        dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) } };
        break;
      case 'lastYear':
        dateFilter = { createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) } };
        break;
      default:
        dateFilter = {};
    }

    const totalOrders = await Purchase.countDocuments(dateFilter);
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Purchase.find(dateFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'name email'
      })
      .populate({
        path: 'items.courseId',
        select: 'coursetitle price'
      });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      createdAt: order.createdAt,
      userId: {
        name: order.userId.name,
        email: order.userId.email
      },
      items: order.items.map(item => ({
        courseId: item.courseId._id,
        coursetitle: item.courseId.coursetitle,
        price: item.courseId.price
      })),
      totalAmount: order.items.reduce((total, item) => total + item.courseId.price, 0)
    }));

    // Calculate total revenue for all orders matching the filter
    const allOrders = await Purchase.find(dateFilter).populate({
      path: 'items.courseId',
      select: 'price'
    });
    const totalRevenue = allOrders.reduce((total, order) => 
      total + order.items.reduce((orderTotal, item) => orderTotal + (item.courseId?.price || 0), 0)
    , 0);

    res.status(200).json({
      orders: formattedOrders,
      currentPage: page,
      totalPages,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.error("Error in getAdminOrders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = {
  adminLogin,
  forgotPassword,
  resetPassword,
  logoutAdmin,
  students,
  tutors,
  listUser,
  unlistUser,
  lisTtutor,
  unlisTtutor,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getAllStudentOrders
};