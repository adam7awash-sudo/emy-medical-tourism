'use client'

import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/admin-store'
import { useLanguageStore } from '@/store/language-store'
import { useToast } from '@/hooks/use-toast'
import AdminLogin from './AdminLogin'
import AdminLayout, { type AdminSection } from './AdminLayout'
import AdminDashboard from './AdminDashboard'
import AdminBookings from './AdminBookings'
import AdminDoctors from './AdminDoctors'
import AdminSpecialties from './AdminSpecialties'
import AdminServices from './AdminServices'
import AdminTours from './AdminTours'
import AdminStories from './AdminStories'
import AdminHomepage from './AdminHomepage'
import AdminGallery from './AdminGallery'
import AdminSettings from './AdminSettings'

const sectionComponents: Record<AdminSection, React.ComponentType> = {
  dashboard: AdminDashboard,
  bookings: AdminBookings,
  doctors: AdminDoctors,
  specialties: AdminSpecialties,
  services: AdminServices,
  tours: AdminTours,
  stories: AdminStories,
  homepage: AdminHomepage,
  gallery: AdminGallery,
  settings: AdminSettings,
}

interface AdminPanelProps {
  onLogout: () => void
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { isAuthenticated, logout: storeLogout } = useAdminStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'down'>('checking')

  // فحص الاتصال بقاعدة البيانات — لو مقطوع نحذّر المسؤول فورًا بدل رسايل غامضة
  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/settings')
      .then((r) => setDbStatus(r.ok ? 'ok' : 'down'))
      .catch(() => setDbStatus('down'))
  }, [isAuthenticated])

  const handleLogin = () => {
    setJustLoggedIn(true)
    setActiveSection('dashboard')
  }

  useEffect(() => {
    if (justLoggedIn && isAuthenticated) {
      toast({
        title: t('مرحباً بك!', 'Welcome!'),
        description: t('تم تسجيل الدخول بنجاح', 'Logged in successfully'),
      })
    }
  }, [justLoggedIn])

  const handleLogout = () => {
    storeLogout()
    setJustLoggedIn(false)
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    onLogout()
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  const ActiveComponent = sectionComponents[activeSection]

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
      skipInitialCheck={justLoggedIn}
    >
      {dbStatus === 'down' && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800" dir="rtl">
          <p className="font-bold mb-1">⚠️ الاتصال بقاعدة البيانات مقطوع — الحفظ والرفع مش هيشتغلوا</p>
          <p>
            الحل: من لوحة Vercel افتح المشروع ← Settings ← Environment Variables، وضيف
            <code className="mx-1 rounded bg-red-100 px-1.5 py-0.5 font-en" dir="ltr">DATABASE_URL</code>
            و
            <code className="mx-1 rounded bg-red-100 px-1.5 py-0.5 font-en" dir="ltr">DIRECT_URL</code>
            (Neon Postgres)، وبعدين اعمل Redeploy.
          </p>
        </div>
      )}
      <ActiveComponent />
    </AdminLayout>
  )
}