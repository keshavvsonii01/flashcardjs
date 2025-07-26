// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, secret); // verifies token structure + expiry
    return NextResponse.next();
  } catch (err) {
    console.log('⛔ Invalid token:', err.message);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard'],
};
