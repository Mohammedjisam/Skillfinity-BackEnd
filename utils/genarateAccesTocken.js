const jwt = require("jsonwebtoken");

function generateAccessTokenStudent(res, user) {
  const token = jwt.sign(
    { 
      userId: user._id,
       role: "student"
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
      expiresIn: "15m", // Changed from 1m to 15m for better user experience
    }
  );

  res.cookie("accessTokenStudent", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

function generateAccessTokenTutor(res, user) {
  const token = jwt.sign(
    { 
      userId: user._id,
       role: "tutor"
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
      expiresIn: "15m", // Changed from 1m to 15m for better user experience
    }
  );

  res.cookie("accessTokenTutor", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

function generateAccessTokenAdmin(res, user) {
  const token = jwt.sign(
    { 
      userId: user._id,
       role: "admin"
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
      expiresIn: "15m", // Changed from 1m to 15m for better user experience
    }
  );

  res.cookie("accessTokenAdmin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
}

module.exports = { generateAccessTokenStudent, generateAccessTokenTutor, generateAccessTokenAdmin };
