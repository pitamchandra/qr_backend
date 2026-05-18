const dotenv = require('dotenv');
const path = require('path');
const app = require('./app');
const connectDatabase = require('./config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 8000;
const { getApiBaseUrl, getFrontendBaseUrl } = require('./utils/publicUrl');

connectDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API: ${getApiBaseUrl()}/api`);
      console.log(`Public pages (QR): ${getFrontendBaseUrl()}/ec-card/verify/:clearanceId`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
