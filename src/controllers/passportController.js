const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const Passport = require('../models/Passport');
const { DATE_FIELDS, REQUIRED_FIELDS } = require('../config/passportFields');
const { generatePassportSlug } = require('../utils/slug');
const { generateQrCodeImage } = require('../utils/qrGenerator');
const { buildPublicPassportUrl, getApiBaseUrl } = require('../utils/publicUrl');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getFieldLabel } = require('../utils/fieldLabels');
const { applyPassportPayload, buildCreatePayload } = require('../utils/passportPayload');

const validatePassportBody = (body) => {
  const errors = {};

  REQUIRED_FIELDS.forEach((field) => {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors[field] = `${getFieldLabel(field)} is required`;
    }
  });

  DATE_FIELDS.forEach((field) => {
    if (!body[field]) return;
    if (Number.isNaN(new Date(body[field]).getTime())) {
      errors[field] = `Enter a valid ${getFieldLabel(field).toLowerCase()}`;
    }
  });

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

const resolveAttachment = async (files) => {
  const attachmentFileObj = files?.attachmentFile?.[0] ? getFileInfo(files.attachmentFile[0]) : { url: '', fileType: '', originalName: '' };
  if (attachmentFileObj.url === '' && files?.attachmentFile?.[0]) {
    attachmentFileObj.url = await uploadFile(files.attachmentFile[0]);
  }
  return attachmentFileObj;
};

const createPassport = async (req, res) => {
  const requestBody = req.body;
  const validationErrors = validatePassportBody(requestBody);

  if (Object.keys(validationErrors).length > 0) {
    return errorResponse(res, 'Please fix the highlighted fields', 400, validationErrors);
  }

  const passportNumber = requestBody.passportNumber?.trim().toUpperCase();
  if (passportNumber) {
    const existingPassport = await Passport.findOne({ passportNumber });
    if (existingPassport) {
      return errorResponse(res, 'Passport number already exists', 400, {
        passportNumber: 'This passport number is already registered',
      });
    }
  }

  let uniqueSlug = generatePassportSlug();
  while (await Passport.findOne({ uniqueSlug })) {
    uniqueSlug = generatePassportSlug();
  }

  const publicUrl = buildPublicPassportUrl(uniqueSlug);
  const qrCodeImage = await generateQrCodeImage(publicUrl);
  const attachmentFile = await resolveAttachment(req.files);

  const passport = await Passport.create({
    ...buildCreatePayload(requestBody),
    attachmentFile,
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
      { clearanceId: { $regex: search, $options: 'i' } },
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

  const nextPassportNumber = req.body.passportNumber?.trim().toUpperCase();
  if (nextPassportNumber && nextPassportNumber !== passport.passportNumber) {
    const exists = await Passport.findOne({ passportNumber: nextPassportNumber });
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

  applyPassportPayload(passport, req.body);
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
