import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const doctors = await db.doctor.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(doctors);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const doctor = await db.doctor.create({ data: body });
    return NextResponse.json({ success: true, doctor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}