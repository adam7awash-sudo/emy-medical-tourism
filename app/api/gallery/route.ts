import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensure-schema";

export async function GET() {
  try {
    await ensureSchema();
    const images = await db.galleryImage.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(images);
  } catch (e) {
    console.error("[gallery GET]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    // قبول الحقول المعروفة فقط (يمنع أخطاء Prisma من حقول غريبة)
    const data = {
      title: String(body?.title ?? ""),
      image: String(body?.image ?? ""),
      videoUrl: String(body?.videoUrl ?? ""),
      category: String(body?.category ?? "general"),
      order: Number.isFinite(Number(body?.order)) ? Math.trunc(Number(body?.order)) : 0,
      active: body?.active === undefined ? true : Boolean(body?.active),
    };
    const image = await db.galleryImage.create({ data });
    return NextResponse.json({ success: true, image }, { status: 201 });
  } catch (e) {
    console.error("[gallery POST]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
