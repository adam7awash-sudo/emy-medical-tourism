'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Target, Eye, UserRound } from 'lucide-react';

interface ContentMap {
  ar?: string;
  en?: string;
}

interface AboutContent {
  description: ContentMap;
  mission: ContentMap;
  vision: ContentMap;
  founderName: ContentMap;
  founderTitle: ContentMap;
  founderImage: string;
}

const defaults: AboutContent = {
  description: {
    ar: 'EMT - إيمي للسياحة العلاجية هي شركة رائدة في تنظيم السياحة العلاجية في مصر. نعمل على ربط المرضى من الدول العربية بأفضل الأطباء والمستشفيات المتخصصة في مصر، لنوفر لهم تجربة علاجية متكاملة وآمنة.',
    en: 'EMT - Emy Medical Tourism is a leading medical tourism company in Egypt. We connect patients from Arab countries with the best specialized doctors and hospitals in Egypt, providing a complete and safe medical experience.',
  },
  mission: {
    ar: 'تقديم أعلى مستويات الرعاية الصحية للمرضى الدوليين من خلال شبكة من الأطباء المتخصصين والمستشفيات الحديثة، مع ضمان تجربة علاجية سلسة ومريحة.',
    en: 'Providing the highest levels of healthcare for international patients through a network of specialized doctors and modern hospitals, ensuring a smooth and comfortable medical experience.',
  },
  vision: {
    ar: 'أن نكون الخيار الأول والأكثر ثقة في السياحة العلاجية في المنطقة العربية، ونساهم في تحسين حياة المرضى من خلال الوصول إلى أفضل الرعاية الصحية.',
    en: 'To be the first and most trusted choice in medical tourism in the Arab region, improving patients\' lives through access to the best healthcare.',
  },
  founderName: { ar: 'ايمان حواش', en: 'Iman Hawash' },
  founderTitle: { ar: 'مؤسسة EMT للسياحة العلاجية', en: 'Founder of EMT Medical Tourism' },
  founderImage: '/uploads/founder.png',
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function AboutSection() {
  const { t } = useLanguageStore();
  const [content, setContent] = useState<AboutContent | null>(null);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((data) => {
        const txt = (v: unknown, fallback: ContentMap): ContentMap => {
          if (!v) return fallback;
          if (typeof v === 'object' && v !== null && 'ar' in v) return v as ContentMap;
          return fallback;
        };
        const str = (v: unknown, fallback: string) => {
          if (!v) return fallback;
          if (typeof v === 'string') return v;
          if (typeof v === 'object' && v !== null) {
            const obj = v as { ar?: string; en?: string };
            return obj.ar || obj.en || fallback;
          }
          return fallback;
        };
        setContent({
          description: txt(data.about_description, defaults.description),
          mission: txt(data.about_mission, defaults.mission),
          vision: txt(data.about_vision, defaults.vision),
          founderName: txt(data.founder_name, defaults.founderName),
          founderTitle: txt(data.founder_title, defaults.founderTitle),
          founderImage: str(data.founder_image, defaults.founderImage),
        });
      })
      .catch(() => {
        setContent(defaults);
      });
  }, []);

  const c = (field: ContentMap) => t(field.ar || '', field.en || '');

  if (!content) {
    return (
      <section id="about" className="py-20 md:py-28 px-6 bg-white" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
              {t('عن EMT', 'About EMT')}
            </h2>
          </div>
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 md:py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('عن EMT', 'About EMT')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('تعرّف على قصتنا ورؤيتنا لمستقبل الرعاية الصحية', 'Learn about our story and vision for the future of healthcare')}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Founder Image */}
          <div
            className={`transition-all duration-800 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-100/50 aspect-[3/4] max-w-md mx-auto lg:mx-0">
                <img
                  src={content.founderImage}
                  alt={c(content.founderName)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.classList.add('gradient-primary', 'flex', 'items-center', 'justify-center');
                    target.parentElement!.innerHTML = `<div class="text-center text-white p-8"><UserRound class="w-20 h-20 mx-auto mb-4 opacity-60" /><p class="text-white/80 font-semibold">${c(content.founderName)}</p><p class="text-white/50 text-sm mt-1">${c(content.founderTitle)}</p></div>`;
                  }}
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl bg-emt-gold/10 -z-10" />
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-secondary -z-10" />
            </div>
            {/* Founder Info Card */}
            <div className="mt-8 text-center lg:text-right max-w-md mx-auto lg:mx-0">
              <h3 className="text-xl font-bold text-foreground">{c(content.founderName)}</h3>
              <p className="text-emt-accent font-medium mt-1">{c(content.founderTitle)}</p>
            </div>
          </div>

          {/* Right: Description, Mission, Vision */}
          <div className="space-y-6">
            <div
              className={`transition-all duration-800 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p className="text-foreground/80 leading-loose text-base md:text-lg">
                {c(content.description)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {/* Mission Card */}
              <div
                className={`glass rounded-2xl p-6 border border-border/30 transition-all duration-800 delay-400 hover:shadow-lg hover:shadow-blue-100/30 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{t('مهمتنا', 'Our Mission')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c(content.mission)}</p>
              </div>

              {/* Vision Card */}
              <div
                className={`glass rounded-2xl p-6 border border-border/30 transition-all duration-800 delay-500 hover:shadow-lg hover:shadow-blue-100/30 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-emt-gold/10 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-emt-gold" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{t('رؤيتنا', 'Our Vision')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c(content.vision)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}