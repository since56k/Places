import { Router } from 'express';
import List from '../models/List.js';

const router = Router();
const DEFAULT_USER = 'test-user';

router.get('/', async (req, res, next) => {
  try {
    const userKey = req.query.userKey || DEFAULT_USER;
    const lists = await List.find({ userKey }).sort({ name: 1 });
    res.json(lists);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userKey = req.body.userKey || DEFAULT_USER;
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

router.delete('/:id', async (req, res, next) => {
  try {
    const userKey = req.query.userKey || DEFAULT_USER;
    const list = await List.findOneAndDelete({ _id: req.params.id, userKey });

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
