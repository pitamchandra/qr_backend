/** Fields stored on Passport documents */
const STRING_FIELDS = [
  'fullName',
  'fatherName',
  'motherName',
  'bloodGroup',
  'gender',
  'nid',
  'destinationCountry',
  'employer',
  'passportNumber',
  'visaNo',
  'referralNo',
  'bmetId',
  'clearanceId',
  'rlId',
  'recruitingAgencyName',
  'recruitingAgencyPhone',
  'addressHouseVillageRoad',
  'addressPostOffice',
  'addressPoliceStation',
  'addressUpazila',
  'addressDistrict',
  'addressDivision',
  'emergencyContactName',
  'emergencyContactRelation',
  'emergencyContactMobile',
  'emergencyContactAddress',
];

const DATE_FIELDS = [
  'birthDate',
  'passportIssueDate',
  'passportExpiryDate',
  'visaIssueDate',
  'visaExpiryDate',
  'clearanceDate',
];

const REQUIRED_FIELDS = ['clearanceId'];

module.exports = { STRING_FIELDS, DATE_FIELDS, REQUIRED_FIELDS };
