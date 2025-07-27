import { jwtVerify } from "jose";

export async function getJWTPayload(token) {
  const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}
