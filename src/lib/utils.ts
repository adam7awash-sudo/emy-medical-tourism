import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const bookingStatuses = [
  { value: "pending", labelAr: "قيد المراجعة", labelEn: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
  { value: "contacted", labelAr: "تم التواصل", labelEn: "Contacted", color: "bg-blue-100 text-blue-800" },
  { value: "scheduled", labelAr: "تم تحديد الموعد", labelEn: "Appointment Scheduled", color: "bg-purple-100 text-purple-800" },
  { value: "waiting_travel", labelAr: "في انتظار السفر", labelEn: "Waiting For Travel", color: "bg-orange-100 text-orange-800" },
  { value: "completed", labelAr: "تم العلاج", labelEn: "Treatment Completed", color: "bg-green-100 text-green-800" },
  { value: "closed", labelAr: "مغلق", labelEn: "Closed", color: "bg-gray-100 text-gray-800" },
] as const;

export function getStatusLabel(status: string, lang: "ar" | "en" = "ar") {
  const s = bookingStatuses.find((b) => b.value === status);
  return s ? (lang === "ar" ? s.labelAr : s.labelEn) : status;
}

export function getStatusColor(status: string) {
  const s = bookingStatuses.find((b) => b.value === status);
  return s?.color || "bg-gray-100 text-gray-800";
}

export const WHATSAPP_DEFAULT = "201117009641";
export const EMAIL_DEFAULT = "Emyhawash71@gmail.com";

export function getWhatsAppLink(number?: string, message?: string) {
  const phone = number || WHATSAPP_DEFAULT;
  const msg = message || "السلام عليكم، أريد الاستفسار عن العلاج في مصر.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}