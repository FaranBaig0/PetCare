const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'Access Denied. Admin privileges required.' });
    }
};

module.exports = { authenticateToken, isAdmin };