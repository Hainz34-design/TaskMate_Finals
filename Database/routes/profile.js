const express = require('express');
const jwt = require('jsonwebtoken');
const ProfileImage = require('../models/ProfileImage');

const router = express.Router();

const MAX_LENGTH = 1500000; // characters in the base64 data URL (about 1.1 MB)
const IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/;

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not signed in.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    if (!req.userId) throw new Error('No user id in token');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

router.use(requireAuth);

// GET /api/profile -> { avatar, cover }
router.get('/', async (req, res) => {
  try {
    const doc = await ProfileImage.findOne({ user: req.userId });
    res.json({ avatar: doc?.avatar || '', cover: doc?.cover || '' });
  } catch (err) {
    res.status(500).json({ message: 'Could not load your profile pictures.' });
  }
});

// PUT /api/profile  body: { avatar?: dataUrl, cover?: dataUrl }  (send '' to remove one)
router.put('/', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const update = {};

    for (const key of ['avatar', 'cover']) {
      const value = body[key];
      if (value === undefined) continue;
      if (typeof value !== 'string') {
        return res.status(400).json({ message: 'Invalid image.' });
      }
      if (value !== '' && (value.length > MAX_LENGTH || !IMAGE_PATTERN.test(value))) {
        return res.status(400).json({ message: 'Choose a smaller JPG, PNG or WebP image.' });
      }
      update[key] = value;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No image was provided.' });
    }

    const doc = await ProfileImage.findOneAndUpdate(
      { user: req.userId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ avatar: doc.avatar || '', cover: doc.cover || '' });
  } catch (err) {
    res.status(500).json({ message: 'Could not save the picture.' });
  }
});

module.exports = router;
