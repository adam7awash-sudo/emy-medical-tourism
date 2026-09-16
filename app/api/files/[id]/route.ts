import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * خدمة الملفات المخزنة في قاعدة البيانات:  GET /api/files/<id>
 * تدعم Range requests لتشغيل الفيديو بسلاسة، وتبقى الاستجابة تحت حدود المنصة.
 */

const MAX_SLICE = 3.5 * 1024 * 1024; // أقل من حد استجابة المنصة (4.5MB)

function buildHeaders(mime: string, start: number, end: number, total: number, status: number) {
  const headers = new Headers();
  headers.set("Content-Type", mime);
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (status === 206) {
    headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
  }
  return headers;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{8,40}$/.test(id)) {
      return new NextResponse("Not found", { status: 404 });
    }
    const row = await db.siteSetting.findUnique({ where: { key: `media:${id}` } });
    if (!row) return new NextResponse("Not found", { status: 404 });

    const sep = row.value.indexOf("|");
    if (sep < 0) return new NextResponse("Corrupted", { status: 500 });
    const mime = row.value.slice(0, sep) || "application/octet-stream";
    const buffer = Buffer.from(row.value.slice(sep + 1), "base64");
    const total = buffer.length;

    const rangeHeader = request.headers.get("range");
    let start = 0;
    let end = total - 1;

    if (rangeHeader) {
      const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
      if (m) {
        if (m[1] !== "") {
          start = parseInt(m[1], 10);
          if (m[2] !== "") end = parseInt(m[2], 10);
        } else if (m[2] !== "") {
          // suffix: bytes=-N (آخر N بايت)
          start = Math.max(0, total - parseInt(m[2], 10));
        }
      }
    }

    // بدون Range + ملف أكبر من الحد الآمن → نرجع أول جزء بـ 206 عشان المتصفح يكمل بـ Range
    if (!rangeHeader && total > MAX_SLICE) {
      end = start + MAX_SLICE - 1;
    }
    // قصّ أي نطاق أكبر من الحد الآمن
    if (end - start + 1 > MAX_SLICE) {
      end = start + MAX_SLICE - 1;
    }

    if (isNaN(start) || start < 0 || start >= total || end < start) {
      return new NextResponse("Range Not Satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${total}` },
      });
    }

    end = Math.min(end, total - 1);
    const slice = new Uint8Array(buffer.subarray(start, end + 1));
    const status = rangeHeader || end < total - 1 ? 206 : 200;

    return new NextResponse(slice, { status, headers: buildHeaders(mime, start, end, total, status) });
  } catch (error) {
    console.error("File serve error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function HEAD(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{8,40}$/.test(id)) return new NextResponse(null, { status: 404 });
    const row = await db.siteSetting.findUnique({
      where: { key: `media:${id}` },
      select: { value: true },
    });
    if (!row) return new NextResponse(null, { status: 404 });
    const sep = row.value.indexOf("|");
    const mime = row.value.slice(0, sep) || "application/octet-stream";
    const b64 = row.value.slice(sep + 1);
    const pad = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
    const total = Math.floor((b64.length * 3) / 4) - pad;
    return new NextResponse(null, { headers: buildHeaders(mime, 0, total - 1, total, 200) });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
