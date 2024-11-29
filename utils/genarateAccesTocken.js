const jwt = require("jsonwebtoken");

function generateAccessTokenStudent(res, user) {
  const token = jwt.sign(
    { 
      userId: user._id,
       role: "student"
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
      expiresIn: "15m", 
    }
  );

  res.cookie("accessTokenStudent", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, 
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
      expiresIn: "15m",
    }
  );

  res.cookie("accessTokenTutor", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, 
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
      expiresIn: "15m", 
    }
  );

  res.cookie("accessTokenAdmin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, 
  });
}

module.exports = { generateAccessTokenStudent, generateAccessTokenTutor, generateAccessTokenAdmin };
