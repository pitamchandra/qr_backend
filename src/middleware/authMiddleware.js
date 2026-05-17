const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Not authorized, token missing', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return errorResponse(res, 'Not authorized, admin not found', 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized, token invalid', 401);
  }
};

module.exports = { protect };
