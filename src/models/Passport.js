const mongoose = require('mongoose');

const passportSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '', trim: true },
    fatherName: { type: String, default: '', trim: true },
    motherName: { type: String, default: '', trim: true },
    birthDate: { type: Date },
    bloodGroup: { type: String, default: '', trim: true },
    gender: { type: String, default: '', trim: true },
    nid: { type: String, default: '', trim: true },
    destinationCountry: { type: String, default: '', trim: true },
    employer: { type: String, default: '', trim: true },
    passportNumber: { type: String, default: '', trim: true, uppercase: true },
    passportIssueDate: { type: Date },
    passportExpiryDate: { type: Date },
    visaNo: { type: String, default: '', trim: true },
    visaIssueDate: { type: Date },
    visaExpiryDate: { type: Date },
    referralNo: { type: String, default: '', trim: true },
    bmetId: { type: String, default: '', trim: true },
    clearanceId: { type: String, default: '', trim: true },
    rlId: { type: String, default: '', trim: true },
    recruitingAgencyName: { type: String, default: '', trim: true },
    recruitingAgencyPhone: { type: String, default: '', trim: true },
    clearanceDate: { type: Date },
    addressHouseVillageRoad: { type: String, default: '', trim: true },
    addressPostOffice: { type: String, default: '', trim: true },
    addressPoliceStation: { type: String, default: '', trim: true },
    addressUpazila: { type: String, default: '', trim: true },
    addressDistrict: { type: String, default: '', trim: true },
    addressDivision: { type: String, default: '', trim: true },
    emergencyContactName: { type: String, default: '', trim: true },
    emergencyContactRelation: { type: String, default: '', trim: true },
    emergencyContactMobile: { type: String, default: '', trim: true },
    emergencyContactAddress: { type: String, default: '', trim: true },
    attachmentFile: {
      url: { type: String, default: '' },
      fileType: { type: String, default: '' },
      originalName: { type: String, default: '' },
    },
    publicUrl: { type: String, default: '', trim: true },
    qrCodeImage: { type: String, default: '' },
    uniqueSlug: { type: String, required: true, unique: true, uppercase: true, trim: true },
  },
  { strict: true }
);

passportSchema.index({ passportNumber: 1 }, { unique: true, sparse: true });
passportSchema.index({ uniqueSlug: 1 });

module.exports = mongoose.model('Passport', passportSchema);
