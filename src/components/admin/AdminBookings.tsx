'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguageStore } from '@/store/language-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Search, Eye, RefreshCw, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Booking {
  id: string
  patientName: string
  country: string
  phone: string
  email: string
  specialtyName: string | null
  preferredDoctorName: string | null
  notes: string | null
  reports: string
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

const statusList = ['pending', 'contacted', 'scheduled', 'waiting_travel', 'completed']

export default function AdminBookings() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // View dialog
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  // Status update dialog
  const [statusBooking, setStatusBooking] = useState<Booking | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/bookings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [search, statusFilter, page])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const handleUpdateStatus = async () => {
    if (!statusBooking || !newStatus) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/bookings/${statusBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast({ title: t('تم تحديث الحالة', 'Status updated') })
        setStatusBooking(null)
        fetchBookings()
      }
    } catch { toast({ title: t('فشل التحديث', 'Update failed'), variant: 'destructive' }) }
    finally { setUpdatingStatus(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/bookings/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: t('تم الحذف', 'Deleted') })
        setDeleteId(null)
        fetchBookings()
      }
    } catch { toast({ title: t('فشل الحذف', 'Delete failed'), variant: 'destructive' }) }
    finally { setDeleting(false) }
  }

  const getStatusBadge = (status: string) => {
    const cfg = statusConfig[status] || statusConfig.pending
    return <Badge variant="secondary" className={`text-xs ${cfg.color} border-0`}>{t(cfg.labelAr, cfg.labelEn)}</Badge>
  }

  const parseReports = (reports: string): string[] => {
    try { return JSON.parse(reports) } catch { return [] }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('بحث بالاسم، البريد، الهاتف، البلد...', 'Search by name, email, phone, country...')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('كل الحالات', 'All Statuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('كل الحالات', 'All Statuses')}</SelectItem>
            {statusList.map((s) => (
              <SelectItem key={s} value={s}>{t(statusConfig[s]?.labelAr || s, statusConfig[s]?.labelEn || s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">{t('المريض', 'Patient')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('البلد', 'Country')}</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">{t('الهاتف', 'Phone')}</TableHead>
                  <TableHead className="text-xs hidden xl:table-cell">{t('البريد', 'Email')}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t('التخصص', 'Specialty')}</TableHead>
                  <TableHead className="text-xs hidden xl:table-cell">{t('الطبيب', 'Doctor')}</TableHead>
                  <TableHead className="text-xs">{t('الحالة', 'Status')}</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">{t('التاريخ', 'Date')}</TableHead>
                  <TableHead className="text-xs">{t('إجراءات', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={10}><Skeleton className="h-10" /></TableCell></TableRow>
                  ))
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground text-sm">
                      {t('لا توجد حجوزات', 'No bookings found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((b, idx) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs text-muted-foreground">{(page - 1) * 20 + idx + 1}</TableCell>
                      <TableCell className="text-sm font-medium">{b.patientName}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{b.country}</TableCell>
                      <TableCell className="text-sm hidden lg:table-cell" dir="ltr">{b.phone}</TableCell>
                      <TableCell className="text-sm hidden xl:table-cell">{b.email}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{b.specialtyName || '-'}</TableCell>
                      <TableCell className="text-sm hidden xl:table-cell">{b.preferredDoctorName || '-'}</TableCell>
                      <TableCell>{getStatusBadge(b.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                        {new Date(b.createdAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewBooking(b)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setStatusBooking(b); setNewStatus(b.status) }}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(b.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {t(`صفحة ${page} من ${totalPages}`, `Page ${page} of ${totalPages}`)}
              </span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('تفاصيل الحجز', 'Booking Details')}</DialogTitle>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('المريض', 'Patient')}</span>
                  <p className="font-medium">{viewBooking.patientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('البلد', 'Country')}</span>
                  <p className="font-medium">{viewBooking.country}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('الهاتف', 'Phone')}</span>
                  <p className="font-medium" dir="ltr">{viewBooking.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('البريد', 'Email')}</span>
                  <p className="font-medium">{viewBooking.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('التخصص', 'Specialty')}</span>
                  <p className="font-medium">{viewBooking.specialtyName || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('الطبيب', 'Doctor')}</span>
                  <p className="font-medium">{viewBooking.preferredDoctorName || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('الحالة', 'Status')}</span>
                  <div className="mt-1">{getStatusBadge(viewBooking.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('التاريخ', 'Date')}</span>
                  <p className="font-medium">{new Date(viewBooking.createdAt).toLocaleString('ar-EG')}</p>
                </div>
              </div>
              {viewBooking.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">{t('ملاحظات', 'Notes')}</span>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{viewBooking.notes}</p>
                </div>
              )}
              {viewBooking.reports && viewBooking.reports !== '[]' && (
                <div>
                  <span className="text-sm text-muted-foreground">{t('التقارير', 'Reports')}</span>
                  <div className="mt-1 space-y-2">
                    {parseReports(viewBooking.reports).map((r, i) => (
                      <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline break-all">
                        {r}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!statusBooking} onOpenChange={() => setStatusBooking(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('تحديث حالة الحجز', 'Update Booking Status')}</DialogTitle>
          </DialogHeader>
          {statusBooking && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{statusBooking.patientName}</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusList.map((s) => (
                    <SelectItem key={s} value={s}>{t(statusConfig[s]?.labelAr || s, statusConfig[s]?.labelEn || s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusBooking(null)}>
                  {t('إلغاء', 'Cancel')}
                </Button>
                <Button onClick={handleUpdateStatus} disabled={updatingStatus || !newStatus}>
                  {updatingStatus && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                  {t('تحديث', 'Update')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('حذف الحجز', 'Delete Booking')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('هل أنت متأكد من حذف هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.', 'Are you sure you want to delete this booking? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {t('حذف', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}