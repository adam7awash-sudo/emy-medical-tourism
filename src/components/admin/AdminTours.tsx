'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Upload, Loader2, Star, MapPin, Clock, LayoutGrid } from 'lucide-react'

interface Tour {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  image: string
  price: string
  duration: string
  locationAr: string
  locationEn: string
  includesAr: string
  includesEn: string
  category: string
  featured: boolean
  order: number
  active: boolean
}

const emptyForm = {
  nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
  image: '', price: '', duration: '', locationAr: '', locationEn: '',
  includesAr: '', includesEn: '', category: 'religious', featured: false, order: 0,
}

const categoryConfig: Record<string, {
  key: string
  ar: string
  en: string
  descAr: string
  descEn: string
  image: string
  gradient: string
}> = {
  religious: {
    key: 'religious',
    ar: 'سياحة دينية',
    en: 'Religious Tourism',
    descAr: 'زيارة المساجد والأماكن الدينية الإسلامية',
    descEn: 'Visit Islamic mosques and religious sites',
    image: '/uploads/tour-categories/religious.jpg',
    gradient: 'from-amber-900/80 via-amber-800/60 to-transparent',
  },
  cairo: {
    key: 'cairo',
    ar: 'سياحة داخل القاهرة',
    en: 'Cairo Tourism',
    descAr: 'الأهرامات والمتاحف والمعالم الأثرية',
    descEn: 'Pyramids, museums and archaeological landmarks',
    image: '/uploads/tour-categories/cairo.jpg',
    gradient: 'from-blue-900/80 via-blue-800/60 to-transparent',
  },
  outside_cairo: {
    key: 'outside_cairo',
    ar: 'سياحة خارج القاهرة',
    en: 'Outside Cairo',
    descAr: 'شرم الشيخ والإسكندرية والغردقة والبحر الأحمر',
    descEn: 'Sharm El Sheikh, Alexandria, Hurghada & Red Sea',
    image: '/uploads/tour-categories/outside-cairo.jpg',
    gradient: 'from-cyan-900/80 via-cyan-800/60 to-transparent',
  },
}

const categoryKeys = Object.keys(categoryConfig)

