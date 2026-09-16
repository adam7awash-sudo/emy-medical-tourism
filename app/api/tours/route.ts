import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensure-schema";

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { active: true };
    if (category && category !== "all") {
      where.category = category;
    }

    const tours = await db.tour.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }],
    });
    return NextResponse.json(tours);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const tour = await db.tour.create({ data: body });
    return NextResponse.json({ success: true, tour }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}