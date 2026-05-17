const path = require('path');
const dotenv = require('dotenv');
const connectDatabase = require('../src/config/db');
const Admin = require('../src/models/Admin');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
  try {
    await connectDatabase();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Password123!';
    const exists = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (exists) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    await Admin.create({ email, password, role: 'admin' });
    console.log('Seed admin created:', email);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
