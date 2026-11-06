import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  TOKEN_LIFETIME_SECONDS,
  createSavefromToken,
  savefromCredentialsConfigured,
  verifySavefromCredentials,
} from "@/lib/savefrom-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  }
  if (!savefromCredentialsConfigured()) {
    return NextResponse.json({ error: "Private login has not been configured for this deployment." }, { status: 503 });
  }
  const body = await request.json().catch(() => null) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!verifySavefromCredentials(username, password)) {
    return NextResponse.json({ error: "Username or password is incorrect." }, { status: 401 });
  }
  const expiresAt = Date.now() + TOKEN_LIFETIME_SECONDS * 1000;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, createSavefromToken(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/savefrom",
    maxAge: TOKEN_LIFETIME_SECONDS,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/savefrom",
    maxAge: 0,
  });
  return response;
}
