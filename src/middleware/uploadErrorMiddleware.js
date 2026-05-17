const multer = require('multer');
const { errorResponse } = require('../utils/apiResponse');

const handleUpload =
  (uploadMiddleware) =>
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (!err) {
        return next();
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Attachment must be 10 MB or smaller', 400, {
            attachmentFile: 'File is too large (max 10 MB)',
          });
        }
        return errorResponse(res, err.message, 400);
      }

      return errorResponse(res, err.message || 'File upload failed', 400, {
        attachmentFile: err.message,
      });
    });
  };

module.exports = { handleUpload };
