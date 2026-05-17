const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const connectDatabase = require('../src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
  return app(req, res);
};
