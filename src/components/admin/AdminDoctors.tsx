'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Upload, Loader2, ImageIcon } from 'lucide-react'

interface Doctor {
  id: string
  nameAr: string
  nameEn: string
  titleAr: string
  titleEn: string
  specialtyId: string | null
  image: string
  order: number
}

interface Specialty {
  id: string
  nameAr: string
  nameEn: string
}

const emptyDoctor = { nameAr: '', nameEn: '', titleAr: '', titleEn: '', specialtyId: '', image: '', order: 0 }

export default function AdminDoctors() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form, setForm] = useState(emptyDoctor)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [docRes, specRes] = await Promise.all([fetch('/api/doctors'), fetch('/api/specialties')])
      if (docRes.ok) setDoctors(await docRes.json())
      if (specRes.ok) setSpecialties(await specRes.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => { setEditing(null); setForm(emptyDoctor); setDialogOpen(true) }
  const openEdit = (d: Doctor) => {
    setEditing(d)
    setForm({ nameAr: d.nameAr, nameEn: d.nameEn, titleAr: d.titleAr, titleEn: d.titleEn, specialtyId: d.specialtyId || '', image: d.image, order: d.order })
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
      }
    } catch { toast({ title: t('فشل رفع الصورة', 'Upload failed'), variant: 'destructive' }) }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.nameAr || !form.titleAr) {
      toast({ title: t('يرجى ملء الحقول المطلوبة', 'Please fill required fields'), variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const body = { ...form, specialtyId: form.specialtyId || null }
      const url = editing ? `/api/doctors/${editing.id}` : '/api/doctors'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        toast({ title: t('تم الحفظ', 'Saved successfully') })
        setDialogOpen(false)
        fetchData()
      }
    } catch { toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/doctors/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: t('تم الحذف', 'Deleted') }); setDeleteId(null); fetchData() }
    } catch { toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' }) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t(`${doctors.length} طبيب`, `${doctors.length} doctors`)}
        </p>
        <Button onClick={openAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          {t('إضافة طبيب', 'Add Doctor')}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : doctors.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">
          {t('لا يوجد أطباء بعد', 'No doctors yet')}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {doctors.map((d) => (
            <Card key={d.id} className="border-0 shadow-sm overflow-hidden group">
              <div className="h-44 bg-muted relative">
                {d.image ? (
                  <img src={d.image} alt={d.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => openEdit(d)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => setDeleteId(d.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm">{d.nameAr}</h3>
                {d.nameEn && <p className="text-xs text-muted-foreground font-en" dir="ltr">{d.nameEn}</p>}
                <p className="text-xs text-primary mt-1">{d.titleAr}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t('تعديل طبيب', 'Edit Doctor') : t('إضافة طبيب', 'Add Doctor')}</DialogTitle>
          </DialogHeader>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('اللقب (عربي)', 'Title (Ar)')} *</Label>
                <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('اللقب (إنجليزي)', 'Title (En)')}</Label>
                <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('التخصص', 'Specialty')}</Label>
              <Select value={form.specialtyId} onValueChange={(v) => setForm({ ...form, specialtyId: v })}>
                <SelectTrigger><SelectValue placeholder={t('اختر التخصص', 'Select specialty')} /></SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('الترتيب', 'Order')}</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{t('الصورة', 'Image')}</Label>
              <div className="flex items-center gap-3">
                {form.image && (
                  <img src={form.image} alt="preview" className="w-16 h-16 rounded-lg object-cover border" />
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span><Upload className="w-4 h-4 ml-2" />{uploading ? t('جاري الرفع...', 'Uploading...') : t('رفع صورة', 'Upload Image')}</span>
                  </Button>
                </label>
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
            <AlertDialogTitle>{t('حذف الطبيب', 'Delete Doctor')}</AlertDialogTitle>
            <AlertDialogDescription>{t('هل أنت متأكد من الحذف؟', 'Are you sure you want to delete?')}</AlertDialogDescription>
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