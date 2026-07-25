import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBookingNotificationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { patientName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { country: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      db.booking.count({ where }),
    ]);

    return NextResponse.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const booking = await db.booking.create({
      data: {
        patientName: body.patientName,
        country: body.country,
        phone: body.phone,
        email: body.email || null,
        specialtyId: body.specialtyId || null,
        specialtyName: body.specialtyName || null,
        preferredDoctorId: body.preferredDoctorId || null,
        preferredDoctorName: body.preferredDoctorName || null,
        notes: body.notes || null,
        reports: body.reports || "[]",
        status: "pending",
      },
    });

    // Send email notification asynchronously (don't block the response)
    const sendEmail = async () => {
      try {
        // Get Resend API key from settings
        const apiKeySetting = await db.siteSetting.findUnique({ where: { key: "resend_api_key" } });
        const apiKey = apiKeySetting?.value || "";
        
        // Get admin email from settings
        const adminEmailSetting = await db.siteSetting.findUnique({ where: { key: "email" } });
        const adminEmail = adminEmailSetting?.value || "Emyhawash71@gmail.com";

        if (apiKey) {
          await sendBookingNotificationEmail(
            {
              patientName: booking.patientName,
              country: booking.country,
              phone: booking.phone,
              email: booking.email,
              specialtyName: booking.specialtyName,
              preferredDoctorName: booking.preferredDoctorName,
              notes: booking.notes,
              createdAt: booking.createdAt,
            },
            apiKey,
            adminEmail
          );
        }
      } catch (err) {
        console.error("Background email send failed:", err);
      }
    };
    sendEmail(); // fire and forget

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}