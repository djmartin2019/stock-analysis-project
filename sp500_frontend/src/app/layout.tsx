"use client";

import "./globals.css";

import { TickerProvider } from "@/context/TickerContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import LoadingOverlay from '@/components/LoadingOverlay';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <TickerProvider>
        <html lang="en">
          <body className={`antialiased bg-darkgrey text-white`}>
            <div className="flex h-screen">
                <Sidebar/>
                <div className="flex flex-col flex-1">
                    <Topbar/>
                    <LoadingOverlay />
                    {children}
                </div>
            </div>
          </body>
        </html>
    </TickerProvider>
  );
}
