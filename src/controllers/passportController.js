const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const Passport = require('../models/Passport');
const { generatePassportSlug } = require('../utils/slug');
const { generateQrCodeImage } = require('../utils/qrGenerator');
const { buildPublicPassportUrl, getApiBaseUrl } = require('../utils/publicUrl');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getFieldLabel } = require('../utils/fieldLabels');

const REQUIRED_FIELDS = [
  'fullName',
  'fatherName',
  'motherName',
  'destinationCountry',
  'passportNumber',
  'passportIssueDate',
  'bmetId',
  'clearanceId',
  'rlId',
  'clearanceDate',
];

const validatePassportBody = (body) => {
  const errors = {};

  REQUIRED_FIELDS.forEach((field) => {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[field] = `${getFieldLabel(field)} is required`;
    }
  });

  if (body.passportIssueDate && Number.isNaN(new Date(body.passportIssueDate).getTime())) {
    errors.passportIssueDate = 'Enter a valid passport issue date';
  }

  if (body.clearanceDate && Number.isNaN(new Date(body.clearanceDate).getTime())) {
    errors.clearanceDate = 'Enter a valid clearance date';
  }

  return errors;
};

const uploadToCloudinary = (file) => {
  const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
  const options = {
    folder: 'passport-verification',
    resource_type: resourceType,
  };

  if (file.buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      stream.end(file.buffer);
    });
  }

  return cloudinary.uploader.upload(file.path, options);
};

const uploadFile = async (file) => {
  if (!file) return '';

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const result = await uploadToCloudinary(file);
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed:', error.message);
      if (process.env.VERCEL) {
        throw new Error('File upload failed. Check Cloudinary settings.');
      }
    }
  }

  if (process.env.VERCEL) {
    throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on Vercel for file uploads.');
  }

  if (!file.path) {
    return '';
  }

  return `${getApiBaseUrl()}/uploads/${path.basename(file.path)}`;
};

const getFileInfo = (file) => {
  if (!file) return { url: '', fileType: '', originalName: '' };
  const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'image';
  return {
    url: '',
    fileType,
    originalName: file.originalname,
  };
};

const createPassport = async (req, res) => {
  const requestBody = req.body;
  const validationErrors = validatePassportBody(requestBody);

  if (Object.keys(validationErrors).length > 0) {
    return errorResponse(res, 'Please fix the highlighted fields', 400, validationErrors);
  }

  const existingPassport = await Passport.findOne({ passportNumber: requestBody.passportNumber.trim().toUpperCase() });
  if (existingPassport) {
    return errorResponse(res, 'Passport number already exists', 400, {
      passportNumber: 'This passport number is already registered',
    });
  }

  let uniqueSlug = generatePassportSlug();
  while (await Passport.findOne({ uniqueSlug })) {
    uniqueSlug = generatePassportSlug();
  }

  const publicUrl = buildPublicPassportUrl(uniqueSlug);
  const qrCodeImage = await generateQrCodeImage(publicUrl);
  
  const attachmentFileObj = req.files?.attachmentFile?.[0] ? getFileInfo(req.files.attachmentFile[0]) : { url: '', fileType: '', originalName: '' };
  if (attachmentFileObj.url === '' && req.files?.attachmentFile?.[0]) {
    attachmentFileObj.url = await uploadFile(req.files.attachmentFile[0]);
  }

  const passport = await Passport.create({
    fullName: requestBody.fullName.trim(),
    fatherName: requestBody.fatherName.trim(),
    motherName: requestBody.motherName.trim(),
    destinationCountry: requestBody.destinationCountry.trim(),
    passportNumber: requestBody.passportNumber.trim().toUpperCase(),
    passportIssueDate: new Date(requestBody.passportIssueDate),
    bmetId: requestBody.bmetId.trim(),
    clearanceId: requestBody.clearanceId.trim(),
    rlId: requestBody.rlId.trim(),
    clearanceDate: new Date(requestBody.clearanceDate),
    attachmentFile: attachmentFileObj,
    qrCodeImage,
    uniqueSlug,
  });

  return successResponse(res, passport, 'EC card created successfully', 201);
};

const getPassports = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const search = req.query.search || '';

  const query = {};
  if (search) {
    query.$or = [
      { passportNumber: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { bmetId: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Passport.countDocuments(query);
  const passports = await Passport.find(query)
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return successResponse(res, {
    passports,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

const getPassportById = async (req, res) => {
  const passport = await Passport.findById(req.params.id);
  if (!passport) {
    return errorResponse(res, 'EC card not found', 404);
  }

  const publicUrl = buildPublicPassportUrl(passport.uniqueSlug);
  const qrCodeImage = await generateQrCodeImage(publicUrl);
  if (passport.qrCodeImage !== qrCodeImage) {
    passport.qrCodeImage = qrCodeImage;
    await passport.save();
  }

  return successResponse(res, passport);
};

const updatePassport = async (req, res) => {
  const passport = await Passport.findById(req.params.id);
  if (!passport) {
    return errorResponse(res, 'EC card not found', 404);
  }

  const validationErrors = validatePassportBody({ ...passport.toObject(), ...req.body });
  if (Object.keys(validationErrors).length > 0) {
    return errorResponse(res, 'Please fix the highlighted fields', 400, validationErrors);
  }

  if (req.body.passportNumber && req.body.passportNumber !== passport.passportNumber) {
    const exists = await Passport.findOne({ passportNumber: req.body.passportNumber.trim().toUpperCase() });
    if (exists) {
      return errorResponse(res, 'Passport number already exists', 400, {
        passportNumber: 'This passport number is already registered',
      });
    }
  }

  if (req.files?.attachmentFile?.[0]) {
    const fileInfo = getFileInfo(req.files.attachmentFile[0]);
    fileInfo.url = await uploadFile(req.files.attachmentFile[0]);
    passport.attachmentFile = fileInfo;
  }

  const allowedFields = [
    'fullName',
    'fatherName',
    'motherName',
    'destinationCountry',
    'passportNumber',
    'passportIssueDate',
    'bmetId',
    'clearanceId',
    'rlId',
    'clearanceDate',
  ];
  
  allowedFields.forEach((field) => {
    if (req.body[field]) {
      const value = req.body[field];
      if (field.includes('Date')) {
        passport[field] = new Date(value);
      } else {
        passport[field] = value.toString().trim();
        if (field === 'passportNumber') {
          passport[field] = passport[field].toUpperCase();
        }
      }
    }
  });

  await passport.save();
  return successResponse(res, passport, 'EC card updated successfully');
};

const deletePassport = async (req, res) => {
  const passport = await Passport.findById(req.params.id);
  if (!passport) {
    return errorResponse(res, 'EC card not found', 404);
  }
  await passport.deleteOne();
  return successResponse(res, null, 'EC card deleted successfully');
};

const getPublicPassport = async (req, res) => {
  const passport = await Passport.findOne({ uniqueSlug: req.params.slug });
  if (!passport) {
    return errorResponse(res, 'EC card not found', 404);
  }
  return successResponse(res, passport);
};

module.exports = {
  createPassport,
  getPassports,
  getPassportById,
  updatePassport,
  deletePassport,
  getPublicPassport,
};

