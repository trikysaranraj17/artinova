'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import LoginModal from './LoginModal';
import MiniCartDrawer from './MiniCartDrawer';
import MockGoogleChooser from './MockGoogleChooser';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname === '/admin-secure-dashboard' || pathname === '/admin';

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
      <main className="flex-grow w-full pt-20">
        {children}
      </main>
      <LoginModal />
      <MiniCartDrawer />
      <MockGoogleChooser />
      <Footer />
    </>
  );
}
