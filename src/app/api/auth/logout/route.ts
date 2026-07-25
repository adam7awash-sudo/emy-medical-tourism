import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("emt_session", "", { maxAge: 0, path: "/" });
  response.cookies.set("emt_admin_id", "", { maxAge: 0, path: "/" });
  return response;
}