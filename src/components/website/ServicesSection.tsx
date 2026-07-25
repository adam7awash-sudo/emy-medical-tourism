'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Sparkles } from 'lucide-react';

interface Service {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  order: number;
}

const defaultServices: Service[] = [
  { id: '1', nameAr: 'تنسيق العلاج', nameEn: 'Treatment Coordination', icon: 'stethoscope', order: 0 },
  { id: '2', nameAr: 'حجز المواعيد', nameEn: 'Appointment Booking', icon: 'clipboard', order: 1 },
  { id: '3', nameAr: 'الترجمة الطبية', nameEn: 'Medical Translation', icon: 'languages', order: 2 },
  { id: '4', nameAr: 'ترتيب الإقامة', nameEn: 'Accommodation', icon: 'hotel', order: 3 },
  { id: '5', nameAr: 'المتابعة بعد العلاج', nameEn: 'Post-Treatment Follow-up', icon: 'phone', order: 5 },
];

const serviceDescriptions: Record<string, { ar: string; en: string }> = {
  'cmrddn4670000wme3ivcgm5vj': {
    ar: 'نواصل متابعة المريض بعد الرجوع إلى بلده لضمان استمرار نجاح العلاج والرعاية',
    en: 'We continue following up with the patient after returning to their country to ensure treatment success and ongoing care',
  },
};

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

export default function ServicesSection() {
  const { t } = useLanguageStore();
  const [services, setServices] = useState<Service[]>(defaultServices);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="services" className="py-20 md:py-28 px-6 bg-secondary/40" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('خدماتنا', 'Our Services')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('نقدم خدمات متكاملة لضمان تجربة علاجية مريحة وآمنة', 'We provide comprehensive services for a comfortable and safe medical experience')}
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, i) => {
            const desc = serviceDescriptions[service.id] || {
              ar: 'نوفر لك أفضل الخدمات في هذا المجال مع فريق متخصص',
              en: 'We provide the best services in this field with a dedicated team',
            };

            return (
              <div
                key={service.id}
                className={`group bg-white rounded-2xl p-8 shadow-lg shadow-blue-100/30 border border-transparent hover:border-primary/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100/40 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 text-3xl">
                  {service.icon || <Sparkles className="w-8 h-8 text-primary" />}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t(service.nameAr, service.nameEn)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(desc.ar, desc.en)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}