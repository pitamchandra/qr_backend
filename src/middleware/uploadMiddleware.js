const path = require('path');
const multer = require('multer');
const fs = require('fs');

const isServerless = Boolean(process.env.VERCEL);

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP) and PDF files are allowed'), false);
  }
};

const storage = isServerless
  ? multer.memoryStorage()
  : (() => {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      return multer.diskStorage({
        destination(req, file, cb) {
          cb(null, uploadsDir);
        },
        filename(req, file, cb) {
          const ext = path.extname(file.originalname);
          cb(null, `${Date.now()}-${file.fieldname}${ext}`);
        },
      });
    })();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
