import { Router } from 'express';
import List from '../models/List.js';
import SavedPlace from '../models/SavedPlace.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const userKey = String(req.user._id);
    const lists = await List.find({ userKey }).sort({ name: 1 });
    res.json(lists);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userKey = String(req.user._id);
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({ message: 'List name is required' });
    }

    const list = await List.findOneAndUpdate(
      { userKey, name },
      { $setOnInsert: { userKey, name, description: req.body.description?.trim() || '' } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
});

router.patch('/by-name/:name', async (req, res, next) => {
  try {
    const userKey = String(req.user._id);
    const currentName = decodeURIComponent(req.params.name).trim();
    const nextName = req.body.name?.trim();

    if (!nextName) {
      return res.status(400).json({ message: 'List name is required' });
    }

    const list = await List.findOne({ userKey, name: currentName });
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const duplicate = await List.findOne({ userKey, name: nextName, _id: { $ne: list._id } });
    if (duplicate) {
      return res.status(409).json({ message: 'A list with this name already exists' });
    }

    list.name = nextName;
    await list.save();
    res.json(list);
  } catch (error) {
    next(error);
  }
});

router.delete('/by-name/:name', async (req, res, next) => {
  try {
    const userKey = String(req.user._id);
    const name = decodeURIComponent(req.params.name).trim();
    const list = await List.findOne({ userKey, name });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    await SavedPlace.updateMany(
      { userKey, lists: list._id },
      { $pull: { lists: list._id } }
    );
    await List.deleteOne({ _id: list._id, userKey });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userKey = String(req.user._id);
    const list = await List.findOneAndDelete({ _id: req.params.id, userKey });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    await SavedPlace.updateMany(
      { userKey, lists: list._id },
      { $pull: { lists: list._id } }
    );

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
