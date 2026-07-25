'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Upload, Loader2, Star, BookOpen, ImageIcon } from 'lucide-react'

interface Story {
  id: string
  nameAr: string
  nameEn: string
  country: string
  storyAr: string
  storyEn: string
  image: string
  rating: number
  order: number
}

const emptyForm = { nameAr: '', nameEn: '', country: '', storyAr: '', storyEn: '', image: '', rating: 5, order: 0 }

export default function AdminStories() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Story | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stories')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (item: Story) => {
    setEditing(item)
    setForm({
      nameAr: item.nameAr, nameEn: item.nameEn, country: item.country,
      storyAr: item.storyAr, storyEn: item.storyEn, image: item.image,
      rating: item.rating, order: item.order,
    })
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) { const data = await res.json(); setForm((f) => ({ ...f, image: data.url })) }
    } catch { toast({ title: t('فشل رفع الصورة', 'Upload failed'), variant: 'destructive' }) }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.nameAr || !form.storyAr) {
      toast({ title: t('يرجى ملء الحقول المطلوبة', 'Please fill required fields'), variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const url = editing ? `/api/stories/${editing.id}` : '/api/stories'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast({ title: t('تم الحفظ', 'Saved') }); setDialogOpen(false); fetchItems() }
    } catch { toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/stories/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: t('تم الحذف', 'Deleted') }); setDeleteId(null); fetchItems() }
    } catch { toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' }) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t(`${items.length} قصة`, `${items.length} stories`)}</p>
        <Button onClick={openAdd} size="sm" className="gap-2"><Plus className="w-4 h-4" />{t('إضافة قصة', 'Add Story')}</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">{t('لا توجد قصص', 'No stories yet')}</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm overflow-hidden group">
              <div className="h-44 bg-muted relative">
                {item.image ? (
                  <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-muted-foreground/40" /></div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{item.nameAr}</h3>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                {item.country && <p className="text-xs text-muted-foreground">{item.country}</p>}
                <p className="text-xs text-muted-foreground line-clamp-2">{item.storyAr}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t('تعديل قصة', 'Edit Story') : t('إضافة قصة', 'Add Story')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('الاسم (عربي)', 'Name (Ar)')} *</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('الاسم (إنجليزي)', 'Name (En)')}</Label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('البلد', 'Country')}</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('القصة (عربي)', 'Story (Ar)')} *</Label>
                <Textarea value={form.storyAr} onChange={(e) => setForm({ ...form, storyAr: e.target.value })} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>{t('القصة (إنجليزي)', 'Story (En)')}</Label>
                <Textarea value={form.storyEn} onChange={(e) => setForm({ ...form, storyEn: e.target.value })} rows={4} dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('التقييم', 'Rating')}</Label>
                <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)) })} />
              </div>
              <div className="space-y-2">
                <Label>{t('الترتيب', 'Order')}</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('الصورة', 'Image')}</Label>
              <div className="flex items-center gap-3">
                {form.image && <img src={form.image} alt="preview" className="w-16 h-16 rounded-lg object-cover border" />}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span><Upload className="w-4 h-4 ml-2" />{uploading ? t('جاري الرفع...', 'Uploading...') : t('رفع صورة', 'Upload')}</span>
                  </Button>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{t('حفظ', 'Save')}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('حذف القصة', 'Delete Story')}</AlertDialogTitle>
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