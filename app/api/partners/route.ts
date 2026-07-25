import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const partners = await db.partner.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(partners);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const partner = await db.partner.create({ data: body });
    return NextResponse.json({ success: true, partner }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}