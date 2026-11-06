import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "convotools_savefrom_access";
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7;
const MIN_PASSWORD_LENGTH = 8;

export { COOKIE_NAME, TOKEN_LIFETIME_SECONDS };

function safeEqual(left: string, right: string) {
  const a = createHash("sha256").update(left, "utf8").digest();
  const b = createHash("sha256").update(right, "utf8").digest();
  return timingSafeEqual(a, b);
}

export function savefromCredentialsConfigured() {
  const username = process.env.SAVEFROM_USERNAME || "";
  const password = process.env.SAVEFROM_PASSWORD || "";
  return Boolean(username.trim()) && password.length >= MIN_PASSWORD_LENGTH;
}

export function verifySavefromCredentials(username: string, password: string) {
  if (!savefromCredentialsConfigured()) return false;
  const expectedUsername = process.env.SAVEFROM_USERNAME || "";
  const expectedPassword = process.env.SAVEFROM_PASSWORD || "";
  const usernameMatches = safeEqual(username, expectedUsername);
  const passwordMatches = safeEqual(password, expectedPassword);
  return usernameMatches && passwordMatches;
}

function sessionSigningSecret() {
  const password = process.env.SAVEFROM_PASSWORD || "";
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error("SAVEFROM_PASSWORD must contain at least 8 characters.");
  }
  return createHash("sha256").update("ConvoTools private session:", "utf8").update(password, "utf8").digest();
}

export function createSavefromToken(expiresAt: number) {
  if (!savefromCredentialsConfigured()) throw new Error("Savefrom login credentials are not configured.");
  const expiry = String(expiresAt);
  const signature = createHmac("sha256", sessionSigningSecret()).update(expiry).digest("hex");
  return expiry + "." + signature;
}

export function verifySavefromToken(token?: string) {
  if (!savefromCredentialsConfigured() || !token) return false;
  const [expiry, signature, extra] = token.split(".");
  if (!expiry || !signature || extra !== undefined) return false;
  const expiresAt = Number(expiry);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;
  const expected = createHmac("sha256", sessionSigningSecret()).update(expiry).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, "hex"); } catch { return false; }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
