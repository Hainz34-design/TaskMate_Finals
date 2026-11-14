const path = require('node:path');

// I-load ang MongoDB URI at JWT secret; hindi kasama sa Expo app ang file na ito.
require('dotenv').config({ path: path.resolve(process.cwd(), 'Database', '.env') });

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
// Hatiin ang CLIENT_ORIGINS sa allowlist na gagamitin ng browser CORS check.
const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Walang Origin header ang native app; payagan ito at local web sa dev mode.
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
// I-parse ang JSON bodies at tanggihan ang payload na lampas 10 KB.
app.use(express.json({ limit: '10kb' }));

// Health check: 1 ang Mongoose state kapag nakakonekta sa MongoDB.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Idagdag ang /api/auth prefix bago ipasa ang request sa register/login routes.
app.use('/api/auth', authRoutes);

// Sagutin ang URL na walang katumbas na route para hindi mag-hang ang request.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Isalin ang database, CORS, at JSON errors sa HTTP status at JSON message.
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

// I-validate ang secrets, kumonekta sa Atlas, saka magsimulang tumanggap ng requests.
async function startServer() {
  const mongoUri = process.env.MONGODB_URI?.trim();
  const jwtSecret = process.env.JWT_SECRET?.trim();

  // Huwag mag-start kung walang usable Mongo URI o sapat na JWT signing secret.
  if (!mongoUri || !/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    throw new Error('Set a valid MONGODB_URI in Database/.env');
  }

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('Set a random JWT_SECRET of at least 32 characters in Database/.env');
  }

  // Kapag pumalya ang connection, hindi magbubukas ang API na walang database.
  await mongoose.connect(mongoUri);

  // Gamitin ang PORT setting; 5000 ang default para sa local testing.
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`TaskMate API listening on port ${port}`);
  });
}

// I-start lang ang listener kapag direktang pinatakbo ang Server.js.
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Could not start TaskMate API:', error.name === 'MongooseServerSelectionError'
      ? 'Could not connect to MongoDB. Check the URI and Atlas network access.'
      : error.message);
    process.exitCode = 1;
  });
}

// I-export ang app para ma-test nang hindi kailangang buksan ang server port.
module.exports = app;