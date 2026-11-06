import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "convotools_savefrom_access";
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

export { COOKIE_NAME, TOKEN_LIFETIME_SECONDS };

export function savefromSecretConfigured() {
  const secret = process.env.SAVEFROM_ACCESS_KEY || "";
  return secret.length >= 32;
}

export function createSavefromToken(expiresAt: number) {
  const secret = process.env.SAVEFROM_ACCESS_KEY;
  if (!secret || secret.length < 32) throw new Error("SAVEFROM_ACCESS_KEY must contain at least 32 characters.");
  const expiry = String(expiresAt);
  const signature = createHmac("sha256", secret).update(expiry).digest("hex");
  return expiry + "." + signature;
}

export function verifySavefromToken(token?: string) {
  const secret = process.env.SAVEFROM_ACCESS_KEY;
  if (!secret || secret.length < 32 || !token) return false;
  const [expiry, signature, extra] = token.split(".");
  if (!expiry || !signature || extra !== undefined) return false;
  const expiresAt = Number(expiry);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;
  const expected = createHmac("sha256", secret).update(expiry).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, "hex"); } catch { return false; }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
