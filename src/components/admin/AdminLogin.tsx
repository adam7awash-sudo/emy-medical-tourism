'use client'

import { useState } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { useAdminStore } from '@/store/admin-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Heart, ShieldCheck } from 'lucide-react'

interface AdminLoginProps {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const { t } = useLanguageStore()
  const { login } = useAdminStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError(t('يرجى ملء جميع الحقول', 'Please fill all fields'))
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(t('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Invalid email or password'))
        setLoading(false)
        return
      }
      // Set authenticated state FIRST, then navigate
      login(data.admin.name)
      // Use setTimeout to ensure zustand state is flushed before parent re-renders
      setTimeout(() => {
        onLogin()
      }, 0)
    } catch {
      setError(t('حدث خطأ أثناء تسجيل الدخول', 'Login failed'))
      setLoading(false)
    }
    // Do NOT set loading to false on success - component will unmount
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emt-light via-white to-emt-light relative overflow-hidden" dir="rtl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230A6EBD' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md mx-4 shadow-xl border-0 relative z-10">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary">EMT</h1>
          <p className="text-sm text-muted-foreground">
            {t('إيمي للسياحة العلاجية', 'Emy Medical Tourism')}
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('لوحة التحكم', 'Admin Dashboard')}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('أدخل البريد الإلكتروني', 'Enter email')}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="h-11"
                autoComplete="email"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('كلمة المرور', 'Password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('أدخل كلمة المرور', 'Enter password')}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                className="h-11"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('تسجيل الدخول', 'Sign In')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}