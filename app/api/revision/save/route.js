// /api/revision/save
import connectDB from "@/lib/db";
import RevisionProgress from "@/models/RevisionProgress";
import UserDetails from "@/models/Logindetails";
import { getJWTPayload } from "@/utils/auth";
import { cookies } from "next/headers";
import mongoose from "mongoose";

export async function POST(req) {
  await connectDB();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await getJWTPayload(token);
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await UserDetails.findOne({ email: payload.email });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const { cardId, topic } = await req.json();

  if (!cardId || !topic) {
    return Response.json({ error: "Missing cardId or topic" }, { status: 400 });
  }

  let cardObjectId;
  try {
    // Fixed: Use new syntax for ObjectId conversion
    cardObjectId = new mongoose.Types.ObjectId(cardId);
  } catch {
    return Response.json({ error: "Invalid cardId format" }, { status: 400 });
  }

  try {
    // Check if already exists
    const existing = await RevisionProgress.findOne({
      userId: user._id,
      cardId: cardObjectId,
    });

    if (existing) {
      await RevisionProgress.deleteOne({ _id: existing._id });
      console.log(`Removed progress for card ${cardId}`);
      return Response.json({ success: true, action: "removed" });
    } else {
      const progress = await RevisionProgress.create({
        userId: user._id,
        cardId: cardObjectId,
        topic,
        revisedAt: new Date(),
      });
      console.log(`Added progress for card ${cardId}`);
      return Response.json({ success: true, action: "added", progress });
    }
  } catch (err) {
    console.error("❌ Error saving revision:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}