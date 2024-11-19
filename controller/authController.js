const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  try {
    // Ensure token is provided in the request
    const { token, role = 'student' } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'ID Token is required' });
    }
    
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    // Check if the user's email is verified by Google
    if (!email_verified) {
      return res.status(400).json({ message: 'Email not verified by Google' });
    }

    // Check if user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with fields from Google and specified role
      user = new User({
        name,
        email,
        user_id: googleId,
        profileImage: picture,
        isActive: true,
        role, // Use provided role, defaulting to "student" if not provided
      });

      await user.save();
    } else if (!user.user_id) {
      // If user exists but doesn't have a user_id (Google ID), update it
      user.user_id = googleId;
      user.profileImage = picture;
      user.isActive = true;
      user.role = role; // Update role if necessary
      await user.save();
    }

    // Generate JWT token for authenticated user
    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and user information in response
    res.status(200).json({ token: authToken, user });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

module.exports = { googleAuth };
