'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { getWhatsAppLink, WHATSAPP_DEFAULT, EMAIL_DEFAULT } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, Clock, MapPin } from 'lucide-react';

interface Settings {
  whatsapp?: string;
  phone?: string;
  email?: string;
  working_hours?: string;
  address?: string;
}

const defaultSettings: Settings = {
  whatsapp: WHATSAPP_DEFAULT,
  phone: WHATSAPP_DEFAULT,
  email: EMAIL_DEFAULT,
  working_hours: 'السبت - الخميس: 9 صباحاً - 9 مساءً',
  address: 'القاهرة، مصر',
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function ContactSection() {
  const { t } = useLanguageStore();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const { ref, visible } = useReveal();

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          whatsapp: data.whatsapp || defaultSettings.whatsapp,
          phone: data.phone || defaultSettings.phone,
          email: data.email || defaultSettings.email,
          working_hours: data.working_hours || defaultSettings.working_hours,
          address: data.address || defaultSettings.address,
        });
      })
      .catch(() => {});
  }, []);

  const waLink = getWhatsAppLink(settings.whatsapp);
  const phoneDisplay = settings.phone || settings.whatsapp || WHATSAPP_DEFAULT;

  const contactCards = [
    {
      icon: MessageCircle,
      title: t('واتساب', 'WhatsApp'),
      value: phoneDisplay,
      subtitle: t('تواصل عبر واتساب', 'Chat on WhatsApp'),
      href: waLink,
      color: 'text-green-500',
      bg: 'bg-green-50',
      borderHover: 'hover:border-green-200',
      buttonClass: 'bg-green-500 hover:bg-green-600 text-white',
    },
    {
      icon: Phone,
      title: t('الهاتف', 'Phone'),
      value: phoneDisplay,
      subtitle: t('اتصل بنا مباشرة', 'Call us directly'),
      href: `tel:+${phoneDisplay}`,
      color: 'text-primary',
      bg: 'bg-secondary',
      borderHover: 'hover:border-primary/20',
      buttonClass: 'bg-primary hover:bg-primary/90 text-white',
    },
    {
      icon: Mail,
      title: t('البريد الإلكتروني', 'Email'),
      value: settings.email || EMAIL_DEFAULT,
      subtitle: t('راسلنا عبر البريد', 'Email us'),
      href: `mailto:${settings.email || EMAIL_DEFAULT}`,
      color: 'text-emt-gold',
      bg: 'bg-amber-50/50',
      borderHover: 'hover:border-amber-200',
      buttonClass: 'bg-emt-gold hover:bg-emt-gold/90 text-white',
    },
  ];

  return (
    <section id="contact" className="py-20 md:py-28 px-6 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-800 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="w-16 h-1 bg-emt-gold rounded-full mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t('تواصل معنا', 'Contact Us')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              'نحن هنا لمساعدتك. تواصل معنا بأي طريقة تناسبك',
              'We are here to help. Contact us in any way that suits you'
            )}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {contactCards.map((card, i) => (
            <div
              key={i}
              className={`group bg-white rounded-2xl p-8 shadow-lg shadow-blue-100/30 border border-border/30 ${card.borderHover} transition-all duration-500 hover:-translate-y-2 hover:shadow-xl text-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${(i + 1) * 150}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl ${card.bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">{card.title}</h3>
              <p className="text-primary font-semibold text-base mb-1" dir="ltr">{card.value}</p>
              <p className="text-muted-foreground text-sm mb-5">{card.subtitle}</p>
              <Button
                asChild
                className={`${card.buttonClass} rounded-full font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 px-6`}
              >
                <a href={card.href} target={card.icon === MessageCircle ? '_blank' : undefined} rel="noopener noreferrer">
                  {t('تواصل الآن', 'Contact Now')}
                </a>
              </Button>
            </div>
          ))}
        </div>

        {/* Working Hours + Address */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center transition-all duration-800 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('ساعات العمل', 'Working Hours')}</p>
              <p className="font-semibold text-foreground">{settings.working_hours}</p>
            </div>
          </div>
          {settings.address && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('العنوان', 'Address')}</p>
                <p className="font-semibold text-foreground">{settings.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}