const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { Buffer } = require('node:buffer');
const jwt = require('jsonwebtoken');
const LoginEvent = require('../models/LoginEvent');
const User = require('../models/User');

// etong auth file, pag mag sign up ang user tinitignan muna kung valid ang email at password,
// kung valid, iha-hash ang password at ise-save sa database. Pag mag login naman, iche-check kung tama ang password.
const router = Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function createToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}


function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}


router.post('/register', async (req, res) => {
  
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  
  if (fullName.length < 2 || fullName.length > 100) {
    res.status(400).json({ message: 'Full name must be between 2 and 100 characters' });
    return;
  }

  
  if (email.length > 254 || !emailPattern.test(email)) {
    res.status(400).json({ message: 'Enter a valid email address' });
    return;
  }

  const passwordBytes = Buffer.byteLength(password, 'utf8');
  if (passwordBytes < 8 || passwordBytes > 72) {
    res.status(400).json({ message: 'Password must be between 8 and 72 bytes' });
    return;
  }

  const existingUser = await User.exists({ email });
  if (existingUser) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, email, passwordHash });

  
  res.status(201).json({
    user: publicUser(user),
    token: createToken(user.id),
  });
});


router.post('/login', async (req, res) => {
  
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!emailPattern.test(email) || password.length === 0) {
    res.status(400).json({ message: 'Enter a valid email address and password' });
    return;
  }

  
  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

  
  if (!passwordMatches) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  
  await LoginEvent.create({ userId: user.id, email: user.email });

  
  res.json({
    user: publicUser(user),
    token: createToken(user.id),
  });
});


module.exports = router;

