// /api/revision/get
import connectDB from "@/lib/db";
import RevisionProgress from "@/models/RevisionProgress";
import UserDetails from "@/models/Logindetails";
import { getJWTPayload } from "@/utils/auth";
import { cookies } from "next/headers";

export async function GET() {
  await connectDB();

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return Response.json({ revisedCardIds: [] }, { status: 200 }); // return empty array if not logged in
  }

  let payload;
  try {
    payload = await getJWTPayload(token);
  } catch {
    return Response.json({ revisedCardIds: [] }, { status: 200 });
  }

  const user = await UserDetails.findOne({ email: payload.email });
  if (!user) {
    return Response.json({ revisedCardIds: [] }, { status: 200 });
  }

  try {
    const progress = await RevisionProgress.find({ userId: user._id });

    const revisedCardIds = progress.map((entry) =>
      entry.cardId.toString()
    );

    return Response.json({ revisedCardIds }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching revision progress:", error);
    return Response.json({ revisedCardIds: [] }, { status: 200 });
  }
}
