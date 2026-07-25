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
import { Plus, Pencil, Trash2, Loader2, Settings } from 'lucide-react'

interface Service {
  id: string
  nameAr: string
  nameEn: string
  icon: string
  order: number
}

const emptyForm = { nameAr: '', nameEn: '', icon: '', order: 0 }

export default function AdminServices() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (item: Service) => {
    setEditing(item)
    setForm({ nameAr: item.nameAr, nameEn: item.nameEn, icon: item.icon, order: item.order })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameAr) { toast({ title: t('يرجى إدخال الاسم', 'Name is required'), variant: 'destructive' }); return }
    setSaving(true)
    try {
      const url = editing ? `/api/services/${editing.id}` : '/api/services'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast({ title: t('تم الحفظ', 'Saved') }); setDialogOpen(false); fetchItems() }
    } catch { toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/services/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: t('تم الحذف', 'Deleted') }); setDeleteId(null); fetchItems() }
    } catch { toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' }) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t(`${items.length} خدمة`, `${items.length} services`)}</p>
        <Button onClick={openAdd} size="sm" className="gap-2"><Plus className="w-4 h-4" />{t('إضافة خدمة', 'Add Service')}</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">{t('لا توجد خدمات', 'No services yet')}</Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                    {item.icon || <Settings className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.nameAr}</h3>
                    {item.nameEn && <p className="text-xs text-muted-foreground font-en" dir="ltr">{item.nameEn}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t('تعديل خدمة', 'Edit Service') : t('إضافة خدمة', 'Add Service')}</DialogTitle></DialogHeader>
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
            <AlertDialogTitle>{t('حذف الخدمة', 'Delete Service')}</AlertDialogTitle>
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