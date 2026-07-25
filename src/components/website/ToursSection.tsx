'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Button } from '@/components/ui/button';
import { MapPin, Plane, X, ChevronLeft } from 'lucide-react';

interface Tour {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  locationAr: string;
  locationEn: string;
  category: string;
  featured: boolean;
  order: number;
}

const categories = [
  {
    key: 'religious',
    ar: 'سياحة دينية',
    en: 'Religious Tourism',
    descAr: 'زيارة المساجد والأماكن الدينية الإسلامية في القاهرة',
    descEn: 'Visit Islamic mosques and religious sites in Cairo',
    image: '/uploads/tour-categories/religious.jpg',
    gradient: 'from-amber-900/70 via-amber-800/40 to-transparent',
  },
  {
    key: 'cairo',
    ar: 'سياحة داخل القاهرة',
    en: 'Cairo Tourism',
    descAr: 'الأهرامات والمتاحف والمعالم الأثرية التاريخية',
    descEn: 'Pyramids, museums and historical archaeological landmarks',
    image: '/uploads/tour-categories/cairo.jpg',
    gradient: 'from-blue-900/70 via-blue-800/40 to-transparent',
  },
  {
    key: 'outside_cairo',
    ar: 'سياحة خارج القاهرة',
    en: 'Outside Cairo',
    descAr: 'شرم الشيخ والإسكندرية والغردقة والبحر الأحمر',
    descEn: 'Sharm El Sheikh, Alexandria, Hurghada & Red Sea',
    image: '/uploads/tour-categories/outside-cairo.jpg',
    gradient: 'from-cyan-900/70 via-cyan-800/40 to-transparent',
  },
];

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
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function ToursSection() {
  const { t, lang } = useLanguageStore();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/tours')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTours(data);
      })
      .catch(() => {});
  }, []);

  const filteredTours = selectedCategory
    ? tours.filter((tour) => tour.category === selectedCategory)
    : [];

  const selectedCat = categories.find((c) => c.key === selectedCategory);

  return (
    <section id="tours" className="py-20 md:py-28 px-6 bg-gradient-to-b from-white to-emt-light/30" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-14 transition-all duration-800 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-center gap-3 mb-3">
            <Plane className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              {t('أفضل البرامج السياحية', 'Best Tourism Programs')}
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              'اكتشف أجمل الأماكن السياحية في مصر مع باقات متكاملة تجمع بين العلاج والترفيه',
              'Discover Egypt\'s most beautiful destinations with integrated medical and recreational packages'
            )}
          </p>
        </div>

        {/* Three Category Cards */}
        {!selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((cat, i) => {
              const count = tours.filter((t) => t.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-lg shadow-blue-100/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-3 hover:scale-[1.02] ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${(i + 1) * 150}ms` }}
                >
                  {/* Background Image */}
                  <img
                    src={cat.image}
                    alt={t(cat.ar, cat.en)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlays */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-6">
                    {/* Count badge */}
                    <div className="flex justify-start">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30">
                        {count} {t('مكان', 'places')}
                      </span>
                    </div>

                    {/* Bottom content */}
                    <div className="text-right">
                      <h3 className="text-white font-bold text-2xl mb-2 leading-tight">
                        {t(cat.ar, cat.en)}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {t(cat.descAr, cat.descEn)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Category - Show Tours */}
        {selectedCategory && selectedCat && (
          <div>
            {/* Back button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-8 transition-all duration-500 ${
                visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              {t('العودة للتصنيفات', 'Back to Categories')}
            </button>

            {/* Category Header with Image */}
            <div className="relative rounded-2xl overflow-hidden h-56 md:h-72 mb-10">
              <img
                src={selectedCat.image}
                alt={t(selectedCat.ar, selectedCat.en)}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${selectedCat.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 h-full flex items-end p-8">
                <div>
                  <h3 className="text-white font-extrabold text-3xl md:text-4xl mb-2">
                    {t(selectedCat.ar, selectedCat.en)}
                  </h3>
                  <p className="text-white/70 text-base md:text-lg">
                    {t(selectedCat.descAr, selectedCat.descEn)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tours Grid */}
            {filteredTours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour, i) => {
                  const name = t(tour.nameAr, tour.nameEn);
                  const desc = t(tour.descriptionAr, tour.descriptionEn);
                  const location = t(tour.locationAr, tour.locationEn);

                  return (
                    <div
                      key={tour.id}
                      className="group relative rounded-2xl overflow-hidden shadow-lg shadow-blue-100/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        {/* Fallback gradient */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(135deg, #0A6EBD 0%, #084A82 50%, #06355C 100%)',
                          }}
                        />

                        {/* Background Image */}
                        <div className="absolute inset-0 z-[1]">
                          <img
                            src={tour.image}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.parentElement!.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-end p-5">
                          <h3 className="text-white font-bold text-xl mb-2 leading-tight">
                            {name}
                          </h3>

                          {location && (
                            <div className="flex items-center gap-1.5 text-white/70 text-sm mb-2">
                              <MapPin className="w-3.5 h-3.5" />
                              {location}
                            </div>
                          )}

                          {desc && (
                            <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Plane className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">{t('سيتم إضافة الأماكن قريباً', 'Places coming soon')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}