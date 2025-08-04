import connectDB from "@/lib/db";
import RevisionProgress from "@/models/RevisionProgress";
import UserDetails from "@/models/Logindetails"; // ✅ your user model
import { getJWTPayload } from "@/utils/auth";
import { cookies } from "next/headers";

export async function POST(req) {
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

  const body = await req.json();
  const { cardId } = body;

  if (!cardId) {
    return Response.json({ error: "Missing cardId" }, { status: 400 });
  }

  try {
    const progress = await RevisionProgress.findOneAndUpdate(
      { userId: user._id, cardId },
      { revisedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log("✅ Revision progress saved:", progress);
    return Response.json({ success: true, progress });
  } catch (error) {
    console.error("❌ Error saving revision:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
