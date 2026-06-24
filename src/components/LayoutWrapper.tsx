'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import LoginModal from './LoginModal';
import MiniCartDrawer from './MiniCartDrawer';
import MockGoogleChooser from './MockGoogleChooser';
import { useAuthStore } from '../store/authStore';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin-secure-dashboard' || pathname === '/admin';
  const isHomePage = pathname === '/';
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isAdminPage) {
    return (
      <>
        <main className="w-screen h-screen overflow-hidden bg-[#070913]">
          {children}
        </main>
        <LoginModal />
        <MiniCartDrawer />
        <MockGoogleChooser />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={`flex-grow w-full ${isHomePage ? 'pt-0' : 'pt-[72px] md:pt-[80px]'}`}>
        {children}
      </main>
      <LoginModal />
      <MiniCartDrawer />
      <MockGoogleChooser />
      <Footer />
    </>
  );
}
