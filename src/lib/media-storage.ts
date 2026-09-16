import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * منطق تخزين الوسائط المشترك:
 * - Vercel Blob إن كان الـ token متاح
 * - وإلا قاعدة البيانات (SiteSetting) وتُخدم عبر /api/files/[id]
 */

export const MAX_FILE = 100 * 1024 * 1024; // 100MB
export const CHUNK_SIZE_LIMIT = 3 * 1024 * 1024; // أقل من حد Vercel للطلب (4.5MB)

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", svg: "image/svg+xml", heic: "image/heic", heif: "image/heif",
  avif: "image/avif", bmp: "image/bmp", pdf: "application/pdf",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v",
  avi: "video/x-msvideo", "3gp": "video/3gpp", mkv: "video/x-matroska",
};

export function mimeAllowed(mime: string, filename: string): boolean {
  if (!mime) {
    const ext = (filename.split(".").pop() || "").toLowerCase();
    return !!EXT_MIME[ext];
  }
  if (mime.startsWith("image/") || mime.startsWith("video/")) return true;
  return mime === "application/pdf";
}

export function mimeFromName(filename: string): string {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  return EXT_MIME[ext] || "";
}

function extFrom(name: string, mime: string): string {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (ext && EXT_MIME[ext]) return ext;
  const found = Object.entries(EXT_MIME).find(([, m]) => m === mime);
  return found ? found[0] : "bin";
}

/** تخزين الـ buffer: Blob إن أمكن وإلا قاعدة البيانات */
export async function storeBuffer(
  buffer: Buffer,
  mime: string,
  filename: string
): Promise<{ url: string; storage: "blob" | "db" }> {
  // محاولة Vercel Blob أولاً
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const ext = extFrom(filename, mime);
      const pathname = `emy-media/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
      const blob = await put(pathname, buffer, {
        access: "public",
        addRandomSuffix: false,
        contentType: mime,
      });
      return { url: blob.url, storage: "blob" };
    } catch (err) {
      console.error("Blob upload failed, falling back to DB:", err);
    }
  }

  // التخزين الاحتياطي في قاعدة البيانات
  const id = crypto.randomBytes(12).toString("hex");
  await db.siteSetting.create({
    data: {
      key: `media:${id}`,
      value: `${mime}|${buffer.toString("base64")}`,
      type: "media",
    },
  });
  return { url: `/api/files/${id}`, storage: "db" };
}

/** تنظيف قطع الرفع القديمة (أكبر من 24 ساعة) */
export async function cleanupStaleChunks(): Promise<void> {
  try {
    const staleBefore = Date.now() - 24 * 60 * 60 * 1000;
    const chunks = await db.siteSetting.findMany({
      where: { key: { startsWith: "upl:" } },
      select: { key: true },
    });
    const staleKeys = chunks
      .map((c) => c.key)
      .filter((k) => {
        const ts = parseInt(k.split(":")[1] || "0", 10);
        return ts > 0 && ts < staleBefore;
      });
    if (staleKeys.length > 0) {
      await db.siteSetting.deleteMany({ where: { key: { in: staleKeys } } });
    }
  } catch (err) {
    console.error("Chunk cleanup failed:", err);
  }
}
