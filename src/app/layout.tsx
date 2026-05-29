import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import LayoutWrapper from "../components/LayoutWrapper";
import CustomCursor from "../components/CustomCursor";
import LenisScroll from "../components/LenisScroll";

export const metadata: Metadata = {
  title: "ARTINOVA | Luxury Handcrafted Customized Gifts & Keepsakes",
  description: "Discover world-class luxury handcrafted gifts. Customize premium keepsake boxes, crystal glass trinkets, and personalized art at ARTINOVA.",
  keywords: "luxury gifts, customized gift, handcrafted box, keepsake, artinova, premium gifting, corporate gift, personalized album",
  openGraph: {
    title: "ARTINOVA | Luxury Handcrafted Customized Gifts",
    description: "Indulge in royal premium handcrafted gifts designed to shape emotions into physical art.",
    type: "website",
    locale: "en_US",
    siteName: "ARTINOVA",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-ambient-glow min-h-screen flex flex-col antialiased relative selection:bg-royal-gold/30 selection:text-champagne-gold">
        <AppProvider>
          {/* Ambient Noise overlay */}
          <div className="noise-overlay" />
          
          {/* Animation/Smooth scrolling effects */}
          <LenisScroll />
          <CustomCursor />
          
          {/* Layout switcher wrapper */}
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
