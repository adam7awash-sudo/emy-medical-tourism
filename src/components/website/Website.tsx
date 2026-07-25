'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import WebsiteHeader from './WebsiteHeader';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import SpecialtiesSection from './SpecialtiesSection';
import ToursSection from './ToursSection';
import DoctorsSection from './DoctorsSection';
import StoriesSection from './StoriesSection';
import GallerySection from './GallerySection';
import BookingForm from './BookingForm';
import ContactSection from './ContactSection';
import WebsiteFooter from './WebsiteFooter';
import WhatsAppFloat from './WhatsAppFloat';

export default function Website() {
  const { isRTL } = useLanguageStore();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 600);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <WebsiteHeader />

      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <SpecialtiesSection />
        <ToursSection />
        <DoctorsSection />
        <StoriesSection />
        <GallerySection />
        <BookingForm />
        <ContactSection />
      </main>

      <WebsiteFooter />
      <WhatsAppFloat />

      {/* Scroll to Top */}
      <Button
        onClick={scrollToTop}
        className={`fixed bottom-6 z-40 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-500 ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } ${isRTL() ? 'right-6' : 'left-6 sm:left-auto sm:right-6'}`}
        size="icon"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </div>
  );
}