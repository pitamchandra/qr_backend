const QRCode = require('qrcode');

const generateQrCodeImage = async (publicUrl) => {
  return QRCode.toDataURL(publicUrl, { width: 320 });
};

module.exports = { generateQrCodeImage };
