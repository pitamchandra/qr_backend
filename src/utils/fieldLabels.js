const FIELD_LABELS = {
  fullName: 'Full name',
  fatherName: "Father's name",
  motherName: "Mother's name",
  destinationCountry: 'Destination country',
  passportNumber: 'Passport number',
  passportIssueDate: 'Passport issue date',
  bmetId: 'BMET ID',
  clearanceId: 'Clearance ID',
  rlId: 'RL ID',
  clearanceDate: 'Clearance date',
};

const getFieldLabel = (field) => FIELD_LABELS[field] || field;

module.exports = { FIELD_LABELS, getFieldLabel };
