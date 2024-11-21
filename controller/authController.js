const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  try {
    const { token, role = 'student' } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'ID Token is required' });
    }
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Email not verified by Google' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        user_id: googleId,
        profileImage: picture,
        isActive: true,
        role,
      });

      await user.save();
    } else if (!user.user_id) {
      user.user_id = googleId;
      user.profileImage = picture;
      user.isActive = true;
      user.role = role;
      await user.save();
    }

    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token: authToken, user });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

module.exports = { googleAuth };
