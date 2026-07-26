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
import { Plus, Pencil, Trash2, Upload, Loader2, Handshake, ImageIcon, ExternalLink } from 'lucide-react'

interface Partner {
  id: string
  name: string
  logo: string
  url: string
  order: number
}

const emptyForm = { name: '', logo: '', url: '', order: 0 }

export default function AdminPartners() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partners')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (item: Partner) => {
    setEditing(item)
    setForm({ name: item.name, logo: item.logo, url: item.url, order: item.order })
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) { const data = await res.json(); setForm((f) => ({ ...f, logo: data.url })) }
    } catch { toast({ title: t('فشل رفع الشعار', 'Upload failed'), variant: 'destructive' }) }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.name) { toast({ title: t('يرجى إدخال الاسم', 'Name is required'), variant: 'destructive' }); return }
    setSaving(true)
    try {
      const url = editing ? `/api/partners/${editing.id}` : '/api/partners'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast({ title: t('تم الحفظ', 'Saved') }); setDialogOpen(false); fetchItems() }
    } catch { toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/partners/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: t('تم الحذف', 'Deleted') }); setDeleteId(null); fetchItems() }
    } catch { toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' }) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t(`${items.length} شريك`, `${items.length} partners`)}</p>
        <Button onClick={openAdd} size="sm" className="gap-2"><Plus className="w-4 h-4" />{t('إضافة شريك', 'Add Partner')}</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-0 shadow-sm p-10 text-center text-muted-foreground text-sm">{t('لا يوجد شركاء', 'No partners yet')}</Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm overflow-hidden group relative">
              <div className="h-28 bg-muted flex items-center justify-center p-4 relative">
                {item.logo ? (
                  <img src={item.logo} alt={item.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <Handshake className="w-10 h-10 text-muted-foreground/40" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setDeleteId(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="text-xs font-medium text-center truncate">{item.name}</h3>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary text-center block truncate hover:underline" dir="ltr">
                    {item.url}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t('تعديل شريك', 'Edit Partner') : t('إضافة شريك', 'Add Partner')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('الاسم', 'Name')} *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('الرابط', 'URL')}</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} dir="ltr" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>{t('الترتيب', 'Order')}</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{t('الشعار', 'Logo')}</Label>
              <div className="flex items-center gap-3">
                {form.logo && <img src={form.logo} alt="logo" className="w-14 h-14 rounded-lg object-contain border p-1 bg-muted" />}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span><Upload className="w-4 h-4 ml-2" />{uploading ? t('جاري الرفع...', 'Uploading...') : t('رفع شعار', 'Upload Logo')}</span>
                  </Button>
                </label>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t('أو أدخل رابط الشعار:', 'Or enter logo URL:')}</Label>
                <Input
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  dir="ltr"
                  className="text-sm font-en"
                  placeholder="https://..."
                  onKeyDown={(e) => e.stopPropagation()}
                />
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
            <AlertDialogTitle>{t('حذف الشريك', 'Delete Partner')}</AlertDialogTitle>
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