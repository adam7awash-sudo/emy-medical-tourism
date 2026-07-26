'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Pencil, Trash2, Loader2, Star, MapPin, Clock, Image as ImageIcon } from 'lucide-react'

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
}

const CATEGORIES: Record<string, {
  ar: string; en: string; descAr: string; descEn: string; gradient: string; defaultImage: string
}> = {
  religious: {
    ar: 'سياحة دينية', en: 'Religious Tourism',
    descAr: 'زيارة المساجد والأماكن الدينية الإسلامية',
    descEn: 'Visit Islamic mosques and religious sites',
    gradient: 'from-amber-900/80 via-amber-800/60 to-transparent',
    defaultImage: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=800&h=600&fit=crop',
  },
  cairo: {
    ar: 'سياحة داخل القاهرة', en: 'Cairo Tourism',
    descAr: 'الأهرامات والمتاحف والمعالم الأثرية',
    descEn: 'Pyramids, museums and archaeological landmarks',
    gradient: 'from-blue-900/80 via-blue-800/60 to-transparent',
    defaultImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
  },
  outside_cairo: {
    ar: 'سياحة خارج القاهرة', en: 'Outside Cairo',
    descAr: 'شرم الشيخ والإسكندرية والغردقة والبحر الأحمر',
    descEn: 'Sharm El Sheikh, Alexandria, Hurghada & Red Sea',
    gradient: 'from-cyan-900/80 via-cyan-800/60 to-transparent',
    defaultImage: 'https://images.unsplash.com/photo-1583500178690-f7facca6f7af?w=800&h=600&fit=crop',
  },
}

const CATEGORY_KEYS = Object.keys(CATEGORIES)

const emptyForm = {
  nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
  image: '', price: '', duration: '', locationAr: '', locationEn: '',
  includesAr: '', includesEn: '', category: 'religious', featured: false, order: 0,
}

