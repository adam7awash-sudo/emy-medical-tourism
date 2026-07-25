'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Save, Loader2, FileText, Image as ImageIcon, Type, Hash, Upload, Trash2 } from 'lucide-react'

interface ContentItem {
  key: string
  labelAr: string
  labelEn: string
  ar: string
  en: string
  type: 'text' | 'textarea' | 'image'
}

const fieldGroups: { titleAr: string; titleEn: string; icon: React.ReactNode; keys: { key: string; labelAr: string; labelEn: string; type: 'text' | 'textarea' | 'image' }[] }[] = [
  {
    titleAr: 'قسم البطل (Hero)',
    titleEn: 'Hero Section',
    icon: <FileText className="w-4 h-4 text-primary" />,
    keys: [
      { key: 'hero_headline', labelAr: 'العنوان الرئيسي', labelEn: 'Main Headline', type: 'text' },
      { key: 'hero_subheadline', labelAr: 'العنوان الفرعي', labelEn: 'Sub Headline', type: 'text' },
      { key: 'hero_description', labelAr: 'الوصف', labelEn: 'Description', type: 'textarea' },
      { key: 'hero_bg_image', labelAr: 'صورة الخلفية', labelEn: 'Background Image', type: 'image' },
    ],
  },
  {
    titleAr: 'قسم من نحن',
    titleEn: 'About Section',
    icon: <FileText className="w-4 h-4 text-emerald-600" />,
    keys: [
      { key: 'about_description', labelAr: 'نبذة عن EMT', labelEn: 'About EMT', type: 'textarea' },
      { key: 'about_mission', labelAr: 'رسالتنا', labelEn: 'Our Mission', type: 'textarea' },
      { key: 'about_vision', labelAr: 'رؤيتنا', labelEn: 'Our Vision', type: 'textarea' },
    ],
  },
  {
    titleAr: 'المؤسس',
    titleEn: 'Founder',
    icon: <Type className="w-4 h-4 text-violet-600" />,
    keys: [
      { key: 'founder_name', labelAr: 'اسم المؤسس', labelEn: 'Founder Name', type: 'text' },
      { key: 'founder_title', labelAr: 'لقب المؤسس', labelEn: 'Founder Title', type: 'text' },
      { key: 'founder_image', labelAr: 'صورة المؤسس', labelEn: 'Founder Image', type: 'image' },
    ],
  },
  {
    titleAr: 'الإحصائيات',
    titleEn: 'Statistics',
    icon: <Hash className="w-4 h-4 text-amber-600" />,
    keys: [
      { key: 'stats_doctors', labelAr: 'عدد الأطباء', labelEn: 'Doctors Count', type: 'text' },
      { key: 'stats_specialties', labelAr: 'عدد التخصصات', labelEn: 'Specialties Count', type: 'text' },
      { key: 'stats_patients', labelAr: 'عدد المرضى', labelEn: 'Patients Count', type: 'text' },
    ],
  },
  {
    titleAr: 'الأقسام الأخرى',
    titleEn: 'Other Sections',
    icon: <FileText className="w-4 h-4 text-rose-600" />,
    keys: [
      { key: 'services_title', labelAr: 'عنوان الخدمات', labelEn: 'Services Title', type: 'text' },
      { key: 'services_description', labelAr: 'وصف الخدمات', labelEn: 'Services Description', type: 'text' },
      { key: 'contact_title', labelAr: 'عنوان التواصل', labelEn: 'Contact Title', type: 'text' },
      { key: 'contact_description', labelAr: 'وصف التواصل', labelEn: 'Contact Description', type: 'text' },
    ],
  },
]

