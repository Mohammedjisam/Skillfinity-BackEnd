const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    try {
        const { credential, role = 'student' } = req.body;

        // Verify Google ID Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { email },
                { googleId }
            ]
        });

        if (!user) {
            // Create a new user
            user = new User({
                name,
                email,
                googleId,
                user_id: googleId,
                profileImage: picture || null,
                role,
                password: null
            });

            await user.save();
        } else {
            // Update existing user if needed
            user.googleId = googleId;
            user.name = name;
            user.profileImage = picture || user.profileImage;
            user.role = role;
            await user.save();
        }

        // Generate JWT token
        const authToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send response
        res.status(200).json({
            message: 'Authentication successful',
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(500).json({
            message: 'Google authentication failed. Please try again.',
            error: error.message
        });
    }
};

module.exports = { googleAuth };
