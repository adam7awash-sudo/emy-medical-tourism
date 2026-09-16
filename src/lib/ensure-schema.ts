/**
 * شفاء ذاتي لقاعدة البيانات (Postgres) — يضمن وجود كل الجداول والأعمدة.
 *
 * المشكلة التي يحلها: القاعدة الحقيقية على Vercel اتعملت قبل إضافة أعمدة
 * (مثل videoUrl في المعرض) فبتبوظ كل استعلامات Prisma بـ 500.
 * الحل: أول API request يشغّل CREATE TABLE IF NOT EXISTS +
 * ALTER TABLE ADD COLUMN IF NOT EXISTS لكل الحقول، مرة واحدة فقط لكل نسخة.
 */

let schemaPromise: Promise<boolean> | null = null;

export function ensureSchema(): Promise<boolean> {
  if (!schemaPromise) {
    schemaPromise = run().catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[ensure-schema] failed:", msg);
      schemaPromise = null; // اسمح بإعادة المحاولة في الطلب الجاي
      return false;
    }) as Promise<boolean>;
  }
  return schemaPromise;
}

async function run(): Promise<boolean> {
  const dbc = (await import("@/lib/db")).db;

  const stmts: string[] = [
    `CREATE TABLE IF NOT EXISTS "Admin" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL DEFAULT 'Admin',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "SiteSetting" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT NOT NULL UNIQUE,
      "value" TEXT NOT NULL DEFAULT '',
      "type" TEXT NOT NULL DEFAULT 'text'
    )`,
    `CREATE TABLE IF NOT EXISTS "HomepageContent" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT NOT NULL UNIQUE,
      "valueAr" TEXT NOT NULL DEFAULT '',
      "valueEn" TEXT NOT NULL DEFAULT '',
      "type" TEXT NOT NULL DEFAULT 'text'
    )`,
    `CREATE TABLE IF NOT EXISTS "GalleryImage" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL DEFAULT '',
      "image" TEXT NOT NULL,
      "videoUrl" TEXT NOT NULL DEFAULT '',
      "category" TEXT NOT NULL DEFAULT 'general',
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Booking" (
      "id" TEXT PRIMARY KEY,
      "patientName" TEXT NOT NULL,
      "country" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "specialtyId" TEXT,
      "specialtyName" TEXT,
      "preferredDoctorId" TEXT,
      "preferredDoctorName" TEXT,
      "notes" TEXT,
      "reports" TEXT NOT NULL DEFAULT '[]',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Doctor" (
      "id" TEXT PRIMARY KEY,
      "nameAr" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "titleAr" TEXT NOT NULL,
      "titleEn" TEXT NOT NULL DEFAULT '',
      "specialtyId" TEXT,
      "image" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Specialty" (
      "id" TEXT PRIMARY KEY,
      "nameAr" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "icon" TEXT NOT NULL DEFAULT '',
      "image" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Service" (
      "id" TEXT PRIMARY KEY,
      "nameAr" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "icon" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Partner" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "logo" TEXT NOT NULL DEFAULT '',
      "url" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "PatientStory" (
      "id" TEXT PRIMARY KEY,
      "nameAr" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "country" TEXT NOT NULL DEFAULT '',
      "storyAr" TEXT NOT NULL,
      "storyEn" TEXT NOT NULL DEFAULT '',
      "image" TEXT NOT NULL DEFAULT '',
      "rating" INTEGER NOT NULL DEFAULT 5,
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Tour" (
      "id" TEXT PRIMARY KEY,
      "nameAr" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "descriptionAr" TEXT NOT NULL DEFAULT '',
      "descriptionEn" TEXT NOT NULL DEFAULT '',
      "image" TEXT NOT NULL DEFAULT '',
      "price" TEXT NOT NULL DEFAULT '',
      "duration" TEXT NOT NULL DEFAULT '',
      "locationAr" TEXT NOT NULL DEFAULT '',
      "locationEn" TEXT NOT NULL DEFAULT '',
      "includesAr" TEXT NOT NULL DEFAULT '',
      "includesEn" TEXT NOT NULL DEFAULT '',
      "category" TEXT NOT NULL DEFAULT 'tourism',
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    // أعمدة ناقصة محتملة على قواعد قديمة (أهمها videoUrl بتاع المعرض)
    `ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'general'`,
    `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "reports" TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "preferredDoctorId" TEXT`,
    `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "preferredDoctorName" TEXT`,
    `ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Admin'`,
  ];

  for (const sql of stmts) {
    await dbc.$executeRawUnsafe(sql);
  }
  return true;
}
