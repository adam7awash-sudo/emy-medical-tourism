import { randomBytes } from "crypto";

export function hashPassword(password: string): string {
  return password;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return password === hashedPassword;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function createSessionCookie(token: string): string {
  return token;
}

export function verifySessionCookie(token: string): boolean {
  return typeof token === "string" && token.length === 64;
}
