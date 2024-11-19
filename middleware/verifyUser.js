const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
    const accessTokenStudent = req.cookies.accessTokenStudent;
    const refreshTokenStudent = req.cookies.refreshTokenStudent;

    if (accessTokenStudent) {
        jwt.verify(accessTokenStudent, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return handleRefreshToken(refreshTokenStudent, req, res, next);
                }
                return res.status(401).json({ message: "User not authorized, token verification failed" });
            }
            if (decoded.role !== 'student') {
                return res.status(403).json({ message: "Access denied. User role required." });
            }
            req.user = { id: decoded.userId, role: decoded.role };
            next();
        });
    } else {
        return handleRefreshToken(refreshTokenStudent, req, res, next);
    }
};

const handleRefreshToken = async (refreshTokenStudent, req, res, next) => {
    if (refreshTokenStudent) {
        try {
            const decoded = jwt.verify(refreshTokenStudent, process.env.REFRESH_TOKEN_SECRET);
            if (decoded.role !== 'student') {
                return res.status(403).json({ message: "Access denied. User role required." });
            }
            const newAccessToken = jwt.sign(
                { userId: decoded.userId, role: decoded.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );

            res.cookie("accessTokenStudent", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });
            req.user = { id: decoded.userId, role: decoded.role };
            next();
        } catch (err) {
            res.status(403).json({ message: "Refresh token is invalid or expired" });
        }
    } else {
        res.status(401).json({ message: "No access token and no refresh token provided" });
    }
};

module.exports = verifyUser;