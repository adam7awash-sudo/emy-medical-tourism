'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Upload, Loader2, ImageIcon } from 'lucide-react'

interface GalleryImage {
  id: string
  title: string
  image: string
  category: string
  order: number
}

const categories = [
  { value: 'general', labelAr: 'عام', labelEn: 'General' },
  { value: 'clinic', labelAr: 'عيادات', labelEn: 'Clinics' },
  { value: 'hospital', labelAr: 'مستشفيات', labelEn: 'Hospitals' },
  { value: 'tourism', labelAr: 'سياحة', labelEn: 'Tourism' },
  { value: 'before_after', labelAr: 'قبل وبعد', labelEn: 'Before & After' },
]

const emptyForm = { title: '', image: '', category: 'general', order: 0 }

export default function AdminGallery() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gallery')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setForm((f) => ({ ...f, image: data.url }))
        toast({ title: t('تم رفع الصورة', 'Image uploaded') })
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: t('فشل رفع الصورة', 'Upload failed'), description: String(err.error || ''), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('فشل رفع الصورة', 'Upload failed'), variant: 'destructive' })
    }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleSave = async () => {
    if (!form.image) { toast({ title: t('يرجى رفع صورة', 'Please upload an image'), variant: 'destructive' }); return }
    setSaving(true)
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast({ title: t('تم الإضافة', 'Added') }); setDialogOpen(false); setForm(emptyForm); fetchItems() }
    } catch { toast({ title: t('فشل الإضافة', 'Add failed'), variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/gallery/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: t('تم الحذف', 'Deleted') }); setDeleteId(null); fetchItems() }
    } catch { toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' }) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t(`${items.length} صورة`, `${items.length} images`)}</p>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true) }} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />{t('إضافة صورة', 'Add Image')}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">{t('لا توجد صور', 'No images yet')}</Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const cat = categories.find((c) => c.value === item.category)
            return (
              <Card key={item.id} className="border-0 shadow-sm overflow-hidden group relative">
                <div className="h-40 bg-muted">
                  <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-3 opacity-0 group-hover:opacity-100">
                  <div>
                    {item.title && <p className="text-white text-sm font-medium">{item.title}</p>}
                    {cat && <p className="text-white/70 text-xs">{t(cat.labelAr, cat.labelEn)}</p>}
                  </div>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setDeleteId(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-3 hidden group-hover:hidden">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {cat && <p className="text-xs text-muted-foreground">{t(cat.labelAr, cat.labelEn)}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('إضافة صورة للمعرض', 'Add Gallery Image')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('العنوان', 'Title')}</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('التصنيف', 'Category')}</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{t(c.labelAr, c.labelEn)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('الترتيب', 'Order')}</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{t('الصورة', 'Image')} *</Label>
              <div className="flex items-center gap-3">
                {form.image && <img src={form.image} alt="preview" className="w-20 h-20 rounded-lg object-cover border" />}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button type="button" variant="outline" size="sm" disabled={uploading} className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />{t('جاري الرفع...', 'Uploading...')}</> : <><Upload className="w-4 h-4" />{t('رفع صورة', 'Upload Image')}</>}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}{t('إضافة', 'Add')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('حذف الصورة', 'Delete Image')}</AlertDialogTitle>
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