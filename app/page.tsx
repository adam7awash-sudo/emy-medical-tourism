'use client';

import { useEffect, useState } from 'react';
import Website from '@/components/website/Website';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAdminStore } from '@/store/admin-store';

type View = 'website' | 'admin';

export default function Page() {
  const [view, setView] = useState<View>('website');
  const { isAuthenticated, logout } = useAdminStore();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/admin')) {
        setView('admin');
      } else {
        setView('website');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLogin = () => {
    setView('admin');
  };

  const handleLogout = () => {
    logout();
    fetch('/api/auth/logout', { method: 'POST' });
    window.location.hash = '';
    setView('website');
  };

  if (view === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return <Website />;
}