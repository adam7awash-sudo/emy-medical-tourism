
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Calendar, Users, DollarSign, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const CATEGORIES: { key: CategoryKey; label: string; image: string }[] = [
  {
    key: "religious",
    label: "سياحة دينية",
    image:
      "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=800&q=80",
  },
  {
    key: "cairo",
    label: "سياحة داخلية",
    image:
      "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80",
  },
  {
    key: "outside_cairo",
    label: "سياحة خارجية",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  },
];

export default function AdminTours() {
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "religious" as CategoryKey,
    price: "",
    duration: "",
    groupSize: "",
    image: "",
    featured: false,
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/tours");
      const data = await res.json();
      setTours(data.tours || []);
    } catch {
      toast({ title: "خطأ", description: "تعذر تحميل الرحلات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditId(null);
    setForm({
      title: "",
      description: "",
      category: "religious",
      price: "",
      duration: "",
      groupSize: "",
      image: "",
      featured: false,
    });
    setDialogOpen(true);
  }

  function openEdit(t: Tour) {
    setEditId(t.id);
    setForm({
      title: t.title,
      description: t.description,
      category: t.category,
      price: String(t.price),
      duration: t.duration,
      groupSize: t.groupSize,
      image: t.image,
      featured: t.featured,
    });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.title || !form.description) {
      toast({ title: "بيانات ناقصة", description: "اكتب العنوان والوصف", variant: "destructive" });
      return;
    }
    const body = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: Number(form.price) || 0,
      duration: form.duration,
      groupSize: form.groupSize,
      image:
        form.image ||
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      featured: form.featured,
    };
    try {
      const res = await fetch(
        editId ? `/api/tours/${editId}` : "/api/tours",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error();
      toast({ title: editId ? "تم التحديث" : "تمت الإضافة" });
      setDialogOpen(false);
      load();
    } catch {
      toast({ title: "خطأ", description: "حفظ فاشل", variant: "destructive" });
    }
  }

  async function remove(id: string) {
    if (!confirm("متأكد تحذف الرحلة دي؟")) return;
    try {
      await fetch(`/api/tours/${id}`, { method: "DELETE" });
      toast({ title: "تم الحذف" });
      load();
    } catch {
      toast({ title: "خطأ", description: "حذف فاشل", variant: "destructive" });
    }
  }

  const toursByCat = (k: CategoryKey) => tours.filter((t) => t.category === k);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الرحلات</h2>
          <p className="text-muted-foreground text-sm">
            ثلاث أقسام: دينية، داخلية، خارجية — كل قسم بصورته الجاهزة.
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> إضافة رحلة
        </Button>
      </div>

      {/* قسم الكروت الثلاثة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.map((c) => (
          <Card key={c.key} className="overflow-hidden p-0">
            <div className="relative h-44 w-full bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt={c.label}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-3 right-3 text-white">
                <h3 className="text-lg font-bold">{c.label}</h3>
                <p className="text-xs opacity-90">
                  {toursByCat(c.key).length} رحلات
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* جدول الرحلات */}
      <div className="space-y-4">
        {CATEGORIES.map((c) => (
          <div key={c.key}>
            <h3 className="text-lg font-semibold mb-2">{c.label}</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
            ) : toursByCat(c.key).length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد رحلات.</p>
            ) : (
              <div className="grid gap-3">
                {toursByCat(c.key).map((t) => (
                  <Card key={t.id} className="p-3 flex gap-3 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.image}
                      alt={t.title}
                      className="h-16 w-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{t.title}</h4>
                        {t.featured && (
                          <Badge className="text-xs">مميزة</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {t.description}
                      </p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> {t.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {t.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {t.groupSize}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(t)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(t.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* نافذة إضافة/تعديل رحلة */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل رحلة" : "إضافة رحلة"}</DialogTitle>
            <DialogDescription>املأ بيانات الرحلة.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>عنوان الرحلة</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>القسم</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as CategoryKey })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="religious">سياحة دينية</SelectItem>
                    <SelectItem value="cairo">سياحة داخلية</SelectItem>
                    <SelectItem value="outside_cairo">سياحة خارجية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>السعر</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المدة</Label>
                <Input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="مثلاً: 3 أيام"
                />
              </div>
              <div>
                <Label>حجم المجموعة</Label>
                <Input
                  value={form.groupSize}
                  onChange={(e) =>
                    setForm({ ...form, groupSize: e.target.value })
                  }
                  placeholder="مثلاً: 2-10"
                />
              </div>
            </div>
            <div>
              <Label>رابط الصورة (اختياري)</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              رحلة مميزة
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
