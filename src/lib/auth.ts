import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(":");
  const verifyHash = createHash("sha256").update(password + salt).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

const SESSION_SECRET = process.env.SESSION_SECRET || "emt-session-secret-2024-change-in-production";

export function createSessionCookie(token: string): string {
  return token;
}

export function verifySessionCookie(token: string): boolean {
  return typeof token === "string" && token.length === 64;
}