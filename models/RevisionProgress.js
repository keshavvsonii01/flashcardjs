import mongoose from "mongoose";

const RevisionProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails", required: true },
  cardId: { type: String, required: true },
  topic: { type: String, required: true },
  revisedAt: { type: Date, default: Date.now },
});

export default mongoose.models.RevisionProgress ||
  mongoose.model("RevisionProgress", RevisionProgressSchema);
