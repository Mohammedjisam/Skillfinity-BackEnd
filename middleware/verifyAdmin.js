const jwt = require("jsonwebtoken");

const verifyAdmin = async (req, res, next) => {
    const accessTokenAdmin = req.cookies.accessTokenAdmin;
    const refreshTokenAdmin = req.cookies.refreshTokenAdmin;

    if (accessTokenAdmin) {
        jwt.verify(accessTokenAdmin, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return handleRefreshToken(refreshTokenAdmin, req, res, next);
                }
                return res.status(401).json({ message: "Admin not authorized, token verification failed" });
            }
            if (decoded.role !== 'admin') {
                return res.status(403).json({ message: "Access denied. Admin role required." });
            }
            req.admin = { id: decoded.userId, role: decoded.role };
            next();
        });
    } else {
        return handleRefreshToken(refreshTokenAdmin, req, res, next);
    }
};

const handleRefreshToken = async (refreshTokenAdmin, req, res, next) => {
    if (refreshTokenAdmin) {
        try {
            const decoded = jwt.verify(refreshTokenAdmin, process.env.REFRESH_TOKEN_SECRET);
            if (decoded.role !== 'admin') {
                return res.status(403).json({ message: "Access denied. Admin role required." });
            }
            const newAccessToken = jwt.sign(
                { userId: decoded.userId, role: decoded.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );

            res.cookie("accessTokenAdmin", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });
            req.admin = { id: decoded.userId, role: decoded.role };
            next();
        } catch (err) {
            res.status(403).json({ message: "Refresh token is invalid or expired" });
        }
    } else {
        res.status(401).json({ message: "No access token and no refresh token provided" });
    }
};

module.exports = verifyAdmin;