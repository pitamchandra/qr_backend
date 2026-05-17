const { STRING_FIELDS, DATE_FIELDS } = require('../config/passportFields');

const applyPassportPayload = (target, body) => {
  STRING_FIELDS.forEach((field) => {
    if (body[field] === undefined) return;
    let value = String(body[field]).trim();
    if (field === 'passportNumber') {
      value = value.toUpperCase();
    }
    target[field] = value;
  });

  DATE_FIELDS.forEach((field) => {
    if (!body[field]) return;
    target[field] = new Date(body[field]);
  });
};

const buildCreatePayload = (body) => {
  const payload = {};
  applyPassportPayload(payload, body);
  return payload;
};

module.exports = { applyPassportPayload, buildCreatePayload };
