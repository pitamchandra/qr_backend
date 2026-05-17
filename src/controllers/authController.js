const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const signToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400);
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin || !(await admin.matchPassword(password))) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const token = signToken(admin._id);
  return successResponse(res, { token }, 'Login successful');
};

const logout = async (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
};

module.exports = { login, logout };
