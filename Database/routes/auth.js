const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { Buffer } = require('node:buffer');
const jwt = require('jsonwebtoken');
const LoginEvent = require('../models/LoginEvent');
const User = require('../models/User');

// Dito naka-grupo ang API endpoints para gumawa ng account at mag-login.

const router = Router();
// Simple format check; ang backend/database pa rin ang source of truth.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Token ito na nagpapatunay ng user ID; valid ito sa loob ng pitong araw.
function createToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Piliin lang ang safe fields na puwedeng makita ng app.
function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

// Signup endpoint: validate inputs, hash the password, then insert one user.
router.post('/register', async (req, res) => {
  // Kapag walang JSON body, gawing empty object para maibalik ang validation error.
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  // Tiyaking may makabuluhang pangalan at hindi lalampas sa schema limit.
  if (fullName.length < 2 || fullName.length > 100) {
    res.status(400).json({ message: 'Full name must be between 2 and 100 characters' });
    return;
  }

  // Trim at lowercase para pare-pareho ang email kapag sine-save at hinahanap.
  if (email.length > 254 || !emailPattern.test(email)) {
    res.status(400).json({ message: 'Enter a valid email address' });
    return;
  }

  // Bcrypt can process at most 72 bytes; reject shorter or longer passwords.
  const passwordBytes = Buffer.byteLength(password, 'utf8');
  if (passwordBytes < 8 || passwordBytes > 72) {
    res.status(400).json({ message: 'Password must be between 8 and 72 bytes' });
    return;
  }

  // I-check muna ang email para makapagbalik ng malinaw na duplicate-account error.
  const existingUser = await User.exists({ email });
  if (existingUser) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  // I-hash ang password bago i-save; hindi kailanman iniimbak ang plaintext.
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, email, passwordHash });

  // 201 means bagong record ang nagawa; token lets the app start a session.
  res.status(201).json({
    user: publicUser(user),
    token: createToken(user.id),
  });
});

// Login endpoint: verify the password, record a successful login, then return a token.
router.post('/login', async (req, res) => {
  // Gamitin ang parehong email normalization na ginagamit sa registration.
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!emailPattern.test(email) || password.length === 0) {
    res.status(400).json({ message: 'Enter a valid email address and password' });
    return;
  }

  // Password hash ay hidden by default, kaya tahasang hinihingi para ma-compare.
  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

  // Isang generic response para hindi ibunyag kung existing ang email.
  if (!passwordMatches) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  // I-save ang timestamp/user reference lang; walang password na nilalagay sa log.
  await LoginEvent.create({ userId: user.id, email: user.email });

  // Ibalik ang public profile at bagong token, hindi ang password o hash.
  res.json({
    user: publicUser(user),
    token: createToken(user.id),
  });
});

// Server.js ang naglalagay ng /api/auth prefix sa router na ito.
module.exports = router;

