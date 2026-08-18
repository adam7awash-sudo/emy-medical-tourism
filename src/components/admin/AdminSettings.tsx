'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Save, Loader2, Phone, Mail, MessageCircle, Facebook, Instagram, Key, Code, Link, ImageIcon, Upload, X } from 'lucide-react'

interface SettingField {
  key: string
  labelAr: string
  labelEn: string
  icon: React.ReactNode
  type: 'text' | 'url' | 'password' | 'logo'
  dir?: 'ltr' | 'rtl'
  hint?: string
}

const fields: SettingField[] = [
  { key: 'site_logo', labelAr: 'شعار الموقع (Logo)', labelEn: 'Site Logo', icon: <ImageIcon className="w-5 h-5 text-primary" />, type: 'logo', hint: 'ارفع صورة الشعار اللي هيظهر في الهيدر والفوتر بدل حرف E' },
  { key: 'whatsapp', labelAr: 'رقم الواتساب', labelEn: 'WhatsApp Number', icon: <MessageCircle className="w-5 h-5 text-green-600" />, type: 'text', dir: 'ltr' },
  { key: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', icon: <Mail className="w-5 h-5 text-primary" />, type: 'text', dir: 'ltr' },
  { key: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', icon: <Phone className="w-5 h-5 text-primary" />, type: 'text', dir: 'ltr' },
  { key: 'facebook', labelAr: 'رابط فيسبوك', labelEn: 'Facebook URL', icon: <Facebook className="w-5 h-5 text-blue-600" />, type: 'url', dir: 'ltr' },
  { key: 'instagram', labelAr: 'رابط إنستغرام', labelEn: 'Instagram URL', icon: <Instagram className="w-5 h-5 text-pink-600" />, type: 'url', dir: 'ltr' },
  { key: 'resend_api_key', labelAr: 'مفتاح Resend API', labelEn: 'Resend API Key', icon: <Key className="w-5 h-5 text-violet-600" />, type: 'password', dir: 'ltr', hint: 're_xxxxxxxxxxxx - لازم عشان إرسال إيميلات الحجوزات' },
  { key: 'developer_name', labelAr: 'اسم المطور', labelEn: 'Developer Name', icon: <Code className="w-5 h-5 text-emt-gold" />, type: 'text', dir: 'ltr', hint: 'الاسم اللي هيظهر في الفوتر "Made by ..."' },
  { key: 'developer_link', labelAr: 'لينك المطور', labelEn: 'Developer Link', icon: <Link className="w-5 h-5 text-emt-gold" />, type: 'url', dir: 'ltr', hint: 'اللينك اللي المستخدم يروح لما يضغط على اسم المطور في الفوتر' },
]

export default function AdminSettings() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) setValues(await res.json())
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchSettings()
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setValues((prev) => ({ ...prev, site_logo: data.url }))
        toast({ title: t('تم رفع الشعار', 'Logo uploaded') })
      } else {
        toast({ title: t('فشل رفع الشعار', 'Logo upload failed'), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('فشل رفع الشعار', 'Logo upload failed'), variant: 'destructive' })
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = fields.map((f) => ({
        key: f.key,
        value: values[f.key] || '',
        type: f.type === 'password' ? 'text' : f.type,
      }))
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) toast({ title: t('تم الحفظ بنجاح', 'Saved successfully') })
    } catch { toast({ title: t('فشل الحفظ', 'Save failed'), variant: 'destructive' }) }
    finally { setSaving(false) }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('إعدادات التواصل والمعلومات', 'Contact & info settings')}</p>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ الإعدادات', 'Save Settings')}
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        </Button>
      </div>

      {/* Logo Upload Card - Special Design */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-sm font-medium">{t('شعار الموقع (Logo)', 'Site Logo')}</Label>
                <p className="text-xs text-muted-foreground mt-1">{t('ارفع صورة الشعار اللي هيظهر في الهيدر والفوتر بدل حرف E', 'Upload a logo image to replace the E letter in header and footer')}</p>
              </div>
              <div className="flex items-center gap-4">
                {values.site_logo ? (
                  <div className="relative">
                    <img src={values.site_logo} alt="Logo Preview" className="h-14 w-14 rounded-xl object-cover border-2 border-primary/20" />
                    <button
                      type="button"
                      onClick={() => setValues((prev) => ({ ...prev, site_logo: '' }))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-white font-extrabold text-xl">E</span>
                  </div>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Button type="button" variant="outline" size="sm" disabled={uploadingLogo} className="gap-2" onClick={() => logoInputRef.current?.click()}>
                  {uploadingLogo ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t('جاري الرفع...', 'Uploading...')}</>
                  ) : (
                    <><Upload className="w-4 h-4" />{t('رفع شعار', 'Upload Logo')}</>
                  )}
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t('أو أدخل رابط الصورة:', 'Or enter image URL:')}</Label>
                <Input
                  value={values.site_logo || ''}
                  onChange={(e) => setValues({ ...values, site_logo: e.target.value })}
                  dir="ltr"
                  className="text-sm font-en"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rest of the fields */}
      {fields.filter(f => f.type !== 'logo').map((field) => (
        <Card key={field.key} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">{field.icon}</div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm font-medium">{t(field.labelAr, field.labelEn)}</Label>
                <Input value={values[field.key] || ''} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} type={field.type} dir={field.dir || 'rtl'} placeholder={field.type === 'url' ? 'https://...' : ''} className="text-sm" />
                {field.hint && <p className="text-xs text-muted-foreground mt-1">{t(field.hint, field.hint)}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
