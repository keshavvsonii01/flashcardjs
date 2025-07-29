import connectDB from "@/lib/db";
import UserDetails from "@/models/Logindetails";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  const { email, password } = await req.json();
  await connectDB();

  const user = await UserDetails.findOne({ email });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  // ✅ Replaced jwt.sign() with jose-compatible token creation
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(SECRET));

  return new Response(JSON.stringify({ message: "Login successful", token }), {
    status: 200,
    headers: {
      "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`,
      "Content-Type": "application/json",
    },
  });
}
