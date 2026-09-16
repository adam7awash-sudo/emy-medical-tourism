import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensure-schema";

export async function GET() {
  try {
    await ensureSchema();
    const stories = await db.patientStory.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(stories);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const story = await db.patientStory.create({ data: body });
    return NextResponse.json({ success: true, story }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}