'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Building2 } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo: string;
  url: string;
  order: number;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function PartnersSection() {
  const { t } = useLanguageStore();
  const [partners, setPartners] = useState<Partner[]>([]);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/partners')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPartners(data); })
      .catch(() => {});
  }, []);

  return (
    <section id="partners" className="py-20 md:py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('شركاء النجاح', 'Success Partners')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              'نفتخر بشراكتنا مع أعرق المستشفيات والمراكز الطبية',
              'We are proud to partner with the most prestigious hospitals and medical centers'
            )}
          </p>
        </div>

        {partners.length === 0 ? (
          <div
            className={`text-center py-12 transition-all duration-800 ${visible ? 'opacity-100' : 'opacity-0'}`}
          >
            <Building2 className="w-12 h-12 text-primary/20 mx-auto mb-3" />
            <p className="text-muted-foreground">{t('سيتم إضافة الشركاء قريباً', 'Partners will be added soon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {partners.map((partner, i) => (
              <div
                key={partner.id}
                className={`group bg-white rounded-xl p-5 shadow-sm border border-border/50 hover:shadow-lg hover:shadow-blue-100/30 hover:border-primary/10 transition-all duration-500 hover:-translate-y-1 text-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i + 1) * 80}ms` }}
              >
                <div className="w-full h-20 flex items-center justify-center mb-3">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}