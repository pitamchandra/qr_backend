const path = require('path');
const dotenv = require('dotenv');
const connectDatabase = require('../src/config/db');
const Passport = require('../src/models/Passport');
const { buildPublicPassportUrl } = require('../src/utils/publicUrl');
const { generateQrCodeImage } = require('../src/utils/qrGenerator');

dotenv.config({ path: path.join(__dirname, '../.env') });

const regenerate = async () => {
  await connectDatabase();

  const passports = await Passport.find({ clearanceId: { $ne: '' } });
  let updated = 0;
  let skipped = 0;

  for (const passport of passports) {
    const publicUrl = buildPublicPassportUrl(passport.clearanceId);
    if (!publicUrl) {
      skipped += 1;
      continue;
    }

    passport.publicUrl = publicUrl;
    passport.qrCodeImage = await generateQrCodeImage(publicUrl);
    await passport.save();
    updated += 1;
    console.log('Updated:', passport.clearanceId, '->', publicUrl);
  }

  console.log(`Done. Updated ${updated}, skipped ${skipped}.`);
  process.exit(0);
};

regenerate().catch((error) => {
  console.error('Regenerate failed:', error);
  process.exit(1);
});
