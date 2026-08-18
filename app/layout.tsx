import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }) {
  // دي اللينكات اللي تقدر لاحقاً تجيبها من قاعدة البيانات أو صفحة الأدمن
  const developerLink = "https://your-admin-link.com"; 

  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* التوقيع العلوي */}
        <header className="bg-slate-900 text-white p-3 text-center text-sm flex justify-around">
          <Link href={developerLink} className="hover:underline text-indigo-400 font-bold">
            Made by Adam Hawash
          </Link>
          <Link href={developerLink} className="hover:underline text-indigo-400 font-bold">
            Hero Developer
          </Link>
        </header>

        {/* محتوى الموقع الأساسي */}
        <main>{children}</main>

        {/* التوقيع السفلي */}
        <footer className="bg-slate-900 text-white p-4 text-center text-sm">
          <Link href={developerLink} className="hover:underline text-indigo-400 font-bold">
            Hero Developer
          </Link>
        </footer>
      </body>
    </html>
  );
}
