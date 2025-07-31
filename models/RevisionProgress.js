import mongoose from 'mongoose';

const RevisionProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flashcard',
    required: true,
  },
  revisedAt: {
    type: Date,
    default: Date.now,
  },
});

RevisionProgressSchema.index({ userId: 1, cardId: 1 }, { unique: true });

export default mongoose.models.RevisionProgress || mongoose.model('RevisionProgress', RevisionProgressSchema);
