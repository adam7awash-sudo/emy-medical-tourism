import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const content = await db.homepageContent.findMany();
    const map: Record<string, { ar: string; en: string }> = {};
    content.forEach((c) => { map[c.key] = { ar: c.valueAr, en: c.valueEn }; });
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];
    for (const item of items) {
      await db.homepageContent.upsert({
        where: { key: item.key },
        update: { valueAr: item.ar || "", valueEn: item.en || "", type: item.type || "text" },
        create: { key: item.key, valueAr: item.ar || "", valueEn: item.en || "", type: item.type || "text" },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}