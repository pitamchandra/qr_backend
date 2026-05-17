const crypto = require('crypto');

const generatePassportSlug = () => {
  const token = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `PSPT-${token}`;
};

module.exports = { generatePassportSlug };
