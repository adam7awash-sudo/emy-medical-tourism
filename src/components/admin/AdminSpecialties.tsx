'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Upload, Loader2, GraduationCap, ImageIcon } from 'lucide-react'

interface Specialty {
  id: string
  nameAr: string
  nameEn: string
  icon: string
  image: string
  order: number
}

const emptyForm = { nameAr: '', nameEn: '', icon: '', image: '', order: 0 }

export default function AdminSpecialties() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Specialty | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/specialties')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (item: Specialty) => {
    setEditing(item)
    setForm({ nameAr: item.nameAr, nameEn: item.nameEn, icon: item.icon, image: item.image, order: item.order })
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
    if (!form.nameAr) { toast({ title: t('يرجى إدخال الاسم', 'Name is required'), variant: 'destructive' }); return }
    setSaving(true)
    try {
      const url = editing ? `/api/specialties/${editing.id}` : '/api/specialties'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast({ title: t('تم الحفظ', 'Saved') }); setDialogOpen(false); fetchItems() }
    } catch { toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/specialties/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: t('تم الحذف', 'Deleted') }); setDeleteId(null); fetchItems() }
    } catch { toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' }) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t(`${items.length} تخصص`, `${items.length} specialties`)}</p>
        <Button onClick={openAdd} size="sm" className="gap-2"><Plus className="w-4 h-4" />{t('إضافة تخصص', 'Add Specialty')}</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">{t('لا توجد تخصصات', 'No specialties yet')}</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm overflow-hidden group">
              <div className="h-32 bg-muted relative flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{item.nameAr}</h3>
                  {item.nameEn && <p className="text-xs text-muted-foreground font-en" dir="ltr">{item.nameEn}</p>}
                </div>
                {item.icon && <span className="text-lg">{item.icon}</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t('تعديل تخصص', 'Edit Specialty') : t('إضافة تخصص', 'Add Specialty')}</DialogTitle></DialogHeader>
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
              <Label>{t('الأيقونة (إيموجي)', 'Icon (emoji)')}</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🏥" />
            </div>
            <div className="space-y-2">
              <Label>{t('الترتيب', 'Order')}</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{t('الصورة', 'Image')}</Label>
              <div className="flex items-center gap-3">
                {form.image && <img src={form.image} alt="preview" className="w-14 h-14 rounded-lg object-cover border" />}
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
            <AlertDialogTitle>{t('حذف التخصص', 'Delete Specialty')}</AlertDialogTitle>
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