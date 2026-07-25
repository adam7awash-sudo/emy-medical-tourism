import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, generateSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log("--> Login Attempt Email:", email);
    console.log("--> Login Attempt Password:", password);

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const admin = await db.admin.findUnique({ where: { email } });
    console.log("--> Found Admin in Database:", admin);

    if (!admin) {
      console.log("--> Error: Admin not found in DB!");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = verifyPassword(password, admin.password);
    console.log("--> Is Password Valid?:", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateSessionToken();
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });

    response.cookies.set("emt_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    
    response.cookies.set("emt_admin_id", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.log("--> Critical Login Error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
