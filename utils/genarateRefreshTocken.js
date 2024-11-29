const jwt = require("jsonwebtoken");

function generateRefreshTokenStudent(res, user) {
  const refreshToken = jwt.sign(
    { 
      userId: user._id,
      role: "student"
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {
      expiresIn: "7d", 
    }
  );

  res.cookie("refreshTokenStudent", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
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
      expiresIn: "7d", 
    }
  );

  res.cookie("refreshTokenTutor", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
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
      expiresIn: "7d", 
    }
  );

  res.cookie("refreshTokenAdmin", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
}

module.exports = { generateRefreshTokenStudent, generateRefreshTokenTutor, generateRefreshTokenAdmin };
