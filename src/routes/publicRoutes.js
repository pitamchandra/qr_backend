const express = require('express');
const { getPublicPassport } = require('../controllers/passportController');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// Lookup by clearanceId or slug (for backward compatibility)
// Handles both: /public/passport/:clearanceId and /public/passport/:slug formats
router.get('/passport/:identifier', catchAsync(getPublicPassport));

module.exports = router;
