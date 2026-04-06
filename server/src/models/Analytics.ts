import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    pageViews: { type: Number, default: 0 },
    lastVisit: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Analytics', analyticsSchema);
