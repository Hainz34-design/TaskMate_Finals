const path = require('node:path');

require('dotenv').config({ path: path.resolve(process.cwd(), 'Database', '.env') });

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const profileRoutes = require('./routes/profile');   // near the other requires
const accountRoutes = require('./routes/account');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);


app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production'
      && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');

    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      callback(null, true);
      return;
    }

    const error = new Error('Origin is not allowed');
    error.code = 'CORS_ORIGIN_DENIED';
    callback(error);
  },
}));
app.use('/api/profile', express.json({ limit: '3mb' }), profileRoutes);
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/account', accountRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error.code === 'CORS_ORIGIN_DENIED') {
    res.status(403).json({ message: 'This origin is not allowed' });
    return;
  }

  if (error.code === 11000) {
    res.status(409).json({ message: 'An account with this email already exists' });
    return;
  }

  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON request body' });
    return;
  }

  const status = Number.isInteger(error.status) && error.status < 500 ? error.status : 500;
  if (status === 500) {
    console.error('Request failed:', error.name || 'Error');
    res.status(status).json({ message: 'An unexpected server error occurred' });
    return;
  }

  res.status(status).json({ message: error.message });
});

async function startServer() {
  const mongoUri = process.env.MONGODB_URI?.trim();
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!mongoUri || !/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    throw new Error('Set a valid MONGODB_URI in Database/.env');
  }

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('Set a random JWT_SECRET of at least 32 characters in Database/.env');
  }

  await mongoose.connect(mongoUri);

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`TaskMate API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Could not start TaskMate API:', error.name === 'MongooseServerSelectionError'
      ? 'Could not connect to MongoDB. Check the URI and Atlas network access.'
      : error.message);
    process.exitCode = 1;
  });
}


module.exports = app;