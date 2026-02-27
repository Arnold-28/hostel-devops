const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    passwordHash,
    role: 'admin',
  });

  // eslint-disable-next-line no-console
  console.log('[backend] bootstrapped admin user');
}

module.exports = { bootstrapAdmin };
