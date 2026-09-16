/**
 * أداة رفع موحدة على العميل — تقسّم الملفات الكبيرة تلقائيًا لقطع صغيرة
 * (تتجاوز حد الطلب 4.5MB على Vercel) وترفعها قطعة قطعة ثم تجمعها على السيرفر.
 *
 * الاستخدام:  const url = await uploadFile(file)
 */

const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB لكل قطعة (أقل من حد المنصة)

/**
 * ضغط الصور على جهاز المستخدم قبل الرفع (أهم عامل في سرعة الموقع):
 * - تصغير الأبعاد لأقصى 1920px
 * - تحويل لـ JPEG بجودة 0.85
 * يُتجاهَل GIF وSVG والملفات غير الصورية.
 */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  // الصغيرة أصلاً سيبها زي ما هي
  if (file.size <= 300 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1920;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
    );
    if (!blob || blob.size >= file.size) return file; // الضغط ما فيدهاش نفع — الأصل أفضل
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // أي مشكلة → الرفع بالأصل
  }
}

async function errorText(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error || `فشل الرفع (${res.status})`;
  } catch {
    return `فشل الرفع (${res.status})`;
  }
}

export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  // ضغط الصور أولًا (بيقلل حجم المخزن ويسرّع عرض الموقع)
  onProgress?.(5);
  const out = await compressImage(file);

  // ملف صغير → دفعة واحدة
  if (out.size <= CHUNK_SIZE) {
    onProgress?.(30);
    const fd = new FormData();
    fd.append("file", out);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await errorText(res));
    const data = await res.json();
    if (!data?.url) throw new Error("No URL returned");
    onProgress?.(100);
    return data.url as string;
  }

  // ملف كبير → تقسيم ورفع قطعة قطعة
  const total = Math.ceil(out.size / CHUNK_SIZE);
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  for (let i = 0; i < total; i++) {
    const chunk = out.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const fd = new FormData();
    fd.append("uploadId", uploadId);
    fd.append("index", String(i));
    fd.append("chunk", chunk, "chunk");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await errorText(res));
    onProgress?.(Math.round(((i + 1) / total) * 90));
  }

  const finRes = await fetch("/api/upload/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId, total, mime: out.type || "application/octet-stream", name: out.name }),
  });
  if (!finRes.ok) throw new Error(await errorText(finRes));
  const finData = await finRes.json();
  if (!finData?.url) throw new Error("No URL returned");
  onProgress?.(100);
  return finData.url as string;
}
