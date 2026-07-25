'use client'

import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CalendarCheck,
  Clock,
  PhoneCall,
  CalendarClock,
  Plane,
  CheckCircle2,
  Stethoscope,
  GraduationCap,
  BookOpen,
  Handshake,
  TrendingUp,
} from 'lucide-react'

interface Stats {
  totalBookings: number
  pendingBookings: number
  contactedBookings: number
  scheduledBookings: number
  waitingBookings: number
  completedBookings: number
  totalDoctors: number
  totalSpecialties: number
  totalStories: number
  totalPartners: number
}

interface RecentBooking {
  id: string
  patientName: string
  country: string
  phone: string
  email: string
  specialtyName: string | null
  preferredDoctorName: string | null
  status: string
  createdAt: string
}

const statusConfig: Record<string, { labelAr: string; labelEn: string; color: string }> = {
  pending: { labelAr: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-amber-100 text-amber-800' },
  contacted: { labelAr: 'تم التواصل', labelEn: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  scheduled: { labelAr: 'تم الجدولة', labelEn: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  waiting_travel: { labelAr: 'بانتظار السفر', labelEn: 'Waiting Travel', color: 'bg-orange-100 text-orange-800' },
  completed: { labelAr: 'مكتمل', labelEn: 'Completed', color: 'bg-green-100 text-green-800' },
}

export default function AdminDashboard() {
  const { t } = useLanguageStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/bookings?limit=5'),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (bookingsRes.ok) {
          const data = await bookingsRes.json()
          setRecentBookings(data.bookings || [])
        }
      } catch { /* ignore */ }
      finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const bookingStats = stats
    ? [
        { labelAr: 'إجمالي الحجوزات', labelEn: 'Total Bookings', value: stats.totalBookings, icon: <CalendarCheck className="w-5 h-5" />, color: 'bg-primary/10 text-primary' },
        { labelAr: 'قيد الانتظار', labelEn: 'Pending', value: stats.pendingBookings, icon: <Clock className="w-5 h-5" />, color: 'bg-amber-100 text-amber-700' },
        { labelAr: 'تم التواصل', labelEn: 'Contacted', value: stats.contactedBookings, icon: <PhoneCall className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
        { labelAr: 'تم الجدولة', labelEn: 'Scheduled', value: stats.scheduledBookings, icon: <CalendarClock className="w-5 h-5" />, color: 'bg-purple-100 text-purple-700' },
        { labelAr: 'بانتظار السفر', labelEn: 'Waiting Travel', value: stats.waitingBookings, icon: <Plane className="w-5 h-5" />, color: 'bg-orange-100 text-orange-700' },
        { labelAr: 'مكتمل', labelEn: 'Completed', value: stats.completedBookings, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-100 text-green-700' },
      ]
    : []

  const generalStats = stats
    ? [
        { labelAr: 'الأطباء', labelEn: 'Doctors', value: stats.totalDoctors, icon: <Stethoscope className="w-5 h-5" />, color: 'bg-primary/10 text-primary' },
        { labelAr: 'التخصصات', labelEn: 'Specialties', value: stats.totalSpecialties, icon: <GraduationCap className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-700' },
        { labelAr: 'قصص المرضى', labelEn: 'Stories', value: stats.totalStories, icon: <BookOpen className="w-5 h-5" />, color: 'bg-rose-100 text-rose-700' },
        { labelAr: 'الشركاء', labelEn: 'Partners', value: stats.totalPartners, icon: <Handshake className="w-5 h-5" />, color: 'bg-violet-100 text-violet-700' },
      ]
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Booking Stats */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {t('إحصائيات الحجوزات', 'Booking Statistics')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {bookingStats.map((stat) => (
            <Card key={stat.labelEn} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{t(stat.labelAr, stat.labelEn)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* General Stats */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {t('إحصائيات عامة', 'General Statistics')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {generalStats.map((stat) => (
            <Card key={stat.labelEn} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{t(stat.labelAr, stat.labelEn)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">
              {t('آخر الحجوزات', 'Recent Bookings')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('المريض', 'Patient')}</TableHead>
                  <TableHead className="text-xs">{t('البلد', 'Country')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('التخصص', 'Specialty')}</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">{t('الطبيب', 'Doctor')}</TableHead>
                  <TableHead className="text-xs">{t('الحالة', 'Status')}</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">{t('التاريخ', 'Date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      {t('لا توجد حجوزات بعد', 'No bookings yet')}
                    </TableCell>
                  </TableRow>
                ) : (
                  recentBookings.map((b) => {
                    const cfg = statusConfig[b.status] || statusConfig.pending
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm font-medium">{b.patientName}</TableCell>
                        <TableCell className="text-sm">{b.country}</TableCell>
                        <TableCell className="text-sm hidden md:table-cell">{b.specialtyName || '-'}</TableCell>
                        <TableCell className="text-sm hidden lg:table-cell">{b.preferredDoctorName || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${cfg.color} border-0`}>
                            {t(cfg.labelAr, cfg.labelEn)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                          {new Date(b.createdAt).toLocaleDateString('ar-EG')}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}