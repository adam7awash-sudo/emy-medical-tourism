import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [totalBookings, pendingBookings, contactedBookings, scheduledBookings, waitingBookings, completedBookings, totalDoctors, totalSpecialties, totalStories, totalPartners] = await Promise.all([
      db.booking.count(),
      db.booking.count({ where: { status: "pending" } }),
      db.booking.count({ where: { status: "contacted" } }),
      db.booking.count({ where: { status: "scheduled" } }),
      db.booking.count({ where: { status: "waiting_travel" } }),
      db.booking.count({ where: { status: "completed" } }),
      db.doctor.count({ where: { active: true } }),
      db.specialty.count({ where: { active: true } }),
      db.patientStory.count({ where: { active: true } }),
      db.partner.count({ where: { active: true } }),
    ]);
    return NextResponse.json({
      totalBookings, pendingBookings, contactedBookings, scheduledBookings,
      waitingBookings, completedBookings, totalDoctors, totalSpecialties,
      totalStories, totalPartners,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}