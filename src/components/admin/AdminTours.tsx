
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
import { Plus, Pencil, Trash2, Upload, Loader2, Star, MapPin, Clock, LayoutGrid, ImageIcon } from 'lucide-react'

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
  defaultImage: string
  gradient: string
}> = {
  religious: {
    key: 'religious',
    ar: 'سياحة دينية',
    en: 'Religious Tourism',
    descAr: 'زيارة المساجد والأماكن الدينية الإسلامية',
    descEn: 'Visit Islamic mosques and religious sites',
    defaultImage: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=800&h=600&fit=crop',
    gradient: 'from-amber-900/80 via-amber-800/60 to-transparent',
  },
  cairo: {
    key: 'cairo',
    ar: 'سياحة داخل القاهرة',
    en: 'Cairo Tourism',
    descAr: 'الأهرامات والمتاحف والمعالم الأثرية',
    descEn: 'Pyramids, museums and archaeological landmarks',
    defaultImage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
    gradient: 'from-blue-900/80 via-blue-800/60 to-transparent',
  },
  outside_cairo: {
    key: 'outside_cairo',
    ar: 'سياحة خارج القاهرة',
    en: 'Outside Cairo',
    descAr: 'شرم الشيخ والإسكندرية والغردقة والبحر الأحمر',
    descEn: 'Sharm El Sheikh, Alexandria, Hurghada & Red Sea',
    defaultImage: 'https://images.unsplash.com/photo-1583500178690-f7facca6f7af?w=800&h=600&fit=crop',
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

  // Category images state (overridable via SiteSetting)
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [catImgDialog, setCatImgDialog] = useState<string | null>(null)
  const [catImgValue, setCatImgValue] = useState('')
  const [catImgSaving, setCatImgSaving] = useState(false)

  const getCategoryImage = (key: string) =>
    categoryImages[key] || categoryConfig[key]?.defaultImage || ''

  const fetchCategoryImages = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, string> = {}
        categoryKeys.forEach((k) => {
          const v = data[`tour_category_image_${k}`]
          if (v) map[k] = v
        })
        setCategoryImages(map)
      }
    } catch { /* ignore */ }
  }, [])

  const openCatImgDialog = (key: string) => {
    setCatImgValue(getCategoryImage(key))
    setCatImgDialog(key)
  }

  const saveCategoryImage = async () => {
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
        setCategoryImages((prev) => ({ ...prev, [catImgDialog]: catImgValue }))
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

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tours')
      if (res.ok) setItems(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems(); fetchCategoryImages() }, [fetchItems, fetchCategoryImages])
