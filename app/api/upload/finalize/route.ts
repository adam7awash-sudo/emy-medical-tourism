import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeBuffer, MAX_FILE, cleanupStaleChunks, storageErrorMessage } from "@/lib/media-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * تجميع قطع الرفع الكبير:
 * POST { uploadId, total, mime, name }  →  { url }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uploadId = String(body.uploadId || "");
    const total = parseInt(String(body.total || "0"), 10);
    const mime = String(body.mime || "application/octet-stream");
    const name = String(body.name || "file");

    if (!/^[0-9]+-[a-z0-9]+$/.test(uploadId) || !total || total < 1 || total > 200) {
      return NextResponse.json({ error: "Invalid finalize payload" }, { status: 400 });
    }

    // جلب كل القطع
    const rows = await db.siteSetting.findMany({
      where: { key: { startsWith: `upl:${uploadId}:` } },
    });
    if (rows.length !== total) {
      return NextResponse.json(
        { error: `Missing chunks: received ${rows.length}/${total}` },
        { status: 400 }
      );
    }

    // ترتيب وتجميع
    const sorted = rows.sort(
      (a, b) => parseInt(a.key.split(":")[2] || "0", 10) - parseInt(b.key.split(":")[2] || "0", 10)
    );
    const parts = sorted.map((r) => Buffer.from(r.value, "base64"));
    const totalSize = parts.reduce((s, p) => s + p.length, 0);
    if (totalSize > MAX_FILE) {
      await db.siteSetting.deleteMany({ where: { key: { startsWith: `upl:${uploadId}:` } } });
      return NextResponse.json({ error: "Too large (max 100MB)" }, { status: 400 });
    }
    const buffer = Buffer.concat(parts);

    // التخزين النهائي
    const { url, storage } = await storeBuffer(buffer, mime, name);

    // حذف القطع المؤقتة
    await db.siteSetting.deleteMany({ where: { key: { startsWith: `upl:${uploadId}:` } } });

    // فرصة تنظيف عشوائية
    if (Math.random() < 0.1) { cleanupStaleChunks().catch(() => {}); }

    return NextResponse.json({ success: true, url, storage, mimeType: mime });
  } catch (error) {
    console.error("Finalize error:", error);
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 500 });
  }
}
