'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, ImageIcon } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
  category: string;
  order: number;
}

const placeholderImages = [
  { id: 'p1', title: 'المستشفى', image: '', category: 'hospital' },
  { id: 'p2', title: 'غرفة العمليات', image: '', category: 'surgery' },
  { id: 'p3', title: 'قسم العلاج', image: '', category: 'treatment' },
  { id: 'p4', title: 'استقبال المرضى', image: '', category: 'reception' },
  { id: 'p5', title: 'الأجهزة الطبية', image: '', category: 'equipment' },
  { id: 'p6', title: 'رعاية المرضى', image: '', category: 'care' },
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
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setImages(data);
        }
      })
      .catch(() => {});
  }, []);

  const displayImages = images.length > 0 ? images : placeholderImages;

  return (
    <section id="gallery" className="py-20 md:py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('معرض الصور', 'Photo Gallery')}
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
          {displayImages.map((img, i) => (
            <div
              key={img.id}
              className={`group relative rounded-2xl overflow-hidden shadow-lg shadow-blue-100/30 cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-blue-100/50 hover:scale-[1.02] aspect-video ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${(i + 1) * 80}ms` }}
              onClick={() => setSelectedImage(img)}
            >
              {img.image ? (
                <img
                  src={img.image}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              {/* Fallback bg */}
              <div
                className={`absolute inset-0 gradient-primary flex items-center justify-center transition-opacity duration-300 ${img.image ? 'opacity-0 group-hover:opacity-30' : 'opacity-100'}`}
              >
                <ImageIcon className="w-10 h-10 text-white/40" />
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end">
                <div className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold text-sm bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-block">
                    {img.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-black/90 border-0 rounded-3xl overflow-hidden">
            <DialogTitle className="sr-only">{selectedImage?.title}</DialogTitle>
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedImage?.image && (
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full max-h-[80vh] object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}