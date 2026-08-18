'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { getWhatsAppLink, WHATSAPP_DEFAULT, EMAIL_DEFAULT } from '@/lib/utils';
import { Facebook, Instagram, MessageCircle, Phone, Mail, ArrowUp, ExternalLink } from 'lucide-react';

interface Specialty {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface Settings {
  whatsapp?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  developer_name?: string;
  developer_link?: string;
}

export default function WebsiteFooter() {
  const { t, lang } = useLanguageStore();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [settings, setSettings] = useState<Settings>({
    whatsapp: WHATSAPP_DEFAULT,
    phone: WHATSAPP_DEFAULT,
    email: EMAIL_DEFAULT,
  });

  useEffect(() => {
    fetch('/api/specialties')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSpecialties(data.slice(0, 6)); })
      .catch(() => {});
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const quickLinks = [
    { label: t('الرئيسية', 'Home'), href: '#home' },
    { label: t('عن EMT', 'About'), href: '#about' },
    { label: t('التخصصات', 'Specialties'), href: '#specialties' },
    { label: t('الأطباء', 'Doctors'), href: '#doctors' },
    { label: t('احجز الآن', 'Book Now'), href: '#booking' },
  ];

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const displayPhone = settings.phone || settings.whatsapp || WHATSAPP_DEFAULT;
  const displayEmail = settings.email || EMAIL_DEFAULT;
  const developerName = settings.developer_name || 'Adam Hawash';
  const developerLink = settings.developer_link || 'https://wa.me/201000000000';

  return (
    <footer className="relative bg-slate-900 text-white">
      {/* Gold accent line */}
      <div className="h-1 bg-emt-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Logo + Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-extrabold text-xl">E</span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-white">EMT</span>
                <p className="text-[10px] text-white/50 leading-none mt-0.5">
                  {t('سياحة علاجية', 'Medical Tourism')}
                </p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t(
                'شركة رائدة في تنظيم السياحة العلاجية في مصر. نربط المرضى بأفضل الأطباء والمستشفيات المتخصصة.',
                'A leading medical tourism company in Egypt. Connecting patients with the best specialized doctors and hospitals.'
              )}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              <a
                href={getWhatsAppLink(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-white text-base mb-5">
              {t('روابط سريعة', 'Quick Links')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Specialties */}
          <div>
            <h3 className="font-bold text-white text-base mb-5">
              {t('التخصصات', 'Specialties')}
            </h3>
            <ul className="space-y-3">
              {specialties.map((spec) => (
                <li key={spec.id}>
                  <button
                    onClick={() => scrollToSection('#specialties')}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                  >
                    {lang === 'ar' ? spec.nameAr : spec.nameEn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-white text-base mb-5">
              {t('تواصل معنا', 'Contact Us')}
            </h3>
            <div className="space-y-4">
              <a
                href={getWhatsAppLink(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-green-600 flex items-center justify-center transition-all duration-300 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-sm" dir="ltr">{displayPhone}</span>
              </a>
              <a
                href={`tel:+${displayPhone}`}
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-primary flex items-center justify-center transition-all duration-300 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm" dir="ltr">{displayPhone}</span>
              </a>
              <a
                href={`mailto:${displayEmail}`}
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-emt-gold flex items-center justify-center transition-all duration-300 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">{displayEmail}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          {/* Made by Adam Hawash */}
          <a
            href={developerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-white/50 hover:text-emt-gold text-sm transition-colors duration-300 mb-2"
          >
            <span>Made by</span>
            <span className="font-semibold">{developerName}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-center text-white/40 text-sm">
            © {new Date().getFullYear()} EMT - {t('إيمي للسياحة العلاجية. جميع الحقوق محفوظة.', 'Emy Medical Tourism. All rights reserved.')}
          </p>
          <button
            onClick={() => { window.location.hash = '#/admin'; }}
            className="block mx-auto mt-2 text-white/20 hover:text-white/50 text-xs transition-colors"
            title="لوحة التحكم"
          >
            ⚙ لوحة التحكم
          </button>
        </div>
      </div>
    </footer>
  );
}
