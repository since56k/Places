import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    userKey: { type: String, default: 'test-user', index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('List', listSchema);
