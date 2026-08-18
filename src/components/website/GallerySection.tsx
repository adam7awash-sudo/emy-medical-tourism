'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, ImageIcon, Play } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  videoUrl: string;
  category: string;
  order: number;
}

const placeholderItems = [
  { id: 'p1', title: 'المستشفى', image: '', videoUrl: '', category: 'hospital' },
  { id: 'p2', title: 'غرفة العمليات', image: '', videoUrl: '', category: 'surgery' },
  { id: 'p3', title: 'قسم العلاج', image: '', videoUrl: '', category: 'treatment' },
  { id: 'p4', title: 'استقبال المرضى', image: '', videoUrl: '', category: 'reception' },
  { id: 'p5', title: 'الأجهزة الطبية', image: '', videoUrl: '', category: 'equipment' },
  { id: 'p6', title: 'رعاية المرضى', image: '', videoUrl: '', category: 'care' },
];

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

export default function GallerySection() {
  const { t } = useLanguageStore();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {});
  }, []);

  const displayItems = items.length > 0 ? items : placeholderItems;

  return (
    <section id="gallery" className="py-20 md:py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('معرض الصور والفيديوهات', 'Photo & Video Gallery')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              'نظرة على مرافقنا وشركائنا من المستشفيات والمراكز الطبية',
              'A look at our facilities and partner hospitals and medical centers'
            )}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item, i) => {
            const isVideo = !!item.videoUrl;
            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl overflow-hidden shadow-lg shadow-blue-100/30 cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-blue-100/50 hover:scale-[1.02] aspect-video ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i + 1) * 80}ms` }}
                onClick={() => setSelectedItem(item)}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                {/* Fallback bg */}
                <div
                  className={`absolute inset-0 gradient-primary flex items-center justify-center transition-opacity duration-300 ${item.image ? 'opacity-0 group-hover:opacity-30' : 'opacity-100'}`}
                >
                  <ImageIcon className="w-10 h-10 text-white/40" />
                </div>
                {/* Video Play Button Overlay */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
                {/* Video Badge */}
                {isVideo && (
                  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Play className="w-3 h-3" fill="currentColor" />
                    فيديو
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end">
                  <div className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-block">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl p-0 bg-black/90 border-0 rounded-3xl overflow-hidden">
            <DialogTitle className="sr-only">{selectedItem?.title}</DialogTitle>
            <div className="relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedItem?.videoUrl ? (
                <div className="aspect-video w-full">
                  <video
                    src={selectedItem.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    poster={selectedItem.image || undefined}
                  />
                </div>
              ) : selectedItem?.image ? (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full max-h-[80vh] object-contain"
                />
              ) : null}
              {selectedItem?.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <p className="text-white font-semibold text-lg">{selectedItem.title}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
