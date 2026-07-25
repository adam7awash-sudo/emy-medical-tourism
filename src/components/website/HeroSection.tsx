'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { getWhatsAppLink } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plane, Heart, Stethoscope, Shield, ChevronDown, MessageCircle, CalendarPlus, Users, Award, Smile } from 'lucide-react';

interface HomepageData {
  ar?: string;
  en?: string;
}

interface HeroContent {
  headline: HomepageData;
  subheadline: HomepageData;
  description: HomepageData;
  bgImage: string;
  founderName: HomepageData;
  founderTitle: HomepageData;
  founderImage: string;
  statsDoctors: string;
  statsSpecialties: string;
  statsPatients: string;
}

const defaultContent: HeroContent = {
  headline: { ar: 'رحلتك نحو الشفاء تبدأ هنا', en: 'Your Journey to Healing Starts Here' },
  subheadline: { ar: 'EMT - إيمي للسياحة العلاجية', en: 'EMT - Emy Medical Tourism' },
  description: {
    ar: 'نربطك بأفضل الأطباء والمستشفيات المتخصصة في مصر. نقدم تجربة علاجية متكاملة من الاستشارة الأولى وحتى المتابعة بعد العلاج.',
    en: 'We connect you with the best specialized doctors and hospitals in Egypt. A complete medical journey from first consultation to post-treatment follow-up.'
  },
  founderName: { ar: 'أ. إيمي هوشن', en: 'Emy Hawash' },
  founderTitle: { ar: 'مؤسسة EMT للسياحة العلاجية', en: 'Founder of EMT Medical Tourism' },
  bgImage: '/uploads/hero-bg.png',
  founderImage: '/uploads/founder.png',
  statsDoctors: '+150',
  statsSpecialties: '+13',
  statsPatients: '+500',
};

const floatingIcons = [
  { Icon: Plane, className: 'animate-icon-1', style: { top: '15%', right: '8%' } },
  { Icon: Heart, className: 'animate-icon-2', style: { top: '35%', right: '5%' } },
  { Icon: Stethoscope, className: 'animate-icon-3', style: { bottom: '35%', right: '10%' } },
  { Icon: Shield, className: 'animate-icon-4', style: { bottom: '15%', right: '7%' } },
];

export default function HeroSection() {
  const { t, lang } = useLanguageStore();
  const [content, setContent] = useState<HeroContent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((data) => {
        const str = (v: unknown, fallback: string) => {
          if (!v) return fallback;
          if (typeof v === 'string') return v;
          if (typeof v === 'object' && v !== null) {
            const obj = v as { ar?: string; en?: string };
            return obj.ar || obj.en || fallback;
          }
          return fallback;
        };
        const txt = (v: unknown, fallback: { ar: string; en: string }) => {
          if (!v) return fallback;
          if (typeof v === 'object' && v !== null && 'ar' in v) return v as { ar: string; en: string };
          return fallback;
        };
        setContent({
          headline: txt(data.hero_headline, defaultContent.headline),
          subheadline: txt(data.hero_subheadline, defaultContent.subheadline),
          description: txt(data.hero_description, defaultContent.description),
          bgImage: str(data.hero_bg_image, defaultContent.bgImage),
          founderName: txt(data.founder_name, defaultContent.founderName),
          founderTitle: txt(data.founder_title, defaultContent.founderTitle),
          founderImage: str(data.founder_image, defaultContent.founderImage),
          statsDoctors: str(data.stats_doctors, defaultContent.statsDoctors),
          statsSpecialties: str(data.stats_specialties, defaultContent.statsSpecialties),
          statsPatients: str(data.stats_patients, defaultContent.statsPatients),
        });
        requestAnimationFrame(() => setMounted(true));
      })
      .catch(() => {
        setContent(defaultContent);
        requestAnimationFrame(() => setMounted(true));
      });
  }, []);

  const scrollToBooking = () => {
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Don't render until API data is loaded (prevents flash of wrong image)
  if (!content) {
    return (
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary to-sky-900">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={content.bgImage}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-sky-900/80" />
      </div>

      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-blob-1" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-300/10 rounded-full blur-3xl animate-blob-2" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-200/8 rounded-full blur-3xl animate-blob-3" />
      </div>

      {/* Floating Medical Icons (hidden on mobile) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {floatingIcons.map(({ Icon, className, style }, i) => (
          <div
            key={i}
            className={`absolute ${className}`}
            style={style}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-32 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-right">
            <div
              className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-emt-gold animate-pulse" />
                <span className="text-white/90 text-sm font-medium">
                  {t(content.subheadline.ar || defaultContent.subheadline.ar, content.subheadline.en || defaultContent.subheadline.en)}
                </span>
              </div>
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 transition-all duration-1000 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {t(content.headline.ar || defaultContent.headline.ar, content.headline.en || defaultContent.headline.en)}
            </h1>

            <p
              className={`text-lg md:text-xl text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0 lg:ml-auto mb-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {t(content.description.ar || defaultContent.description.ar, content.description.en || defaultContent.description.en)}
            </p>

            <div
              className={`flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start transition-all duration-1000 delay-450 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <Button
                onClick={() => window.open(getWhatsAppLink(), '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 h-13 rounded-full shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 text-base gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {t('تواصل عبر واتساب', 'Chat on WhatsApp')}
              </Button>
              <Button
                onClick={scrollToBooking}
                className="bg-white hover:bg-white/95 text-primary font-semibold px-8 h-13 rounded-full shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 text-base gap-2"
              >
                <CalendarPlus className="w-5 h-5" />
                {t('احجز الآن', 'Book Now')}
              </Button>
            </div>
          </div>

          {/* Founder Image */}
          <div
            className={`flex-shrink-0 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <div className="relative">
              <div className="w-64 h-80 md:w-72 md:h-96 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl shadow-black/20">
                <img
                  src={content.founderImage}
                  alt={t('المؤسسة', 'Founder')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.classList.add('gradient-primary', 'flex', 'items-center', 'justify-center');
                    const name = content.founderName.ar || content.founderName.en || 'EMT';
                    target.parentElement!.innerHTML = `<div class="text-center text-white"><div class="w-20 h-20 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><p class="text-white/80 text-sm font-medium">${name}</p></div>`;
                  }}
                />
              </div>
              {/* Name Card */}
              <div className="absolute -bottom-4 -right-4 lg:-right-8 bg-white rounded-2xl shadow-xl shadow-black/10 px-5 py-3">
                <p className="font-bold text-primary text-sm">
                  {t(content.founderName.ar || defaultContent.founderName.ar, content.founderName.en || defaultContent.founderName.en)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(content.founderTitle.ar || defaultContent.founderTitle.ar, content.founderTitle.en || defaultContent.founderTitle.en)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: content.statsDoctors || defaultContent.statsDoctors, label: t('طبيب', 'Doctor'), Icon: Users },
                { value: content.statsSpecialties || defaultContent.statsSpecialties, label: t('تخصص', 'Specialty'), Icon: Award },
                { value: content.statsPatients || defaultContent.statsPatients, label: t('مريض سعيد', 'Happy Patient'), Icon: Smile },
              ].map(({ value, label, Icon }, i) => (
                <div key={i} className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-xl md:text-2xl leading-none">{value}</p>
                    <p className="text-white/60 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-28 lg:bottom-36 left-1/2 -translate-x-1/2 z-10 text-white/60 hover:text-white/90 transition-all duration-300 animate-bounce-down"
        aria-label={t('اسحب للأسفل', 'Scroll Down')}
      >
        <ChevronDown className="w-7 h-7" />
      </button>
    </section>
  );
}