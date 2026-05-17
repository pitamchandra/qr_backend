const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { handleUpload } = require('../middleware/uploadErrorMiddleware');
const { protect } = require('../middleware/authMiddleware');
const catchAsync = require('../utils/catchAsync');

const attachmentUpload = handleUpload(upload.fields([{ name: 'attachmentFile', maxCount: 1 }]));
const {
  createPassport,
  getPassports,
  getPassportById,
  updatePassport,
  deletePassport,
} = require('../controllers/passportController');

const router = express.Router();

router.use(protect);
router.post('/', attachmentUpload, catchAsync(createPassport));
router.get('/', catchAsync(getPassports));
router.get('/:id', catchAsync(getPassportById));
router.patch('/:id', attachmentUpload, catchAsync(updatePassport));
router.delete('/:id', catchAsync(deletePassport));

module.exports = router;