export default function AdminTours() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Tour | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [catImages, setCatImages] = useState<Record<string, string>>({})
  const [catImgDialog, setCatImgDialog] = useState<string | null>(null)
  const [catImgValue, setCatImgValue] = useState('')
  const [catImgSaving, setCatImgSaving] = useState(false)

  const getCatImage = (key: string) =>
    catImages[key] || CATEGORIES[key]?.defaultImage || ''

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tours')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  const fetchCatImages = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, string> = {}
        CATEGORY_KEYS.forEach((k) => {
          const v = data[`tour_category_image_${k}`]
          if (v) map[k] = v
        })
        setCatImages(map)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchItems()
    fetchCatImages()
  }, [fetchItems, fetchCatImages])

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

  const openCatImg = (key: string) => {
    setCatImgValue(getCatImage(key))
    setCatImgDialog(key)
  }

  const saveCatImage = async () => {
    if (!catImgDialog) return
    setCatImgSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `tour_category_image_${catImgDialog}`,
          value: catImgValue,
          type: 'image',
        }),
      })
      if (res.ok) {
        setCatImages((prev) => ({ ...prev, [catImgDialog]: catImgValue }))
        toast({ title: t('تم حفظ صورة التصنيف', 'Category image saved') })
        setCatImgDialog(null)
      } else {
        toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' })
    } finally {
      setCatImgSaving(false)
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

  const filteredItems = activeCategory ? items.filter((i) => i.category === activeCategory) : items
  const getCount = (cat: string) => items.filter((i) => i.category === cat).length

  return (
    <div className="space-y-6">
      {/* Category Cards with Editable Images */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORY_KEYS.map((key) => {
          const cat = CATEGORIES[key]
          const count = getCount(key)
          const isActive = activeCategory === key
          const imgSrc = getCatImage(key)
          return (
            <div
              key={key}
              className={`relative rounded-2xl overflow-hidden h-52 group transition-all duration-300 ${
                isActive ? 'ring-4 ring-primary ring-offset-2 shadow-lg' : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              <img
                src={imgSrc}
                alt={t(cat.ar, cat.en)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Edit Image Button - top-left, very visible */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openCatImg(key) }}
                className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-white text-foreground px-3 py-2 rounded-lg shadow-lg hover:bg-primary hover:text-white transition-all font-medium text-xs"
                title={t('تغيير الصورة', 'Change Image')}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{t('تغيير الصورة', 'Change Image')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory(isActive ? null : key)}
                className="absolute inset-0 w-full h-full cursor-pointer"
                aria-label={t(cat.ar, cat.en)}
              />

              <div className="relative z-10 h-full flex flex-col justify-between p-4 pointer-events-none">
                <div className="flex justify-end">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                  }`}>
                    {count} {t('رحلة', 'tours')}
                  </span>
                </div>
                <div className="text-right">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">{t(cat.ar, cat.en)}</h3>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{t(cat.descAr, cat.descEn)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {activeCategory
            ? t(`${CATEGORIES[activeCategory]?.ar} - ${filteredItems.length} رحلة`, `${CATEGORIES[activeCategory]?.en} - ${filteredItems.length} tours`)
            : t(`${items.length} رحلة`, `${items.length} tours`)}
        </p>
        {activeCategory && (
          <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)}>{t('عرض الكل', 'Show All')}</Button>
        )}
        <Button onClick={() => openAdd(activeCategory || undefined)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />{t('إضافة رحلة', 'Add Tour')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">
          {activeCategory ? t('لا توجد رحلات في هذا التصنيف', 'No tours in this category') : t('لا توجد رحلات سياحية', 'No tours yet')}
        </Card>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const catInfo = CATEGORIES[item.category]
              return (
                <Card key={item.id} className="border-0 shadow-sm overflow-hidden group">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-muted relative overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40"><MapPin className="w-10 h-10" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setDeleteId(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">{t(item.nameAr, item.nameEn)}</h3>
                            {item.featured && <Badge className="bg-emt-gold text-white text-[10px] px-1.5 py-0"><Star className="w-3 h-3 ml-0.5" />{t('مميز', 'Featured')}</Badge>}
                            {catInfo && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t(catInfo.ar, catInfo.en)}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{t(item.descriptionAr, item.descriptionEn)}</p>
                        </div>
                        <p className="text-primary font-bold text-lg shrink-0">{item.price}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t(item.locationAr, item.locationEn)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.duration}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t('تعديل رحلة', 'Edit Tour') : t('إضافة رحلة', 'Add Tour')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('الاسم بالعربية', 'Name (Arabic)')} *</Label><Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('الاسم بالإنجليزية', 'Name (English)')}</Label><Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('الوصف بالعربية', 'Description (Arabic)')}</Label><Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={3} /></div>
              <div className="space-y-2"><Label>{t('الوصف بالإنجليزية', 'Description (English)')}</Label><Textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('الموقع بالعربية', 'Location (Arabic)')}</Label><Input value={form.locationAr} onChange={(e) => setForm({ ...form, locationAr: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('الموقع بالإنجليزية', 'Location (English)')}</Label><Input value={form.locationEn} onChange={(e) => setForm({ ...form, locationEn: e.target.value })} dir="ltr" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t('السعر', 'Price')}</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" placeholder="$500" /></div>
              <div className="space-y-2"><Label>{t('المدة', 'Duration')}</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder={t('3 أيام', '3 days')} /></div>
              <div className="space-y-2"><Label>{t('الترتيب', 'Order')}</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2">
              <Label>{t('التصنيف', 'Category')}</Label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORY_KEYS.map((key) => {
                  const cat = CATEGORIES[key]
                  const isSelected = form.category === key
                  return (
                    <button key={key} type="button" onClick={() => setForm({ ...form, category: key })} className={`relative rounded-xl overflow-hidden h-24 transition-all duration-200 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'}`}>
                      <img src={getCatImage(key)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="relative z-10 h-full flex items-end p-2.5"><span className="text-white text-xs font-bold leading-tight">{t(cat.ar, cat.en)}</span></div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label>{t('رحلة مميزة', 'Featured Tour')}</Label></div>
            <div className="space-y-2">
              <Label>{t('رابط الصورة', 'Image URL')}</Label>
              <div className="flex items-center gap-3">
                {form.image && <img src={form.image} alt="tour" className="w-20 h-20 rounded-xl object-cover border bg-muted" />}
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} dir="ltr" className="font-en" placeholder="https://..." onKeyDown={(e) => e.stopPropagation()} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{t('حفظ', 'Save')}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('حذف الرحلة', 'Delete Tour')}</AlertDialogTitle>
            <AlertDialogDescription>{t('هل أنت متأكد من الحذف؟', 'Are you sure?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">{deleting && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{t('حذف', 'Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!catImgDialog} onOpenChange={() => setCatImgDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('تغيير صورة التصنيف', 'Change Category Image')}
              {catImgDialog && <span className="block text-sm font-normal text-muted-foreground mt-1">{t(CATEGORIES[catImgDialog]?.ar, CATEGORIES[catImgDialog]?.en)}</span>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative border">
              {catImgValue ? <img src={catImgValue} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-12 h-12 opacity-30" /></div>}
            </div>
            <div className="space-y-2">
              <Label>{t('رابط الصورة', 'Image URL')}</Label>
              <Input value={catImgValue} onChange={(e) => setCatImgValue(e.target.value)} dir="ltr" className="font-en" placeholder="https://..." onKeyDown={(e) => e.stopPropagation()} />
              <p className="text-xs text-muted-foreground">{t('ألصق رابط الصورة هنا.', 'Paste image URL here.')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatImgDialog(null)}>{t('إلغاء', 'Cancel')}</Button>
            <Button onClick={saveCatImage} disabled={catImgSaving}>{catImgSaving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{t('حفظ', 'Save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
