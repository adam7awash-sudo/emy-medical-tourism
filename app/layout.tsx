import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EMT - Emy Medical Tourism | السياحة العلاجية في مصر",
  description: "EMT - شركة إيمي للسياحة العلاجية. نساعد المرضى من العراق وجميع الدول العربية للوصول إلى أفضل الأطباء والعيادات المتخصصة في مصر.",
  keywords: ["سياحة علاجية", "مصر", "علاج في مصر", "EMT", "أطباء مصر", "عيادات مصر"],
  openGraph: {
    title: "EMT - Emy Medical Tourism",
    description: "Medical Tourism Coordination - Connecting patients with the best doctors in Egypt",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}