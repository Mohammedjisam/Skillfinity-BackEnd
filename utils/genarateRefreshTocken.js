const jwt = require("jsonwebtoken");

function generateRefreshTokenStudent(res, user) {
  const refreshToken = jwt.sign(
    { 
      userId: user._id,
      role: "student"
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {
      expiresIn: "7d", // Token expires in 7 days
    }
  );

  res.cookie("refreshTokenStudent", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function generateRefreshTokenTutor(res, user) {
  const refreshToken = jwt.sign(
    { 
      userId: user._id,
      role: "tutor"
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {
      expiresIn: "7d", // Token expires in 7 days
    }
  );

  res.cookie("refreshTokenTutor", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function generateRefreshTokenAdmin(res, user) {
  const refreshToken = jwt.sign(
    { 
      userId: user._id,
      role: "admin"
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {
      expiresIn: "7d", // Token expires in 7 days
    }
  );

  res.cookie("refreshTokenAdmin", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

module.exports = { generateRefreshTokenStudent, generateRefreshTokenTutor, generateRefreshTokenAdmin };
