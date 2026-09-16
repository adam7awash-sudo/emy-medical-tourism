import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensure-schema";

export const runtime = "nodejs";

/**
 * نسخة احتياطية كاملة للقاعدة (JSON) — للأدمن فقط.
 * GET /api/backup → ملف emt-backup-<date>.json يحتوي كل الجداول
 * + معلومات القاعدة (بدون كلمات سر) عشان تحفظها عندك.
 */
export async function GET(request: NextRequest) {
  const adminId = request.cookies.get("emt_admin_id")?.value;
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized — ادخل الأدمن الأول" }, { status: 401 });
  }

  try {
    await ensureSchema();
    const [admins, bookings, doctors, specialties, services, partners, stories, siteSettings, gallery, homepage, tours] =
      await Promise.all([
        db.admin.findMany({ select: { id: true, email: true, name: true, createdAt: true } }), // بدون كلمات السر
        db.booking.findMany(),
        db.doctor.findMany(),
        db.specialty.findMany(),
        db.service.findMany(),
        db.partner.findMany(),
        db.patientStory.findMany(),
        db.siteSetting.findMany(),
        db.galleryImage.findMany(),
        db.homepageContent.findMany(),
        db.tour.findMany(),
      ]);

    // نوع/مكان القاعدة بدون كلمات سر — عشان تعرف فين القاعدة بتاعتك
    const url = process.env.DATABASE_URL || "";
    let dbInfo = { provider: "postgresql", host: "غير معروف", database: "" };
    try {
      const u = new URL(url.replace(/^postgres(ql)?:\/\//, "https://"));
      dbInfo = {
        provider: "postgresql",
        host: u.hostname,
        database: decodeURIComponent(u.pathname.replace("/", "")),
      };
    } catch {
      /* تجاهل */
    }

    const backup = {
      _meta: {
        app: "EMT — إيمي للسياحة العلاجية",
        exportedAt: new Date().toISOString(),
        counts: {
          admins: admins.length,
          bookings: bookings.length,
          doctors: doctors.length,
          specialties: specialties.length,
          services: services.length,
          partners: partners.length,
          stories: stories.length,
          siteSettings: siteSettings.length,
          gallery: gallery.length,
          homepage: homepage.length,
          tours: tours.length,
        },
        database: dbInfo,
        note: "مكان القاعدة الأصلي: vercel.com → مشروعك → Settings → Environment Variables → DATABASE_URL",
      },
      admins,
      bookings,
      doctors,
      specialties,
      services,
      partners,
      stories,
      siteSettings,
      gallery,
      homepage,
      tours,
    };

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="emt-backup-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[backup]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "فشل إنشاء النسخة الاحتياطية" }, { status: 500 });
  }
}
