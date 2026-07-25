'use client'

import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Save, Loader2, Phone, Mail, MessageCircle, Facebook, Instagram, Key } from 'lucide-react'

interface SettingField {
  key: string
  labelAr: string
  labelEn: string
  icon: React.ReactNode
  type: 'text' | 'url' | 'password'
  dir?: 'ltr' | 'rtl'
  hint?: string
}

const fields: SettingField[] = [
  { key: 'whatsapp', labelAr: 'رقم الواتساب', labelEn: 'WhatsApp Number', icon: <MessageCircle className="w-5 h-5 text-green-600" />, type: 'text', dir: 'ltr' },
  { key: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', icon: <Mail className="w-5 h-5 text-primary" />, type: 'text', dir: 'ltr' },
  { key: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', icon: <Phone className="w-5 h-5 text-primary" />, type: 'text', dir: 'ltr' },
  { key: 'facebook', labelAr: 'رابط فيسبوك', labelEn: 'Facebook URL', icon: <Facebook className="w-5 h-5 text-blue-600" />, type: 'url', dir: 'ltr' },
  { key: 'instagram', labelAr: 'رابط إنستغرام', labelEn: 'Instagram URL', icon: <Instagram className="w-5 h-5 text-pink-600" />, type: 'url', dir: 'ltr' },
  { key: 'resend_api_key', labelAr: 'مفتاح Resend API', labelEn: 'Resend API Key', icon: <Key className="w-5 h-5 text-violet-600" />, type: 'password', dir: 'ltr', hint: 're_xxxxxxxxxxxx - لازم عشان إرسال إيميلات الحجوزات' },
]

export default function AdminSettings() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

      {fields.map((field) => (
        <Card key={field.key} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {field.icon}
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm font-medium">{t(field.labelAr, field.labelEn)}</Label>
                <Input
                  value={values[field.key] || ''}
                  onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  type={field.type}
                  dir={field.dir || 'rtl'}
                  placeholder={field.type === 'url' ? 'https://...' : ''}
                  className="text-sm"
                />
                {field.hint && (
                  <p className="text-xs text-muted-foreground mt-1">{t(field.hint, field.hint)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}