export default function AdminTours() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Tour | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tours')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = (category?: string) => {
    setEditing(null)
    setForm({ ...emptyForm, category: category || 'religious' })
    setDialogOpen(true)
  }

  const openEdit = (item: Tour) => {
    setEditing(item)
    setForm({
      nameAr: item.nameAr, nameEn: item.nameEn,
      descriptionAr: item.descriptionAr, descriptionEn: item.descriptionEn,
      image: item.image, price: item.price, duration: item.duration,
      locationAr: item.locationAr, locationEn: item.locationEn,
      includesAr: item.includesAr, includesEn: item.includesEn,
      category: item.category, featured: item.featured, order: item.order,
    })
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setForm((f) => ({ ...f, image: data.url }))
      } else {
        toast({ title: t('فشل رفع الصورة', 'Image upload failed'), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('فشل رفع الصورة', 'Image upload failed'), variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.nameAr) {
      toast({ title: t('يرجى إدخال اسم الرحلة بالعربية', 'Tour name (Arabic) is required'), variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/tours/${editing.id}` : '/api/tours'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast({ title: t('تم الحفظ', 'Saved') })
        setDialogOpen(false)
        fetchItems()
      }
    } catch {
      toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tours/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: t('تم الحذف', 'Deleted') })
        setDeleteId(null)
        fetchItems()
      }
    } catch {
      toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' })
    } finally { setDeleting(false) }
  }

  const filteredItems = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items

  const getCategoryCount = (cat: string) => items.filter((i) => i.category === cat).length

  return (
    <div className="space-y-6">
      {/* Category Cards with Images */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categoryKeys.map((key) => {
          const cat = categoryConfig[key]
          const count = getCategoryCount(key)
          const isActive = activeCategory === key
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(isActive ? null : key)}
              className={`relative rounded-2xl overflow-hidden h-48 group transition-all duration-300 ${
                isActive ? 'ring-3 ring-primary ring-offset-2 shadow-lg' : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={t(cat.ar, cat.en)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
              {/* Bottom dark bar for text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-4">
                {/* Top: count badge */}
                <div className="flex justify-end">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                  }`}>
                    {count} {t('رحلة', 'tours')}
                  </span>
                </div>

                {/* Bottom: title & description */}
                <div className="text-right">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">
                    {t(cat.ar, cat.en)}
                  </h3>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
                    {t(cat.descAr, cat.descEn)}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {activeCategory
              ? t(
                  `${categoryConfig[activeCategory]?.ar || ''} - ${filteredItems.length} رحلة`,
                  `${categoryConfig[activeCategory]?.en || ''} - ${filteredItems.length} tours`
                )
              : t(`${items.length} رحلة`, `${items.length} tours`)
            }
          </p>
          {activeCategory && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setActiveCategory(null)}
            >
              {t('عرض الكل', 'Show All')}
            </Button>
          )}
        </div>
        <Button onClick={() => openAdd(activeCategory || undefined)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />{t('إضافة رحلة', 'Add Tour')}
        </Button>
      </div>

      {/* Tours List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">
          {activeCategory
            ? t('لا توجد رحلات في هذا التصنيف', 'No tours in this category')
            : t('لا توجد رحلات سياحية', 'No tours yet')
          }
        </Card>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const catInfo = categoryConfig[item.category]
              return (
                <Card key={item.id} className="border-0 shadow-sm overflow-hidden group">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-muted relative overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                      ) : catInfo ? (
                        <div className="w-full h-full relative">
                          <img src={catInfo.image} alt="" className="w-full h-full object-cover opacity-40" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-white/60" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <MapPin className="w-10 h-10" />
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">
                              {t(item.nameAr, item.nameEn)}
                            </h3>
                            {item.featured && (
                              <Badge className="bg-emt-gold text-white text-[10px] px-1.5 py-0">
                                <Star className="w-3 h-3 ml-0.5" />
                                {t('مميز', 'Featured')}
                              </Badge>
                            )}
                            {catInfo && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {t(catInfo.ar, catInfo.en)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {t(item.descriptionAr, item.descriptionEn)}
                          </p>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="text-primary font-bold text-lg">{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {t(item.locationAr, item.locationEn)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Hidden file input */}
      <input
        id="tours-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t('تعديل رحلة', 'Edit Tour') : t('إضافة رحلة', 'Add Tour')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Row: Name Ar + Name En */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('الاسم بالعربية', 'Name (Arabic)')} *</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('الاسم بالإنجليزية', 'Name (English)')}</Label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} dir="ltr" />
              </div>
            </div>

            {/* Row: Description Ar + En */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('الوصف بالعربية', 'Description (Arabic)')}</Label>
                <Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t('الوصف بالإنجليزية', 'Description (English)')}</Label>
                <Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} dir="ltr" />
              </div>
            </div>

            {/* Row: Location Ar + En */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('الموقع بالعربية', 'Location (Arabic)')}</Label>
                <Input value={form.locationAr} onChange={(e) => setForm({ ...form, locationAr: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('الموقع بالإنجليزية', 'Location (English)')}</Label>
                <Input value={form.locationEn} onChange={(e) => setForm({ ...form, locationEn: e.target.value })} dir="ltr" />
              </div>
            </div>

            {/* Row: Includes Ar + En */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('يشمل بالعربية', 'Includes (Arabic)')}</Label>
                <Textarea value={form.includesAr} onChange={(e) => setForm({ ...form, includesAr: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>{t('يشمل بالإنجليزية', 'Includes (English)')}</Label>
                <Textarea value={form.includesEn} onChange={(e) => setForm({ ...form, includesEn: e.target.value })} rows={2} dir="ltr" />
              </div>
            </div>

            {/* Row: Price + Duration + Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('السعر', 'Price')}</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" placeholder="$500" />
              </div>
              <div className="space-y-2">
                <Label>{t('المدة', 'Duration')}</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder={t('3 أيام', '3 days')} />
              </div>
              <div className="space-y-2">
                <Label>{t('الترتيب', 'Order')}</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            {/* Category selector with image cards */}
            <div className="space-y-2">
              <Label>{t('التصنيف', 'Category')}</Label>
              <div className="grid grid-cols-3 gap-3">
                {categoryKeys.map((key) => {
                  const cat = categoryConfig[key]
                  const isSelected = form.category === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, category: key })}
                      className={`relative rounded-xl overflow-hidden h-24 transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-primary ring-offset-2 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={cat.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="relative z-10 h-full flex items-end p-2.5">
                        <span className="text-white text-xs font-bold leading-tight">
                          {t(cat.ar, cat.en)}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
              <Label>{t('رحلة مميزة', 'Featured Tour')}</Label>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>{t('الصورة', 'Image')}</Label>
              <div className="flex items-center gap-3">
                {form.image && (
                  <img src={form.image} alt="tour" className="w-20 h-20 rounded-xl object-cover border bg-muted" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? t('جاري الرفع...', 'Uploading...') : t('رفع صورة', 'Upload Image')}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {t('حفظ', 'Save')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('حذف الرحلة', 'Delete Tour')}</AlertDialogTitle>
            <AlertDialogDescription>{t('هل أنت متأكد من الحذف؟', 'Are you sure?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{t('حذف', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}