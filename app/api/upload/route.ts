import { NextRequest, NextResponse } from "next/server";
import {
  storeBuffer, cleanupStaleChunks, mimeAllowed, mimeFromName,
  MAX_FILE, CHUNK_SIZE_LIMIT,
} from "@/lib/media-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * نظام رفع موحد — يدعم:
 * 1) ملف صغير دفعة واحدة:  FormData { file }
 * 2) ملف كبير مقسّم:       FormData { uploadId, index, chunk }  ثم  POST /api/upload/finalize
 *
 * التخزين: Vercel Blob إن كان الـ token متاح، وإلا قاعدة البيانات (SiteSetting) وتُخدم عبر /api/files/[id]
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ---- مسار القطع (ملف كبير مقسّم) ----
    const uploadId = formData.get("uploadId") as string | null;
    const indexRaw = formData.get("index") as string | null;
    if (uploadId && indexRaw !== null) {
      const chunk = formData.get("chunk") as File | null;
      if (!chunk) return NextResponse.json({ error: "No chunk" }, { status: 400 });
      if (chunk.size > CHUNK_SIZE_LIMIT) {
        return NextResponse.json({ error: "Chunk too large" }, { status: 400 });
      }
      const index = parseInt(indexRaw, 10);
      if (isNaN(index) || index < 0 || index > 200) {
        return NextResponse.json({ error: "Invalid index" }, { status: 400 });
      }
      // uploadId شكله: <timestamp>-<random>
      const ts = parseInt(uploadId.split("-")[0] || "0", 10);
      if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: "Invalid upload id" }, { status: 400 });
      }
      const buf = Buffer.from(await chunk.arrayBuffer());
      await dbChunkStore(uploadId, index, buf);
      return NextResponse.json({ ok: true, received: index });
    }

    // ---- مسار الملف الدفعة الواحدة ----
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > MAX_FILE) {
      return NextResponse.json({ error: "Too large (max 100MB)" }, { status: 400 });
    }
    const mime = file.type || mimeFromName(file.name);
    if (!mimeAllowed(mime, file.name)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, storage } = await storeBuffer(buffer, mime || "application/octet-stream", file.name);

    // فرصة تنظيف عشوائية للقطع القديمة
    if (Math.random() < 0.1) { cleanupStaleChunks().catch(() => {}); }

    return NextResponse.json({ success: true, url, storage, mimeType: mime });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

async function dbChunkStore(uploadId: string, index: number, buf: Buffer) {
  const { db } = await import("@/lib/db");
  await db.siteSetting.upsert({
    where: { key: `upl:${uploadId}:${index}` },
    update: { value: buf.toString("base64") },
    create: { key: `upl:${uploadId}:${index}`, value: buf.toString("base64"), type: "chunk" },
  });
}
