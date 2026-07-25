'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { getWhatsAppLink } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, MessageCircle, Phone, Settings } from 'lucide-react';

const navLinks = [
  { key: 'home', ar: 'الرئيسية', en: 'Home', href: '#home' },
  { key: 'about', ar: 'عن EMT', en: 'About EMT', href: '#about' },
  { key: 'services', ar: 'خدماتنا', en: 'Services', href: '#services' },
  { key: 'specialties', ar: 'التخصصات', en: 'Specialties', href: '#specialties' },
  { key: 'tours', ar: 'البرامج السياحية', en: 'Tourism Programs', href: '#tours' },
  { key: 'doctors', ar: 'الأطباء', en: 'Doctors', href: '#doctors' },
  { key: 'gallery', ar: 'المعرض', en: 'Gallery', href: '#gallery' },
  { key: 'contact', ar: 'تواصل معنا', en: 'Contact', href: '#contact' },
];

export default function WebsiteHeader() {
  const { lang, t, setLang, isRTL } = useLanguageStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-blue-100/50'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('#home')}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
              <span className="text-white font-extrabold text-xl tracking-tight">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-primary leading-none tracking-tight">
                EMT
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-1 font-medium">
                {t('سياحة علاجية', 'Medical Tourism')}
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollToSection(link.href)}
                className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary rounded-lg transition-all duration-300 group"
              >
                {t(link.ar, link.en)}
                <span className="absolute bottom-0 right-1/2 translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 w-0 group-hover:w-3/4" />
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-all duration-300"
              asChild
            >
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
            </Button>

            <Button
              onClick={() => scrollToSection('#booking')}
              className="gradient-primary-light hover:opacity-90 text-white font-semibold px-7 rounded-full shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              {t('احجز الآن', 'Book Now')}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => { window.location.hash = '#/admin'; }}
              className="text-muted-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300"
              title="لوحة التحكم"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL() ? 'left' : 'right'} className="w-80 p-0">
                <SheetTitle className="sr-only">القائمة</SheetTitle>
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <span className="text-white font-extrabold text-lg">E</span>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-primary">EMT</span>
                      <p className="text-xs text-muted-foreground">{t('سياحة علاجية', 'Medical Tourism')}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-4 flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <button
                      key={link.key}
                      onClick={() => scrollToSection(link.href)}
                      className="px-4 py-3.5 text-sm font-medium text-foreground/70 hover:text-primary rounded-xl hover:bg-secondary/60 transition-all duration-200 text-right"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {t(link.ar, link.en)}
                    </button>
                  ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-secondary/30">
                  <Button
                    onClick={() => { setMobileOpen(false); window.location.hash = '#/admin'; }}
                    variant="ghost"
                    className="w-full text-muted-foreground/50 hover:text-primary hover:bg-primary/5 font-medium rounded-xl h-10"
                  >
                    <Settings className="w-4 h-4 ml-2" />
                    {t('لوحة التحكم', 'Admin Dashboard')}
                  </Button>
                  <Button
                    onClick={() => scrollToSection('#booking')}
                    className="w-full gradient-primary-light text-white font-semibold rounded-full shadow-lg shadow-primary/25 h-12"
                  >
                    {t('احجز الآن', 'Book Now')}
                  </Button>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${getWhatsAppLink().includes('wa.me/') ? '' : ''}`}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      {t('اتصل بنا', 'Call Us')}
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}