function ImageField({
  item,
  isChanged,
  uploading,
  onUpload,
  onChangeUrl,
  onRemove,
  t,
}: {
  item: ContentItem
  isChanged: boolean
  uploading: boolean
  onUpload: (key: string, file: File) => void
  onChangeUrl: (key: string, url: string) => void
  onRemove: (key: string) => void
  t: (ar: string, en: string) => string
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(item.key, file)
    }
    // Always reset so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Preview + Upload button row */}
      <div className="flex items-center gap-4">
        {item.ar ? (
          <div className="relative group shrink-0">
            <img
              src={item.ar}
              alt="preview"
              className="w-24 h-24 rounded-xl object-cover border shadow-sm"
            />
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t('جاري الرفع...', 'Uploading...')}</>
            ) : (
              <><Upload className="w-4 h-4" />{t('اختر صورة', 'Choose Image')}</>
            )}
          </Button>
          {isChanged && (
            <span className="text-xs text-primary">{t('تم التعديل - اضغط حفظ', 'Modified - click Save')}</span>
          )}
        </div>
      </div>

      {/* URL input */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t('أو أدخل رابط الصورة:', 'Or enter image URL:')}</Label>
        <div className="flex gap-2">
          <Input
            value={item.ar}
            onChange={(e) => onChangeUrl(item.key, e.target.value)}
            dir="ltr"
            className="text-sm font-en"
            placeholder="https://..."
            onKeyDown={(e) => e.stopPropagation()}
          />
          {item.ar && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(item.key)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminHomepage() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changed, setChanged] = useState<Set<string>>(new Set())
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/homepage')
        if (res.ok) {
          const data: Record<string, { ar: string; en: string }> = await res.json()
          const list: ContentItem[] = []
          for (const group of fieldGroups) {
            for (const field of group.keys) {
              list.push({
                key: field.key,
                labelAr: field.labelAr,
                labelEn: field.labelEn,
                ar: data[field.key]?.ar || '',
                en: data[field.key]?.en || '',
                type: field.type,
              })
            }
          }
          setItems(list)
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchContent()
  }, [])

  const updateField = useCallback((key: string, field: 'ar' | 'en', value: string) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)))
    setChanged((prev) => new Set(prev).add(key))
  }, [])

  const handleUpload = useCallback(async (key: string, file: File) => {
    setUploadingKey(key)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        updateField(key, 'ar', data.url)
        updateField(key, 'en', data.url)
        toast({ title: t('تم رفع الصورة بنجاح', 'Image uploaded') })
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: t('فشل رفع الصورة', 'Upload failed'), description: String(err.error || ''), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('فشل رفع الصورة', 'Upload failed'), variant: 'destructive' })
    } finally {
      setUploadingKey(null)
    }
  }, [updateField, toast, t])

  const handleRemoveImage = useCallback((key: string) => {
    updateField(key, 'ar', '')
    updateField(key, 'en', '')
  }, [updateField])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Only save changed items
      const changedItems = items.filter((item) => changed.has(item.key))
      if (changedItems.length === 0) return

      const body = changedItems.map((item) => ({
        key: item.key,
        ar: item.ar,
        en: item.en,
        type: item.type,
      }))
      const res = await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: t('تم الحفظ بنجاح', 'Saved successfully') })
        setChanged(new Set())
      } else {
        toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  }

  const getItem = (key: string) => items.find((item) => item.key === key)

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex items-center justify-between py-3 px-1">
        <p className="text-sm text-muted-foreground">
          {t('تعديل محتوى الصفحة الرئيسية', 'Edit homepage content')}
          {changed.size > 0 && (
            <span className="text-primary font-medium mr-2">
              ({changed.size} {t('تعديل', 'changes')})
            </span>
          )}
        </p>
        <Button onClick={handleSave} disabled={saving || changed.size === 0} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>
      </div>

      {/* Grouped Sections */}
      {fieldGroups.map((group) => (
        <div key={group.titleEn}>
          <div className="flex items-center gap-2 mb-3">
            {group.icon}
            <h3 className="text-base font-semibold text-foreground">
              {t(group.titleAr, group.titleEn)}
            </h3>
          </div>
          <div className="space-y-3 mb-6">
            {group.keys.map((field) => {
              const item = getItem(field.key)
              if (!item) return null
              const isChanged = changed.has(item.key)
              const isImage = item.type === 'image'
              const isTextarea = item.type === 'textarea'

              return (
                <Card key={item.key} className={`border-0 shadow-sm transition-colors ${isChanged ? 'ring-2 ring-primary/30' : ''}`}>
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {isImage ? <ImageIcon className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
                      {t(item.labelAr, item.labelEn)}
                      {isChanged && <span className="text-xs text-primary font-normal">({t('معدل', 'modified')})</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {isImage ? (
                      <ImageField
                        item={item}
                        isChanged={isChanged}
                        uploading={uploadingKey === item.key}
                        onUpload={handleUpload}
                        onChangeUrl={(key, url) => updateField(key, 'ar', url)}
                        onRemove={handleRemoveImage}
                        t={t}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">العربية</Label>
                          {isTextarea ? (
                            <Textarea
                              value={item.ar}
                              onChange={(e) => updateField(item.key, 'ar', e.target.value)}
                              dir="rtl"
                              rows={3}
                              className="text-sm"
                            />
                          ) : (
                            <Input
                              value={item.ar}
                              onChange={(e) => updateField(item.key, 'ar', e.target.value)}
                              dir="rtl"
                              className="text-sm"
                            />
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">English</Label>
                          {isTextarea ? (
                            <Textarea
                              value={item.en}
                              onChange={(e) => updateField(item.key, 'en', e.target.value)}
                              dir="ltr"
                              rows={3}
                              className="text-sm font-en"
                            />
                          ) : (
                            <Input
                              value={item.en}
                              onChange={(e) => updateField(item.key, 'en', e.target.value)}
                              dir="ltr"
                              className="text-sm font-en"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}