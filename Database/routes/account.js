const express = require('express');
const bcrypt = require('bcryptjs');
const { Buffer } = require('node:buffer');
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');
const Task = require('../models/Task');
const ProfileImage = require('../models/ProfileImage');
const LoginEvent = require('../models/LoginEvent');

const router = express.Router();
router.use(requireAuth);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;

const str = (value) => (typeof value === 'string' ? value : '');
const publicUser = (user) => ({ id: user.id, fullName: user.fullName, email: user.email });

// Finds the signed-in user and checks their current password. Returns null if it is wrong.
async function verifyPassword(userId, password) {
  if (!password) return null;
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) return null;
  const matches = await bcrypt.compare(password, user.passwordHash);
  return matches ? user : null;
}

// GET /api/account -> { user, phone }
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    const profile = await ProfileImage.findOne({ user: req.userId });
    res.json({ user: publicUser(user), phone: profile?.phone || '' });
  } catch (err) {
    res.status(500).json({ message: 'Could not load your account.' });
  }
});

// PATCH /api/account/name  { fullName }
router.patch('/name', async (req, res) => {
  try {
    const fullName = str(req.body?.fullName).trim();
    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({ message: 'Full name must be between 2 and 100 characters' });
    }
    const user = await User.findByIdAndUpdate(req.userId, { fullName }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Could not change your name.' });
  }
});

// PATCH /api/account/email  { email, password }
router.patch('/email', async (req, res) => {
  try {
    const email = str(req.body?.email).trim().toLowerCase();
    if (email.length > 254 || !emailPattern.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    const user = await verifyPassword(req.userId, str(req.body?.password));
    if (!user) return res.status(401).json({ message: 'Your current password is incorrect' });

    const taken = await User.exists({ email, _id: { $ne: user._id } });
    if (taken) return res.status(409).json({ message: 'An account with this email already exists' });

    user.email = email;
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Could not change your email.' });
  }
});

// PATCH /api/account/phone  { phone }   (send '' to remove it, the number is optional)
router.patch('/phone', async (req, res) => {
  try {
    const phone = str(req.body?.phone).trim();
    if (phone !== '') {
      const digits = phone.replace(/\D/g, '');
      if (!phonePattern.test(phone) || digits.length < 7 || digits.length > 15) {
        return res.status(400).json({ message: 'Enter a valid contact number' });
      }
    }
    const profile = await ProfileImage.findOneAndUpdate(
      { user: req.userId },
      { $set: { phone } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ phone: profile.phone || '' });
  } catch (err) {
    res.status(500).json({ message: 'Could not save your contact number.' });
  }
});

// PATCH /api/account/password  { currentPassword, newPassword }
router.patch('/password', async (req, res) => {
  try {
    const currentPassword = str(req.body?.currentPassword);
    const newPassword = str(req.body?.newPassword);

    const bytes = Buffer.byteLength(newPassword, 'utf8');
    if (bytes < 8 || bytes > 72) {
      return res.status(400).json({ message: 'Password must be between 8 and 72 bytes' });
    }
    const user = await verifyPassword(req.userId, currentPassword);
    if (!user) return res.status(401).json({ message: 'Your current password is incorrect' });
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Your new password must be different' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Could not change your password.' });
  }
});

// DELETE /api/account  { password }  -> removes the account and everything that belongs to it
router.delete('/', async (req, res) => {
  try {
    const user = await verifyPassword(req.userId, str(req.body?.password));
    if (!user) return res.status(401).json({ message: 'Your current password is incorrect' });

    await Promise.all([
      Task.deleteMany({ user: user._id }),
      ProfileImage.deleteMany({ user: user._id }),
      LoginEvent.deleteMany({ userId: user.id }),
    ]);
    await User.deleteOne({ _id: user._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete your account.' });
  }
});

module.exports = router;