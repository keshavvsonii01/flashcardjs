// app/api/revision/route.js
import  connectDB  from "@/lib/db";
import { NextResponse } from "next/server";
import { getJWTPayload } from "@/utils/auth"; // or your getUserFromLocalStorage equivalent
import UserDetails from "@/models/Logindetails";

export async function GET(req) {
  try {
    await connectDB();
    const { userId } = await getJWTPayload(req); // or use getUserFromLocalStorage logic
    const user = await UserDetails.findById(userId);
    return NextResponse.json(user.revisedFlashcards || {});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get revised cards" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await getJWTPayload(req);
    const { topic, cardId, revised } = await req.json();

    const user = await UserDetails.findById(userId);
    if (!user.revisedFlashcards) user.revisedFlashcards = {};

    const cards = user.revisedFlashcards[topic] || [];

    if (revised) {
      if (!cards.includes(cardId)) cards.push(cardId);
    } else {
      user.revisedFlashcards[topic] = cards.filter((id) => id !== cardId);
    }

    user.revisedFlashcards[topic] = [...new Set(user.revisedFlashcards[topic])];
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update revision progress" }, { status: 500 });
  }
}
