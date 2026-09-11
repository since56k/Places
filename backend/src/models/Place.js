import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    caption: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Place', placeSchema);
