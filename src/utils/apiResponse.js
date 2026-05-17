const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
  };

  if (errors && Object.keys(errors).length > 0) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };
