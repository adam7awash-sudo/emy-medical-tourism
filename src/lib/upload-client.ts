/**
 * أداة رفع موحدة على العميل — تقسّم الملفات الكبيرة تلقائيًا لقطع صغيرة
 * (تتجاوز حد الطلب 4.5MB على Vercel) وترفعها قطعة قطعة ثم تجمعها على السيرفر.
 *
 * الاستخدام:  const url = await uploadFile(file)
 */

const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB لكل قطعة (أقل من حد المنصة)

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
  // ملف صغير → دفعة واحدة
  if (file.size <= CHUNK_SIZE) {
    onProgress?.(30);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await errorText(res));
    const data = await res.json();
    if (!data?.url) throw new Error("No URL returned");
    onProgress?.(100);
    return data.url as string;
  }

  // ملف كبير → تقسيم ورفع قطعة قطعة
  const total = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  for (let i = 0; i < total; i++) {
    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
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
    body: JSON.stringify({ uploadId, total, mime: file.type || "application/octet-stream", name: file.name }),
  });
  if (!finRes.ok) throw new Error(await errorText(finRes));
  const finData = await finRes.json();
  if (!finData?.url) throw new Error("No URL returned");
  onProgress?.(100);
  return finData.url as string;
}
