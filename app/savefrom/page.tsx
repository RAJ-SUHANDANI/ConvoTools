import type { Metadata } from "next";
import { cookies } from "next/headers";
import SavefromGate from "@/components/SavefromGate";
import PrivateSavefrom from "@/components/PrivateSavefrom";
import { COOKIE_NAME, savefromCredentialsConfigured, verifySavefromToken } from "@/lib/savefrom-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Private workspace · ConvoTools",
  description: "Private, access-controlled media link workspace.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function SavefromPage() {
  const configured = savefromCredentialsConfigured();
  const jar = await cookies();
  const authorized = configured && verifySavefromToken(jar.get(COOKIE_NAME)?.value);
  return authorized ? <PrivateSavefrom /> : <SavefromGate configured={configured} />;
}
