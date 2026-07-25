'use client'

import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { useAdminStore } from '@/store/admin-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  GraduationCap,
  Settings,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Phone,
  SlidersHorizontal,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Plane,
} from 'lucide-react'

export type AdminSection =
  | 'dashboard'
  | 'bookings'
  | 'doctors'
  | 'specialties'
  | 'services'
  | 'tours'
  | 'stories'
  | 'homepage'
  | 'gallery'
  | 'settings'

interface AdminLayoutProps {
  children: React.ReactNode
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  onLogout: () => void
  skipInitialCheck?: boolean
}

const navItems: { key: AdminSection; icon: React.ReactNode; labelAr: string; labelEn: string }[] = [
  { key: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, labelAr: 'نظرة عامة', labelEn: 'Dashboard' },
  { key: 'bookings', icon: <CalendarCheck className="w-5 h-5" />, labelAr: 'حجوزات المرضى', labelEn: 'Patient Bookings' },
  { key: 'doctors', icon: <Stethoscope className="w-5 h-5" />, labelAr: 'الأطباء', labelEn: 'Doctors' },
  { key: 'specialties', icon: <GraduationCap className="w-5 h-5" />, labelAr: 'التخصصات', labelEn: 'Specialties' },
  { key: 'services', icon: <Settings className="w-5 h-5" />, labelAr: 'الخدمات', labelEn: 'Services' },
  { key: 'tours', icon: <Plane className="w-5 h-5" />, labelAr: 'أفضل البرامج السياحية', labelEn: 'Best Tourism Programs' },
  { key: 'stories', icon: <BookOpen className="w-5 h-5" />, labelAr: 'قصص المرضى', labelEn: 'Patient Stories' },
  { key: 'homepage', icon: <FileText className="w-5 h-5" />, labelAr: 'محتوى الرئيسية', labelEn: 'Homepage Content' },
  { key: 'gallery', icon: <ImageIcon className="w-5 h-5" />, labelAr: 'المعرض', labelEn: 'Gallery' },
  { key: 'settings', icon: <SlidersHorizontal className="w-5 h-5" />, labelAr: 'إعدادات الموقع', labelEn: 'Site Settings' },
]

function SidebarNav({
  activeSection,
  onSectionChange,
  onLogout,
  adminName,
  t,
  onMobileClose,
}: {
  activeSection: AdminSection
  onSectionChange: (s: AdminSection) => void
  onLogout: () => void
  adminName: string
  t: (ar: string, en: string) => string
  onMobileClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-primary text-lg leading-tight">EMT</h2>
          <p className="text-[11px] text-muted-foreground">{t('لوحة التحكم', 'Admin Panel')}</p>
        </div>
      </div>
      <Separator />

      {/* Nav items */}
      <ScrollArea className="flex-1 py-3 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onSectionChange(item.key)
                onMobileClose?.()
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              <span>{t(item.labelAr, item.labelEn)}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>

      <Separator />
      {/* Admin info & logout */}
      <div className="p-4 space-y-3">
        <div className="text-xs text-muted-foreground truncate">
          {adminName}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          {t('تسجيل الخروج', 'Sign Out')}
        </Button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children, activeSection, onSectionChange, onLogout, skipInitialCheck }: AdminLayoutProps) {
  const { t } = useLanguageStore()
  const { adminName, logout } = useAdminStore()
  const { toast } = useToast()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checking, setChecking] = useState(!skipInitialCheck)

  useEffect(() => {
    if (skipInitialCheck) return
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        if (!res.ok) return
        const data = await res.json()
        if (!data.authenticated) {
          logout()
          onLogout()
        }
      } catch {
        // network error - don't logout, keep current state
      } finally {
        setChecking(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignore */ }
    logout()
    onLogout()
    toast({ title: t('تم تسجيل الخروج', 'Signed out') })
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 flex" dir="rtl">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-background border-l border-border flex-col shrink-0 sticky top-0 h-screen">
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onLogout={handleLogout}
          adminName={adminName}
          t={t}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <SheetTitle className="sr-only">{t('القائمة', 'Menu')}</SheetTitle>
                <SidebarNav
                  activeSection={activeSection}
                  onSectionChange={onSectionChange}
                  onLogout={handleLogout}
                  adminName={adminName}
                  t={t}
                  onMobileClose={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <h2 className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.key === activeSection) &&
                t(
                  navItems.find((n) => n.key === activeSection)!.labelAr,
                  navItems.find((n) => n.key === activeSection)!.labelEn
                )}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{adminName}</span>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-destructive" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}