import { Router } from 'express';
import User from '../models/User.js';
import { createSessionToken, hashPassword, verifyPassword } from '../auth.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

function cleanEmail(value = '') {
  return value.trim().toLowerCase();
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function isAdminEmail(email) {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email);
}

router.post('/signup', async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const { salt, hash } = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      passwordSalt: salt,
      role: isAdminEmail(email) ? 'admin' : 'user',
    });

    res.status(201).json({ user: publicUser(user), token: createSessionToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });

    if (!user || !(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ user: publicUser(user), token: createSessionToken(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
