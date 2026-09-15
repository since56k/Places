import { Router } from 'express';
import Place from '../models/Place.js';
import SavedPlace from '../models/SavedPlace.js';

const router = Router();

function exactCaseInsensitive(value = '') {
  const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
}

function canManagePlace(req, place) {
  if (req.user.role === 'admin') return true;
  return place.createdBy && String(place.createdBy) === String(req.user._id);
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

    const place = await Place.create({ ...req.body, createdBy: req.user._id });
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
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    if (!canManagePlace(req, place)) {
      return res.status(403).json({ message: 'You can only edit places you created' });
    }

    const nextName = req.body.name?.trim() || place.name;
    const nextCity = req.body.city?.trim() || place.city;
    const nextCountry = req.body.country?.trim() || place.country;

    const duplicate = await Place.findOne({
      _id: { $ne: place._id },
      name: exactCaseInsensitive(nextName),
      city: exactCaseInsensitive(nextCity),
      country: exactCaseInsensitive(nextCountry),
    });

    if (duplicate) {
      return res.status(409).json({ message: 'This place is already in Places.' });
    }

    const allowed = ['name', 'type', 'city', 'country', 'address', 'caption', 'description', 'imageUrl', 'location'];
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) place[key] = req.body[key];
    });
    await place.save();
    res.json(place);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    if (!canManagePlace(req, place)) {
      return res.status(403).json({ message: 'You can only delete places you created' });
    }

    await Place.deleteOne({ _id: place._id });
    await SavedPlace.deleteMany({ place: place._id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
