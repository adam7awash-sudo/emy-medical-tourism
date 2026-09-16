import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EMY Medical Tourism | إيمي للسياحة العلاجية',
  description:
    'شركة رائدة في تنظيم السياحة العلاجية في مصر — نربط المرضى بأفضل الأطباء والمستشفيات المتخصصة.',
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
