import mongoose from "mongoose";

const FlashCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserDetails",
    required: true,
  },
  topic: String,
  difficulty: String,
  cumCards: Number,
  cards: [
    {
      question: String,
      answer: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const FlashCardDetail =   mongoose.models.FlashCard || mongoose.model("FlashCard", FlashCardSchema);

export default FlashCardDetail;