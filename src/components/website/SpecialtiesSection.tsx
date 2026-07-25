'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

interface Specialty {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  order: number;
}

const defaultSpecialties: Specialty[] = [
  { id: 'spec-1', nameAr: 'أمراض الذكورة والخصوبة', nameEn: 'Urology & Fertility', icon: '👨‍⚕️', image: '', order: 1 },
  { id: 'spec-2', nameAr: 'الأسنان', nameEn: 'Dentistry', icon: '🦷', image: '', order: 2 },
  { id: 'spec-3', nameAr: 'القلب والأوعية الدموية', nameEn: 'Cardiology', icon: '❤️', image: '', order: 3 },
  { id: 'spec-4', nameAr: 'المخ والأعصاب', nameEn: 'Neurology', icon: '🧠', image: '', order: 4 },
  { id: 'spec-5', nameAr: 'العظام والمفاصل', nameEn: 'Orthopedics', icon: '🦴', image: '', order: 5 },
  { id: 'spec-6', nameAr: 'العيون', nameEn: 'Ophthalmology', icon: '👁️', image: '', order: 6 },
  { id: 'spec-7', nameAr: 'علاج الآلام', nameEn: 'Pain Management', icon: '💊', image: '', order: 7 },
  { id: 'spec-8', nameAr: 'الجراحة والمناظير', nameEn: 'Surgery & Endoscopy', icon: '🔬', image: '', order: 8 },
  { id: 'spec-9', nameAr: 'جراحات السمنة', nameEn: 'Bariatric Surgery', icon: '⚖️', image: '', order: 9 },
  { id: 'spec-10', nameAr: 'الجهاز الهضمي والكبد', nameEn: 'Gastroenterology', icon: '🫁', image: '', order: 10 },
  { id: 'spec-11', nameAr: 'الكلى والمسالك البولية', nameEn: 'Nephrology & Urology', icon: '🩺', image: '', order: 11 },
  { id: 'spec-12', nameAr: 'الغدد الصماء والسكري', nameEn: 'Endocrinology', icon: '🧬', image: '', order: 12 },
  { id: 'spec-13', nameAr: 'جراحات التجميل', nameEn: 'Cosmetic Surgery', icon: '✨', image: '', order: 13 },
];

const descriptionsAr: Record<string, string> = {
  'أمراض الذكورة والخصوبة': 'أفضل الأطباء المتخصصين في علاج أمراض الذكورة ومشاكل الخصوبة بأحدث التقنيات',
  'الأسنان': 'تركيبات وزراعة أسنان بتقنيات حديثة ونتائج مضمونة',
  'القلب والأوعية الدموية': 'استشاريو قلب وقسطرة قلبية من أعلى المستويات',
  'المخ والأعصاب': 'تشخيص وعلاج الأمراض العصبية بأحدث الأجهزة الطبية',
  'العظام والمفاصل': 'جراحات عظام ومفاصل وبدائل مفصلية متطورة',
  'العيون': 'عمليات تصحيح النظر وعلاج أمراض العيون المتخصصة',
  'علاج الآلام': 'علاج الآلام المزمنة بالتردد الحراري وأحدث التقنيات',
  'الجراحة والمناظير': 'جراحات متنوعة بتقنيات المناظير الحديثة',
  'جراحات السمنة': 'تحويل مسار وتكميم المعدة بأيدي استشاريين متخصصين',
  'الجهاز الهضمي والكبد': 'تشخيص وعلاج أمراض الجهاز الهضمي والكبد',
  'الكلى والمسالك البولية': 'علاج أمراض الكلى والمسالك البولية المتخصصة',
  'الغدد الصماء والسكري': 'إدارة ومتابعة أمراض الغدد الصماء والسكري',
  'جراحات التجميل': 'إجراءات تجميلية متقدمة بتقنيات حديثة وآمنة',
};

