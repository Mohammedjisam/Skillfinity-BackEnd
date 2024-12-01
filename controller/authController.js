const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    try {
        const { credential, role = 'student' } = req.body;

        if (!credential) {
            return res.status(400).json({ 
                message: 'Google credentials are missing from the request body.' 
            });
        }

        const allowedRoles = ['student', 'tutor', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ 
                message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}` 
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { 
            email, 
            name, 
            picture, 
            sub: googleId, 
            email_verified 
        } = payload;

        if (!email_verified) {
            return res.status(400).json({ 
                message: 'Email not verified by Google.' 
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                googleId,
                user_id: googleId,
                profileImage: picture || null,
                role,
                phone: null,
                password: null
            });

            await user.save();
        } else {
            // Update existing user if needed
            user.googleId = googleId;
            user.user_id = googleId;
            user.profileImage = picture || user.profileImage;
            user.role = role;
            await user.save();
        }

        const authToken = jwt.sign(
            { 
                id: user._id, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

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