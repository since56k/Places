import { Router } from 'express';
import List from '../models/List.js';
import SavedPlace from '../models/SavedPlace.js';

const router = Router();
const DEFAULT_USER = 'test-user';

function cleanTags(tags = []) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

async function resolveLists(userKey, names = []) {
  const cleanNames = [...new Set(names.map((name) => name.trim()).filter(Boolean))];

  return Promise.all(cleanNames.map((name) => List.findOneAndUpdate(
    { userKey, name },
    { $setOnInsert: { userKey, name } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )));
}

router.get('/', async (req, res, next) => {
  try {
    const userKey = req.query.userKey || DEFAULT_USER;
    const savedPlaces = await SavedPlace.find({ userKey })
      .populate('place')
      .populate('lists')
      .sort({ updatedAt: -1 });

    res.json(savedPlaces);
  } catch (error) {
    next(error);
  }
});

router.put('/:placeId', async (req, res, next) => {
  try {
    const userKey = req.body.userKey || DEFAULT_USER;
    const lists = await resolveLists(userKey, req.body.lists || []);

    const savedPlace = await SavedPlace.findOneAndUpdate(
      { userKey, place: req.params.placeId },
      {
        userKey,
        place: req.params.placeId,
        status: req.body.status || 'want_to_go',
        rating: req.body.rating ?? 0,
        price: req.body.price ?? 1,
        note: req.body.note?.trim() || '',
        tags: cleanTags(req.body.tags),
        lists: lists.map((list) => list._id),
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )
      .populate('place')
      .populate('lists');

    res.json(savedPlace);
  } catch (error) {
    next(error);
  }
});

router.delete('/:placeId', async (req, res, next) => {
  try {
    const userKey = req.query.userKey || DEFAULT_USER;
    const savedPlace = await SavedPlace.findOneAndDelete({ userKey, place: req.params.placeId });

    if (!savedPlace) {
      return res.status(404).json({ message: 'Saved place not found' });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
