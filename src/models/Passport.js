const mongoose = require('mongoose');

const passportSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    fatherName: { type: String, required: [true, 'Father\'s name is required'], trim: true },
    motherName: { type: String, required: [true, 'Mother\'s name is required'], trim: true },
    destinationCountry: { type: String, required: [true, 'Destination country is required'], trim: true },
    passportNumber: {
      type: String,
      required: [true, 'Passport number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    passportIssueDate: { type: Date, required: [true, 'Passport issue date is required'] },
    bmetId: { type: String, required: [true, 'BMET ID is required'], trim: true },
    clearanceId: { type: String, required: [true, 'Clearance ID is required'], trim: true },
    rlId: { type: String, required: [true, 'RL ID is required'], trim: true },
    clearanceDate: { type: Date, required: [true, 'Clearance date is required'] },
    attachmentFile: {
      url: { type: String, default: '' },
      fileType: { type: String, default: '' },
      originalName: { type: String, default: '' },
    },
    qrCodeImage: { type: String, default: '' },
    uniqueSlug: { type: String, required: true, unique: true, uppercase: true, trim: true },
  },
  { strict: true }
);

passportSchema.index({ passportNumber: 1 });
passportSchema.index({ uniqueSlug: 1 });

module.exports = mongoose.model('Passport', passportSchema);
