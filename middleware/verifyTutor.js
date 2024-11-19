const jwt = require("jsonwebtoken");

const verifyTutor = async (req, res, next) => {
    const accessTokenTutor = req.cookies.accessTokenTutor;
    const refreshTokenTutor = req.cookies.refreshTokenTutor;

    if (accessTokenTutor) {
        jwt.verify(accessTokenTutor, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return handleRefreshToken(refreshTokenTutor, req, res, next);
                }
                return res.status(401).json({ message: "Tutor not authorized, token verification failed" });
            }
            if (decoded.role !== 'tutor') {
                return res.status(403).json({ message: "Access denied. Tutor role required." });
            }
            req.tutor = { id: decoded.userId, role: decoded.role };
            next();
        });
    } else {
        return handleRefreshToken(refreshTokenTutor, req, res, next);
    }
};

const handleRefreshToken = async (refreshTokenTutor, req, res, next) => {
    if (refreshTokenTutor) {
        try {
            const decoded = jwt.verify(refreshTokenTutor, process.env.REFRESH_TOKEN_SECRET);
            if (decoded.role !== 'tutor') {
                return res.status(403).json({ message: "Access denied. Tutor role required." });
            }
            const newAccessToken = jwt.sign(
                { userId: decoded.userId, role: decoded.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );

            res.cookie("accessTokenTutor", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });
            req.tutor = { id: decoded.userId, role: decoded.role };
            next();
        } catch (err) {
            res.status(403).json({ message: "Refresh token is invalid or expired" });
        }
    } else {
        res.status(401).json({ message: "No access token and no refresh token provided" });
    }
};

module.exports = verifyTutor;