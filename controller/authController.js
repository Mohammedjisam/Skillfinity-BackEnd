const { OAuth2Client } = require('google-auth-library');
const User = require('../model/userModel');
const { generateAccessTokenStudent, generateAccessTokenTutor } = require('../utils/genarateAccesTocken');
const { generateRefreshTokenStudent, generateRefreshTokenTutor } = require('../utils/genarateRefreshTocken');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthStudent = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        user_id: googleId,
        profileImage: picture || null,
        role: 'student',
        password: null,
      });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.profileImage) user.profileImage = picture || user.profileImage;
      if (user.role !== 'student') user.role = 'student';
      await user.save();
    }

    generateAccessTokenStudent(res, user);
    generateRefreshTokenStudent(res, user);

    res.status(200).json({
      message: 'Student authentication successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Google student authentication error:', error);
    res.status(500).json({
      message: 'Google student authentication failed. Please try again.',
      error: error.message,
    });
  }
};

const googleAuthTutor = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        user_id: googleId,
        profileImage: picture || null,
        role: 'tutor',
        password: null,
      });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.profileImage) user.profileImage = picture || user.profileImage;
      if (user.role !== 'tutor') user.role = 'tutor';
      await user.save();
    }

    generateAccessTokenTutor(res, user);
    generateRefreshTokenTutor(res, user);

    res.status(200).json({
      message: 'Tutor authentication successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Google tutor authentication error:', error);
    res.status(500).json({
      message: 'Google tutor authentication failed. Please try again.',
      error: error.message,
    });
  }
};

module.exports = { googleAuthStudent, googleAuthTutor };

