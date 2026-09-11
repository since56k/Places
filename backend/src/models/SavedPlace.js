import mongoose from 'mongoose';

const savedPlaceSchema = new mongoose.Schema(
  {
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    userKey: { type: String, default: 'test-user', index: true },
    status: { type: String, enum: ['visited', 'want_to_go'], required: true },
    rating: { type: Number, min: 0, max: 5 },
    price: { type: Number, min: 1, max: 4 },
    note: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  },
  { timestamps: true }
);

savedPlaceSchema.index({ userKey: 1, place: 1 }, { unique: true });

export default mongoose.model('SavedPlace', savedPlaceSchema);
