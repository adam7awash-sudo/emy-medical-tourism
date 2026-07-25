import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const specialties = await db.specialty.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(specialties);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const specialty = await db.specialty.create({ data: body });
    return NextResponse.json({ success: true, specialty }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}