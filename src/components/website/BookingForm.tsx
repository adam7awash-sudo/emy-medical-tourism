'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Upload, X, FileText, Loader2 } from 'lucide-react';

interface Specialty {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface Doctor {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyId: string | null;
}

const countries = [
  { value: 'iraq', labelAr: 'العراق', labelEn: 'Iraq', code: '+964' },
  { value: 'saudi', labelAr: 'السعودية', labelEn: 'Saudi Arabia', code: '+966' },
  { value: 'jordan', labelAr: 'الأردن', labelEn: 'Jordan', code: '+962' },
  { value: 'kuwait', labelAr: 'الكويت', labelEn: 'Kuwait', code: '+965' },
  { value: 'uae', labelAr: 'الإمارات', labelEn: 'UAE', code: '+971' },
  { value: 'bahrain', labelAr: 'البحرين', labelEn: 'Bahrain', code: '+973' },
  { value: 'oman', labelAr: 'عمان', labelEn: 'Oman', code: '+968' },
  { value: 'qatar', labelAr: 'قطر', labelEn: 'Qatar', code: '+974' },
  { value: 'libya', labelAr: 'ليبيا', labelEn: 'Libya', code: '+218' },
  { value: 'sudan', labelAr: 'السودان', labelEn: 'Sudan', code: '+249' },
  { value: 'yemen', labelAr: 'اليمن', labelEn: 'Yemen', code: '+967' },
  { value: 'palestine', labelAr: 'فلسطين', labelEn: 'Palestine', code: '+970' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function BookingForm() {
  const { t, lang } = useLanguageStore();
  const { ref, visible } = useReveal();

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [form, setForm] = useState({
    patientName: '',
    country: '',
    phone: '',
    email: '',
    specialtyId: '',
    preferredDoctorId: '',
    notes: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/specialties')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSpecialties(data); })
      .catch(() => {});
    fetch('/api/doctors')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDoctors(data); })
      .catch(() => {});
  }, []);

  // Listen for selectSpecialty event
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, name } = (e as CustomEvent).detail;
      setForm((prev) => ({ ...prev, specialtyId: id }));
      document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('selectSpecialty', handler);
    return () => window.removeEventListener('selectSpecialty', handler);
  }, []);

  const filteredDoctors = form.specialtyId
    ? doctors.filter((d) => !d.specialtyId || d.specialtyId === form.specialtyId)
    : doctors;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Upload files first
      const uploadedUrls: string[] = [];
      for (const file of files) {
        try {
          const uploadData = new FormData();
          uploadData.append('file', file);
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
          const uploadJson = await uploadRes.json();
          if (uploadJson.url) uploadedUrls.push(uploadJson.url);
        } catch {
          // Skip failed uploads, don't block the whole form
        }
      }

      const spec = specialties.find((s) => s.id === form.specialtyId);
      const doc = form.preferredDoctorId ? doctors.find((d) => d.id === form.preferredDoctorId) : null;

      const body = {
        patientName: form.patientName,
        country: form.country,
        phone: form.phone,
        email: form.email,
        specialtyId: form.specialtyId || null,
        specialtyName: spec ? (lang === 'ar' ? spec.nameAr : spec.nameEn) : null,
        preferredDoctorId: form.preferredDoctorId || null,
        preferredDoctorName: doc ? (lang === 'ar' ? doc.nameAr : doc.nameEn) : null,
        notes: form.notes || null,
        reports: JSON.stringify(uploadedUrls),
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');

      setSuccess(true);
      setForm({ patientName: '', country: '', phone: '', email: '', specialtyId: '', preferredDoctorId: '', notes: '' });
      setFiles([]);
    } catch {
      setError(t('حدث خطأ، يرجى المحاولة مرة أخرى', 'An error occurred, please try again'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section id="booking" className="py-20 md:py-28 px-6" ref={ref}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/40 p-12 text-center border border-green-100">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {t('تم إرسال طلبك بنجاح!', 'Your request has been sent successfully!')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t(
                'سنتواصل معك في أقرب وقت ممكن عبر الهاتف أو الواتساب لتأكيد موعدك.',
                'We will contact you as soon as possible via phone or WhatsApp to confirm your appointment.'
              )}
            </p>
            <Button
              onClick={() => setSuccess(false)}
              className="gradient-primary-light text-white font-semibold rounded-full px-8"
            >
              {t('حجز موعد آخر', 'Book Another Appointment')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 md:py-28 px-6 relative overflow-hidden" ref={ref}>
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-primary" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-sky-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div
          className={`bg-white rounded-3xl shadow-2xl shadow-black/10 p-8 md:p-12 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {/* Title */}
          <div className="text-center mb-10">
            <div className="w-12 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">
              {t('احجز موعدك الآن', 'Book Your Appointment Now')}
            </h2>
            <p className="text-muted-foreground">
              {t('املأ النموذج وسنتواصل معك في أقرب وقت', 'Fill the form and we will contact you soon')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Name */}
            <div>
              <Label className="text-foreground font-medium mb-1.5 block">
                {t('اسم المريض', 'Patient Name')} <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                placeholder={t('أدخل اسم المريض', 'Enter patient name')}
                className="h-12 rounded-xl border-border/60 focus:border-primary"
              />
            </div>

            {/* Country + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground font-medium mb-1.5 block">
                  {t('الدولة', 'Country')} <span className="text-red-500">*</span>
                </Label>
                <select
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full h-12 rounded-xl border border-border/60 bg-background px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="">{t('اختر الدولة', 'Select country')}</option>
                  {countries.map((c) => (
                    <option key={c.value} value={c.value}>
                      {t(c.labelAr, c.labelEn)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-foreground font-medium mb-1.5 block">
                  {t('رقم الهاتف', 'Phone Number')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={form.country ? `${countries.find(c => c.value === form.country)?.code || ''} xxx xxx xxxx` : t('أدخل رقم الهاتف', 'Enter phone number')}
                  className="h-12 rounded-xl border-border/60 focus:border-primary"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-foreground font-medium mb-1.5 block">
                {t('البريد الإلكتروني', 'Email Address')}
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t('example@email.com', 'example@email.com')}
                className="h-12 rounded-xl border-border/60 focus:border-primary"
                dir="ltr"
              />
            </div>

            {/* Specialty + Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground font-medium mb-1.5 block">
                  {t('التخصص', 'Specialty')} <span className="text-red-500">*</span>
                </Label>
                <select
                  required
                  value={form.specialtyId}
                  onChange={(e) => setForm({ ...form, specialtyId: e.target.value, preferredDoctorId: '' })}
                  className="w-full h-12 rounded-xl border border-border/60 bg-background px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="">{t('اختر التخصص', 'Select specialty')}</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {t(s.nameAr, s.nameEn)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-foreground font-medium mb-1.5 block">
                  {t('الطبيب المفضل (اختياري)', 'Preferred Doctor (Optional)')}
                </Label>
                <select
                  value={form.preferredDoctorId}
                  onChange={(e) => setForm({ ...form, preferredDoctorId: e.target.value })}
                  className="w-full h-12 rounded-xl border border-border/60 bg-background px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="">{t('اختر الطبيب', 'Select doctor')}</option>
                  {filteredDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {t(d.nameAr, d.nameEn)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-foreground font-medium mb-1.5 block">
                {t('ملاحظات', 'Notes')}
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t('أضف أي تفاصيل أو استفسارات...', 'Add any details or inquiries...')}
                className="min-h-[100px] rounded-xl border-border/60 focus:border-primary resize-none"
                rows={4}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-foreground font-medium mb-1.5 block">
                {t('رفع التقارير الطبية (اختياري)', 'Upload Medical Reports (Optional)')}
              </Label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-secondary/30 transition-all duration-300 cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('اسحب الملفات هنا أو انقر للاختيار', 'Drag files here or click to select')}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, PNG</p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 bg-secondary/60 rounded-lg px-4 py-2.5">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full gradient-primary-light text-white font-bold rounded-xl h-13 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:opacity-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  {t('جارٍ الإرسال...', 'Sending...')}
                </>
              ) : (
                t('إرسال طلب الحجز', 'Submit Booking Request')
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}