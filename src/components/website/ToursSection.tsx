"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Clock, Users, DollarSign, X, Calendar, Check } from "lucide-react";

type Tour = {
  id: string;
  title: string;
  description: string;
  category: "religious" | "cairo" | "outside_cairo";
  price: number;
  duration: string;
  groupSize: string;
  image: string;
  featured: boolean;
  createdAt: string;
};

type CategoryKey = "religious" | "cairo" | "outside_cairo";

const CATEGORIES: { key: CategoryKey; label: string; description: string; image: string }[] = [
  {
    key: "religious",
    label: "سياحة دينية",
    description: "زيارة المساجد والأماكن الدينية التاريخية",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b9752789a88e.jpeg",
  },
  {
    key: "cairo",
    label: "سياحة داخلية",
    description: "استكشف معالم القاهرة والمدن المصرية",
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6e4923a5a270.jpg",
  },
  {
    key: "outside_cairo",
    label: "سياحة خارجية",
    description: "رحلات دولية إلى أجمل الوجهات العالمية",
    image: "/vacation.png",
  },
];

/* تحميل مسبق */
const preloaded = new Set<string>();
function preload(src: string) {
  if (preloaded.has(src)) return;
  preloaded.add(src);
  const i = new Image();
  i.src = src;
}

/* صورة سريعة - بتظهر فوراً لو اتحملت */
function FastImg({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [ok, setOk] = useState(preloaded.has(src));
  useEffect(() => {
    if (ok) return;
    preload(src);
    const i = new Image();
    i.onload = () => setOk(true);
    i.src = src;
  }, [src, ok]);

  return (
    <div className={`relative bg-gray-200 ${className || ""}`}>
      {!ok && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <img src={src} alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-200 ${ok ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export default function ToursSection() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [hidden, setHidden] = useState<Record<CategoryKey, boolean>>({ religious: false, cairo: false, outside_cairo: false });
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  /* حمّل صور الأقسام فوراً */
  useEffect(() => {
    CATEGORIES.forEach((c) => preload(c.image));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([fetch("/api/tours"), fetch("/api/settings")]);
        const d1 = await r1.json();
        // FIX: API returns array directly, not { tours: [] }
        setTours(Array.isArray(d1) ? d1 : (d1.tours || []));
        const d2 = await r2.json();
        // FIX: Settings API returns flat object, not { settings: {} }
        const s = d2 || {};
        setHidden({
          religious: s.tour_category_hidden_religious === "true",
          cairo: s.tour_category_hidden_cairo === "true",
          outside_cairo: s.tour_category_hidden_outside_cairo === "true",
        });
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const visibleCategories = CATEGORIES.filter((c) => !hidden[c.key]);
  const toursByCat = (k: CategoryKey) => tours.filter((t) => t.category === k);

  useEffect(() => {
    if (activeCategory && hidden[activeCategory]) setActiveCategory(null);
  }, [hidden, activeCategory]);

  return (
    <section id="tours" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">أقسام الرحلات السياحية</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">نقدم لك مجموعة متنوعة من الرحلات السياحية والتجوالات</p>
        </div>

        {!activeCategory && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleCategories.map((c) => (
              <Card key={c.key} className="overflow-hidden p-0 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setActiveCategory(c.key)}>
                <div className="relative h-64 w-full">
                  <FastImg src={c.image} alt={c.label} className="h-64 w-full" eager />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{c.label}</h3>
                    <p className="text-sm opacity-90 mb-3">{c.description}</p>
                    <span className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full">{toursByCat(c.key).length} رحلات متاحة</span>
                  </div>
                </div>
              </Card>
            ))}
            {visibleCategories.length === 0 && !loading && (
              <div className="col-span-3 text-center py-12 text-gray-500">لا توجد أقسام متاحة حالياً</div>
            )}
          </div>
        )}

        {activeCategory && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">{CATEGORIES.find((c) => c.key === activeCategory)?.label}</h3>
              <Button variant="outline" onClick={() => setActiveCategory(null)} className="flex items-center gap-2">
                <X className="h-4 w-4" /> رجوع للأقسام
              </Button>
            </div>
            {loading ? (
              <p className="text-center text-gray-500 py-12">جارٍ التحميل...</p>
            ) : toursByCat(activeCategory).length === 0 ? (
              <p className="text-center text-gray-500 py-12">لا توجد رحلات في هذا القسم حالياً</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {toursByCat(activeCategory).map((t) => (
                  <Card key={t.id} className="overflow-hidden p-0 hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full">
                      <FastImg src={t.image} alt={t.title} className="h-48 w-full" />
                      {t.featured && <Badge className="absolute top-3 right-3 bg-yellow-500">مميزة</Badge>}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2">{t.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{t.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                        {t.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.duration}</span>}
                        {t.groupSize && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t.groupSize}</span>}
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {t.price}</span>
                      </div>
                      <Button className="w-full" onClick={() => setSelectedTour(t)}>عرض التفاصيل</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedTour} onOpenChange={(o) => !o && setSelectedTour(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTour && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTour.title}</DialogTitle>
                <DialogDescription>تفاصيل الرحلة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="h-64 w-full rounded-lg overflow-hidden">
                  <FastImg src={selectedTour.image} alt={selectedTour.title} className="h-64 w-full rounded-lg" eager />
                </div>
                <p className="text-gray-700 leading-relaxed">{selectedTour.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">المدة</p>
                    <p className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" />{selectedTour.duration || "—"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">المجموعة</p>
                    <p className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" />{selectedTour.groupSize || "—"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">السعر</p>
                    <p className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" />{selectedTour.price}</p>
                  </div>
                </div>
                <Button className="w-full" size="lg"><Check className="h-4 w-4 ml-2" /> احجز الآن</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
