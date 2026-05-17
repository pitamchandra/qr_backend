const { errorResponse } = require('../utils/apiResponse');
const { getFieldLabel } = require('../utils/fieldLabels');

const notFoundHandler = (req, res) => {
  return errorResponse(res, 'Route not found', 404);
};

const formatMongooseValidationError = (err) => {
  const errors = {};

  Object.entries(err.errors || {}).forEach(([field, detail]) => {
    errors[field] = detail.message;
  });

  return {
    message: 'Please fix the highlighted fields',
    errors,
    statusCode: 400,
  };
};

const formatDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern || {})[0] || 'field';
  const label = getFieldLabel(field);
  const value = err.keyValue?.[field];

  return {
    message: `${label} already exists${value ? ` (${value})` : ''}`,
    errors: {
      [field]: `This ${label.toLowerCase()} is already in use`,
    },
    statusCode: 400,
  };
};

const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  if (err.name === 'ValidationError') {
    const formatted = formatMongooseValidationError(err);
    return errorResponse(res, formatted.message, formatted.statusCode, formatted.errors);
  }

  if (err.code === 11000) {
    const formatted = formatDuplicateKeyError(err);
    return errorResponse(res, formatted.message, formatted.statusCode, formatted.errors);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode >= 500 ? 'Internal server error. Please try again later.' : err.message || 'Request failed';

  return errorResponse(res, message, statusCode, err.errors || null);
};

module.exports = { globalErrorHandler, notFoundHandler };
