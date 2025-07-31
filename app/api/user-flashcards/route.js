import connectDB from "@/lib/db";
import FlashCardDetail from "@/models/FlashCardSchema";
import { getJWTPayload } from "@/utils/auth";
import { cookies } from "next/headers";
import UserDetails from "@/models/Logindetails"; // ✅ Use this as the user model

export async function GET(req) {
  await connectDB();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("❌ No token found");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await getJWTPayload(token);
    console.log("✅ JWT Payload:", payload);
  } catch (error) {
    console.log("❌ Error decoding token:", error);
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await UserDetails.findOne({ email: payload.email });
  if (!user) {
    console.log("❌ No user found for email:", payload.email);
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  console.log("✅ Found user:", user._id);

  const flashcards = await FlashCardDetail.find({ userId: user._id }).sort({
    createdAt: -1,
  });
  console.log("✅ Flashcards found:", flashcards.length);

  const grouped = {};
  flashcards.forEach((card) => {
    const date = new Date(card.createdAt).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(card);
  });

  return Response.json(grouped);
}
