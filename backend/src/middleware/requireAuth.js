import User from '../models/User.js';
import { verifySessionToken } from '../auth.js';

export default async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const payload = verifySessionToken(token);

    if (!payload) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(payload.sub).select('_id name email role');
    if (!user) {
      return res.status(401).json({ message: 'Account not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
