import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { COOKIE_NAME, TOKEN_LIFETIME_SECONDS, createSavefromToken, savefromSecretConfigured } from "@/lib/savefrom-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return a.length === b.length && requireTimingSafeEqual(a, b);
}
function requireTimingSafeEqual(a: Buffer, b: Buffer) {
  // Fixed-length SHA-256 digests make the constant-time comparison safe.
  return timingSafeEqualDigest(a, b);
}
import { timingSafeEqual as timingSafeEqualDigest } from "node:crypto";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request origin rejected." }, { status: 403 });
  }
  if (!savefromSecretConfigured()) {
    return NextResponse.json({ error: "Private access has not been configured on this deployment." }, { status: 503 });
  }
  const body = await request.json().catch(() => null) as { accessKey?: unknown } | null;
  const accessKey = typeof body?.accessKey === "string" ? body.accessKey : "";
  if (!safeEqual(accessKey, process.env.SAVEFROM_ACCESS_KEY || "")) {
    return NextResponse.json({ error: "Access key not recognized." }, { status: 401 });
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
