import connectDB from "@/lib/db";
import RevisionProgress from "@/models/RevisionProgress";
import UserDetails from "@/models/Logindetails";
import { getJWTPayload } from "@/utils/auth";
import { cookies } from "next/headers";

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

  try {
    const progress = await RevisionProgress.find({ userId: user._id });
    const revisedCardIds = progress.map((entry) => entry.cardId.toString());

    return Response.json({ revisedCardIds });
  } catch (error) {
    console.error("❌ Error fetching revision progress:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
