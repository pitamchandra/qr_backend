const express = require('express');
const { getPublicPassport } = require('../controllers/passportController');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

router.get('/passport/:slug', catchAsync(getPublicPassport));

module.exports = router;
