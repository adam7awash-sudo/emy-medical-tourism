import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const adminId = request.cookies.get("emt_admin_id")?.value;
    const session = request.cookies.get("emt_session")?.value;
    if (!adminId || !session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}