import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import placesRouter from './routes/places.js';
import listsRouter from './routes/lists.js';
import savedPlacesRouter from './routes/savedPlaces.js';
import requireAuth from './middleware/requireAuth.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '8mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'places-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/places', requireAuth, placesRouter);
app.use('/api/lists', requireAuth, listsRouter);
app.use('/api/saved-places', requireAuth, savedPlacesRouter);

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error?.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error?.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource identifier' });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Photo is too large. Choose a smaller image.' });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }
  if (!process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET is required');
  }

  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Places API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start Places API', error);
  process.exit(1);
});
