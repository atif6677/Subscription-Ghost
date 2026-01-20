const jwt = require('jsonwebtoken');
const User = require('../models/signupModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const authenticate = asyncHandler(async (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        throw new AppError("Authentication token missing", 401);
    }

    const token = authHeader.replace('Bearer ', '');

    let userObj;
    try {
        userObj = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError("Invalid or expired token", 401);
    }
    
    const user = await User.findById(userObj.userId);

    if (!user) {
        throw new AppError("User not found", 401);
    }

    // Attach user to request
    req.user = user; 
    next();
});

module.exports = authenticate;