const descriptionsEn: Record<string, string> = {
  'Urology & Fertility': 'Top specialists in urology and fertility treatment with the latest technologies',
  'Dentistry': 'Modern dental implants and restorations with guaranteed results',
  'Cardiology': 'Top-level cardiology consultants and cardiac catheterization specialists',
  'Neurology': 'Diagnosis and treatment of neurological conditions with advanced medical equipment',
  'Orthopedics': 'Advanced orthopedic surgery and joint replacement procedures',
  'Ophthalmology': 'Vision correction surgeries and specialized eye treatment',
  'Pain Management': 'Chronic pain treatment with radiofrequency and latest techniques',
  'Surgery & Endoscopy': 'Various surgical procedures with modern endoscopic techniques',
  'Bariatric Surgery': 'Gastric bypass and sleeve procedures by specialized consultants',
  'Gastroenterology': 'Diagnosis and treatment of gastrointestinal and liver diseases',
  'Nephrology & Urology': 'Specialized kidney and urinary tract treatment',
  'Endocrinology': 'Management and follow-up of endocrine disorders and diabetes',
  'Cosmetic Surgery': 'Advanced cosmetic procedures with modern and safe techniques',
};

const slugMap: Record<string, string> = {
  'أمراض الذكورة والخصوبة': 'urology',
  'الأسنان': 'dental',
  'القلب والأوعية الدموية': 'cardiology',
  'المخ والأعصاب': 'neurology',
  'العظام والمفاصل': 'orthopedics',
  'العيون': 'ophthalmology',
  'علاج الآلام': 'pain',
  'الجراحة والمناظير': 'surgery',
  'جراحات السمنة': 'bariatric',
  'الجهاز الهضمي والكبد': 'gastro',
  'الكلى والمسالك البولية': 'nephrology',
  'الغدد الصماء والسكري': 'endocrine',
  'جراحات التجميل': 'cosmetic',
};

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

export default function SpecialtiesSection() {
  const { t, lang } = useLanguageStore();
  const [specialties, setSpecialties] = useState<Specialty[]>(defaultSpecialties);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/specialties')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setSpecialties(data);
      })
      .catch(() => {});
  }, []);

  const handleBookNow = (specialty: Specialty) => {
    window.dispatchEvent(
      new CustomEvent('selectSpecialty', {
        detail: { id: specialty.id, name: lang === 'ar' ? specialty.nameAr : specialty.nameEn },
      })
    );
  };

  return (
    <section id="specialties" className="py-20 md:py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('التخصصات الطبية', 'Medical Specialties')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              'نغطي أكثر من 13 تخصصاً طبياً بأعلى مستويات الخبرة والكفاءة',
              'Covering over 13 medical specialties with the highest levels of expertise'
            )}
          </p>
        </div>

        {/* Specialty Cards Grid - ALL EQUAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {specialties.map((specialty, i) => {
            const slug = slugMap[specialty.nameAr] || `specialty-${specialty.id}`;
            const descAr = descriptionsAr[specialty.nameAr] || 'أفضل الأطباء المتخصصين في هذا المجال';
            const descEn = descriptionsEn[specialty.nameEn] || 'Top specialists in this field';
            const name = t(specialty.nameAr, specialty.nameEn);
            const desc = t(descAr, descEn);

            return (
              <div
                key={specialty.id}
                className={`group relative rounded-2xl overflow-hidden shadow-lg shadow-blue-100/30 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 hover:scale-[1.02] aspect-[3/4] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i + 1) * 80}ms` }}
              >
                {/* Fallback gradient bg - shows only when no image */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #0A6EBD 0%, #084A82 50%, #06355C 100%)',
                  }}
                />

                {/* Background Image - renders on top of fallback */}
                <div className="absolute inset-0 z-[1]">
                  <img
                    src={specialty.image || `/uploads/specialty-${slug}.png`}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.parentElement!.style.display = 'none';
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  {/* Top: Emoji Icon */}
                  <div className="flex justify-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl shadow-lg">
                      {specialty.icon || '🏥'}
                    </div>
                  </div>

                  {/* Bottom: Name + Description + CTA */}
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2 leading-tight">
                      {name}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-2">
                      {desc}
                    </p>

                    {/* CTA Button - appears on hover */}
                    <div className="overflow-hidden">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(specialty);
                        }}
                        className="w-full bg-white text-primary font-semibold rounded-xl shadow-lg transition-all duration-300 hover:bg-white/95 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 h-11"
                      >
                        <CalendarPlus className="w-4 h-4 ml-2" />
                        {t('احجز الآن', 'Book Now')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}