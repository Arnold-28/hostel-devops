const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getTokenFromHeader(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is required');

    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { requireAuth, requireRole };
