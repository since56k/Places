import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import placesRouter from './routes/places.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'places-api' });
});

app.use('/api/places', placesRouter);

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
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
