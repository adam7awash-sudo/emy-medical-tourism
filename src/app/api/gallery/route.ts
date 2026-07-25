import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const images = await db.galleryImage.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(images);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const image = await db.galleryImage.create({ data: body });
    return NextResponse.json({ success: true, image }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}