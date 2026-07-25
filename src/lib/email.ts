import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(apiKey: string): Resend | null {
  if (!apiKey || apiKey === "") return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function sendBookingNotificationEmail(booking: {
  patientName: string;
  country: string;
  phone: string;
  email?: string | null;
  specialtyName?: string | null;
  preferredDoctorName?: string | null;
  notes?: string | null;
  createdAt: Date;
}, apiKey: string, adminEmail: string) {
  const resend = getResend(apiKey);
  if (!resend) {
    console.log("Resend API key not configured, skipping email");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "EMT Bookings <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `حجز جديد - ${booking.patientName} (${booking.specialtyName || "عام"})`,
      html: `
        <div dir="rtl" style="font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0A6EBD 0%, #084A82 100%); padding: 24px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">EMT - إيمي للسياحة العلاجية</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">حجز موعد جديد</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <h2 style="color: #0A6EBD; margin: 0 0 20px; font-size: 18px;">تفاصيل الحجز</h2>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; width: 40%;">اسم المريض</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${booking.patientName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">الدولة</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${booking.country}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">رقم الهاتف</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; direction: ltr; text-align: right;">${booking.phone}</td>
              </tr>
              ${booking.email ? `
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">البريد الإلكتروني</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; direction: ltr; text-align: right;">${booking.email}</td>
              </tr>
              ` : ""}
              ${booking.specialtyName ? `
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">التخصص</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0A6EBD; font-weight: 500;">${booking.specialtyName}</td>
              </tr>
              ` : ""}
              ${booking.preferredDoctorName ? `
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">الطبيب المفضل</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${booking.preferredDoctorName}</td>
              </tr>
              ` : ""}
              ${booking.notes ? `
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">ملاحظات</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${booking.notes}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 12px 16px; background: #f1f5f9; font-weight: 600; color: #475569;">تاريخ الحجز</td>
                <td style="padding: 12px 16px; color: #1e293b; font-size: 13px;">${booking.createdAt.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}</td>
              </tr>
            </table>
            
            <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
              <p style="margin: 0; color: #1e40af; font-size: 13px; text-align: center;">
                يرجى التواصل مع المريض في أقرب وقت ممكن لتأكيد الموعد.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 16px 32px; background: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              EMT - إيمي للسياحة العلاجية | ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
    } else {
      console.log("Email sent:", data?.id);
    }
  } catch (err) {
    console.error("Failed to send booking email:", err);
  }
}