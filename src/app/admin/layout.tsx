"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Tent, CalendarRange, UserCheck, 
  Wallet, Eye, ArrowLeftCircle, CheckCircle, Database, Settings, LogOut, MessageSquare,
  Layers, Menu, X, ChevronDown, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/logo";
import { logoutAdminAction } from "@/app/actions";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // If we are on the login page, render children directly without sidebar layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const sidebarLinks = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      name: "Kelola Alat",
      href: "/admin/products",
      icon: <Tent className="w-4 h-4" />
    },
    {
      name: "Kategori Alat",
      href: "/admin/categories",
      icon: <Layers className="w-4 h-4" />
    },
    {
      name: "Kelola Rental",
      href: "/admin/rentals",
      icon: <CalendarRange className="w-4 h-4" />
    },
    {
      name: "Penyewa",
      href: "/admin/renters",
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      name: "Keuangan",
      href: "/admin/finance",
      icon: <Wallet className="w-4 h-4" />
    },
    {
      name: "Testimoni",
      href: "/admin/testimonials",
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      name: "Pengaturan",
      href: "/admin/settings",
      icon: <Settings className="w-4 h-4" />
    }
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const activeLink = sidebarLinks.find((link) => isActive(link.href)) || sidebarLinks[0];
  const activeLinkName = activeLink ? activeLink.name : "Menu";

  return (
    <div className="min-h-screen bg-[#060606] text-foreground flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-neutral-900 hidden md:flex flex-col justify-between p-6 h-screen sticky top-0">
        <div className="flex flex-col gap-8">
          
          {/* Logo Frame */}
          <Link href="/">
            <Logo showText={true} className="h-12" />
          </Link>

          {/* Nav list */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 block">Menu Admin</span>
            
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-premium ${
                  isActive(link.href)
                    ? "bg-brand-red text-white shadow-[0_4px_14px_rgba(214,0,0,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Back to public site & Logout */}
        <div className="pt-6 border-t border-neutral-900 flex flex-col gap-2.5">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-900 text-xs font-bold text-gray-400 hover:text-white hover:bg-neutral-900 transition-premium"
          >
            <ArrowLeftCircle className="w-4 h-4 text-brand-green" />
            Website Utama
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-950/40 bg-red-950/10 text-xs font-bold text-brand-red hover:bg-brand-red hover:text-white transition-premium cursor-pointer w-full"
          >
            <LogOut className="w-4 h-4" />
            Keluar (Logout)
          </button>
          
          <span className="text-[9px] text-gray-600 font-light text-center leading-none mt-1">
            Noesantara Admin v1.0
          </span>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-neutral-900 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 md:hidden">
            <Link href="/">
              <Logo showText={false} className="h-7 w-auto" />
            </Link>
            
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-premium cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5 text-brand-red" />
              <span>{activeLinkName}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-900">
            <Database className="w-3.5 h-3.5 text-brand-yellow" />
            <span>Koneksi Master:</span>
            <span className="font-bold text-brand-green">Auto-Sync Enabled</span>
          </div>

          {/* Quick link button */}
          <Link
            href="/catalog"
            target="_blank"
            className="px-3.5 py-1.5 rounded-full border border-neutral-800 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-neutral-900 flex items-center gap-1.5 transition-premium"
          >
            <Eye className="w-3.5 h-3.5 text-brand-yellow" />
            <span className="hidden sm:inline">Lihat Toko Publik</span>
            <span className="sm:hidden">Toko</span>
          </Link>
        </header>

        {/* Inner Content Component */}
        <main className="p-4 md:p-10 max-w-7xl w-full mx-auto flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Menu Popup Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-x-4 top-20 bg-[#0a0a0a]/95 border border-neutral-850 backdrop-blur-xl rounded-3xl p-5 z-50 shadow-2xl flex flex-col gap-5 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <Logo showText={false} className="h-8 w-auto" />
                  <span className="font-extrabold text-xs text-white uppercase tracking-wider">Navigasi Portal</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-850 text-gray-400 hover:text-white transition-premium cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Links grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-brand-red text-white shadow-[0_4px_12px_rgba(214,0,0,0.35)]"
                        : "bg-neutral-950 border border-neutral-900 text-gray-400 hover:text-white"
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* Bottom utility buttons */}
              <div className="pt-4 border-t border-neutral-900 flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-900 bg-neutral-950 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-premium"
                >
                  <ArrowLeftCircle className="w-4 h-4 text-brand-green" />
                  Website Utama
                </Link>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-950/40 bg-red-950/10 text-[10px] font-bold uppercase tracking-wider text-brand-red hover:bg-brand-red hover:text-white transition-premium cursor-pointer w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar (Logout)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isLoggingOut) setShowLogoutModal(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glassmorphism border border-neutral-850 rounded-3xl p-6 relative overflow-hidden mx-4 text-center z-10"
            >
              {/* Red decorative warning blur */}
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-brand-red/10 rounded-full filter blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-brand-red/5 rounded-full filter blur-xl pointer-events-none" />

              {/* LogOut Warning Icon */}
              <div className="w-12 h-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-4 animate-pulse">
                <LogOut className="w-6 h-6" />
              </div>

              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Konfirmasi Keluar</h3>
              <p className="text-xs text-gray-400 font-light mt-2 leading-relaxed">
                Apakah Anda yakin ingin keluar dari panel admin? Sesi aktif Anda akan segera diakhiri.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {/* Cancel Button */}
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutModal(false)}
                  className="py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-xs font-bold text-gray-400 hover:text-white transition-premium cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>

                {/* Confirm Logout Button */}
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={async () => {
                    setIsLoggingOut(true);
                    try {
                      await logoutAdminAction();
                      window.location.href = "/admin/login";
                    } catch (err) {
                      console.error("Gagal melakukan logout:", err);
                      setIsLoggingOut(false);
                    }
                  }}
                  className="py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(214,0,0,0.3)] hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:-translate-y-0 flex items-center justify-center gap-1.5"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Keluar...
                    </>
                  ) : (
                    "Keluar"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
