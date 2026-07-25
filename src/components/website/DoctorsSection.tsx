'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { getWhatsAppLink } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarPlus, MessageCircle, UserRound } from 'lucide-react';

interface Doctor {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  specialtyId: string | null;
  image: string;
  order: number;
}

interface Specialty {
  id: string;
  nameAr: string;
  nameEn: string;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function DoctorsSection() {
  const { t, lang } = useLanguageStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/doctors')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDoctors(data); })
      .catch(() => {});
    fetch('/api/specialties')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSpecialties(data); })
      .catch(() => {});
  }, []);

  const getSpecialtyName = (specialtyId: string | null) => {
    if (!specialtyId) return '';
    const spec = specialties.find((s) => s.id === specialtyId);
    return spec ? t(spec.nameAr, spec.nameEn) : '';
  };

  const handleBookNow = (doctor: Doctor) => {
    const specName = getSpecialtyName(doctor.specialtyId);
    window.dispatchEvent(
      new CustomEvent('selectSpecialty', {
        detail: { id: doctor.specialtyId || '', name: specName },
      })
    );
  };

  const getInitials = (nameAr: string, nameEn: string) => {
    const name = lang === 'ar' ? nameAr : nameEn;
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return parts[0]?.[0] || '?';
  };

  return (
    <section id="doctors" className="py-20 md:py-28 px-6 bg-secondary/30" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('فريق الأطباء', 'Our Doctors')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              'نخبة من أفضل الأطباء والاستشاريين المتخصصين',
              'An elite group of the best specialized doctors and consultants'
            )}
          </p>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <UserRound className="w-10 h-10 text-primary/40" />
            </div>
            <p className="text-muted-foreground">{t('سيتم إضافة الأطباء قريباً', 'Doctors will be added soon')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor, i) => (
              <div
                key={doctor.id}
                className={`group bg-white rounded-2xl overflow-hidden shadow-lg shadow-blue-100/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100/50 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                {/* Doctor Image */}
                <div className="h-64 relative overflow-hidden gradient-primary">
                  {doctor.image ? (
                    <img
                      src={doctor.image}
                      alt={t(doctor.nameAr, doctor.nameEn)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  {/* Initials avatar when no image */}
                  {!doctor.image && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">{getInitials(doctor.nameAr, doctor.nameEn)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    {t(doctor.nameAr, doctor.nameEn)}
                  </h3>
                  {doctor.specialtyId && (
                    <span className="inline-block bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      {getSpecialtyName(doctor.specialtyId)}
                    </span>
                  )}
                  <p className="text-muted-foreground text-sm mb-4">
                    {t(doctor.titleAr, doctor.titleEn)}
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleBookNow(doctor)}
                      size="sm"
                      className="flex-1 gradient-primary-light text-white font-semibold rounded-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    >
                      <CalendarPlus className="w-4 h-4 ml-1" />
                      {t('احجز الآن', 'Book Now')}
                    </Button>
                    <Button
                      size="icon"
                      className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20 h-9 w-9"
                      asChild
                    >
                      <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}