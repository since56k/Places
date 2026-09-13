import { Router } from 'express';
import Place from '../models/Place.js';

const router = Router();

function exactCaseInsensitive(value = '') {
  const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
}

router.get('/', async (_req, res, next) => {
  try {
    const places = await Place.find().sort({ createdAt: -1 });
    res.json(places);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const city = req.body.city?.trim();
    const country = req.body.country?.trim();

    if (name && city && country) {
      const existing = await Place.findOne({
        name: exactCaseInsensitive(name),
        city: exactCaseInsensitive(city),
        country: exactCaseInsensitive(country),
      });

      if (existing) {
        return res.status(409).json({ message: 'This place is already in Places.' });
      }
    }

    const place = await Place.create(req.body);
    res.status(201).json(place);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
