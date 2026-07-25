'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Star, Quote, UserRound, ChevronDown } from 'lucide-react';

interface Story {
  id: string;
  nameAr: string;
  nameEn: string;
  country: string;
  storyAr: string;
  storyEn: string;
  image: string;
  rating: number;
  order: number;
}

const countryFlags: Record<string, string> = {
  'العراق': '🇮🇶', 'iraq': '🇮🇶',
  'السعودية': '🇸🇦', 'saudi': '🇸🇦',
  'الأردن': '🇯🇴', 'jordan': '🇯🇴',
  'الكويت': '🇰🇼', 'kuwait': '🇰🇼',
  'الإمارات': '🇦🇪', 'uae': '🇦🇪',
  'البحرين': '🇧🇭', 'bahrain': '🇧🇭',
  'عمان': '🇴🇲', 'oman': '🇴🇲',
  'قطر': '🇶🇦', 'qatar': '🇶🇦',
  'ليبيا': '🇱🇾', 'libya': '🇱🇾',
  'السودان': '🇸🇩', 'sudan': '🇸🇩',
  'اليمن': '🇾🇪', 'yemen': '🇾🇪',
  'فلسطين': '🇵🇸', 'palestine': '🇵🇸',
  'مصر': '🇪🇬', 'egypt': '🇪🇬',
  'سوريا': '🇸🇾', 'syria': '🇸🇾',
  'لبنان': '🇱🇧', 'lebanon': '🇱🇧',
  'الجزائر': '🇩🇿', 'algeria': '🇩🇿',
  'المغرب': '🇲🇦', 'morocco': '🇲🇦',
  'تونس': '🇹🇳', 'tunisia': '🇹🇳',
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

export default function StoriesSection() {
  const { t, lang } = useLanguageStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [showCount, setShowCount] = useState(2);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setStories(data); })
      .catch(() => {});
  }, []);

  const visibleStories = stories.slice(0, showCount);
  const hasMore = showCount < stories.length;

  const getFlag = (country: string) => {
    if (!country) return '🌍';
    const lower = country.toLowerCase();
    return countryFlags[country] || countryFlags[lower] || '🌍';
  };

  return (
    <section id="stories" className="py-20 md:py-28 px-6 bg-secondary/30" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('قصص النجاح', 'Success Stories')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              'تجارب حقيقية من مرضى سعداء اختاروا الرحلة العلاجية معنا',
              'Real experiences from happy patients who chose their medical journey with us'
            )}
          </p>
        </div>

        {stories.length === 0 ? (
          <div
            className={`text-center py-12 transition-all duration-800 ${visible ? 'opacity-100' : 'opacity-0'}`}
          >
            <Quote className="w-12 h-12 text-primary/20 mx-auto mb-3" />
            <p className="text-muted-foreground">{t('سيتم إضافة القصص قريباً', 'Stories will be added soon')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visibleStories.map((story, i) => (
                <div
                  key={story.id}
                  className={`bg-white rounded-2xl p-8 shadow-lg shadow-blue-100/30 border border-border/30 hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(i + 1) * 150}ms` }}
                >
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/15 mb-4" />

                  {/* Story Text */}
                  <p className="text-foreground/80 leading-relaxed text-base mb-6 italic">
                    &ldquo;{t(story.storyAr, story.storyEn)}&rdquo;
                  </p>

                  {/* Patient Info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    {/* Avatar */}
                    <div className="relative">
                      {story.image ? (
                        <img
                          src={story.image}
                          alt={t(story.nameAr, story.nameEn)}
                          className="w-14 h-14 rounded-full object-cover border-4 border-primary/20"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-14 h-14 rounded-full gradient-primary flex items-center justify-center border-4 border-primary/20 ${story.image ? 'hidden' : ''}`}>
                        <UserRound className="w-6 h-6 text-white/80" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">{t(story.nameAr, story.nameEn)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getFlag(story.country)} {story.country}
                      </p>
                    </div>
                    {/* Rating */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={`w-4 h-4 ${si < story.rating ? 'text-emt-gold fill-emt-gold' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setShowCount(stories.length)}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-border/60 text-foreground/70 hover:text-primary hover:border-primary/40 hover:shadow-lg hover:shadow-blue-100/30 transition-all duration-300 font-medium text-sm"
                >
                  {t('عرض المزيد', 'Show More')}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}