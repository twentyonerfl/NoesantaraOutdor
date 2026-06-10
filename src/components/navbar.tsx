"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PhoneCall, LayoutDashboard, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./logo";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Katalog", href: "/catalog" },
    { name: "Cara Sewa", href: "/#cara-sewa" },
    { name: "Testimoni", href: "/#testimoni" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false; // Anchor links are not active state pages
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[9999] transition-premium duration-300 ${isScrolled
          ? "glass-silver-glossy py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo showText={true} className="h-14 md:h-18" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-premium hover:text-brand-red ${isActive(link.href)
                    ? "text-brand-red font-bold"
                    : isScrolled
                      ? "text-neutral-800"
                      : "text-gray-300"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/checkout"
                className={`relative p-2.5 rounded-full border transition-premium flex items-center justify-center ${isScrolled
                  ? "border-neutral-300 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200/50"
                  : "border-neutral-800 text-gray-300 hover:text-white hover:bg-neutral-900"
                  }`}
                aria-label="Keranjang Sewa"
              >
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(214,0,0,0.6)] animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-premium ${isScrolled
                  ? "border-neutral-300 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200/50"
                  : "border-neutral-800 text-gray-300 hover:text-white hover:bg-neutral-900"
                  }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-brand-green" />
                Admin Panel
              </Link>

              <Link
                href="/catalog"
                className="px-5 py-2.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-extrabold uppercase tracking-widest shadow-[0_4px_14px_0_rgba(214,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(214,0,0,0.6)] hover:-translate-y-0.5 transition-premium"
              >
                Sewa Sekarang
              </Link>
            </div>

            {/* Mobile Hamburger Trigger */}
            <div className="md:hidden flex items-center gap-3">
              <Link
                href="/checkout"
                className={`relative p-2 rounded-full border transition-premium flex items-center justify-center ${isScrolled
                  ? "border-neutral-300 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200/50"
                  : "border-neutral-800 text-gray-300 hover:text-white"
                  }`}
                aria-label="Keranjang Sewa"
              >
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[8px] font-black min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center shadow-[0_0_6px_rgba(214,0,0,0.6)]">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                href="/admin"
                className={`p-2 rounded-full border transition-premium ${isScrolled
                  ? "border-neutral-300 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200/50"
                  : "border-neutral-800 text-gray-300 hover:text-white"
                  }`}
                aria-label="Admin Page"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-green" />
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full border focus:outline-none transition-premium ${isScrolled
                  ? "bg-white/80 border-neutral-300 text-neutral-800 hover:text-neutral-950 hover:bg-white"
                  : "bg-neutral-950/80 border-neutral-800 text-gray-300 hover:text-white hover:bg-neutral-900"
                  }`}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Slide-in */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-[10000] md:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-neutral-950 border-l border-neutral-800 z-[10001] p-6 shadow-2xl flex flex-col justify-between md:hidden"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-850 pb-4 mb-6">
                  <Logo showText={true} className="h-12" />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-neutral-900 text-gray-400 hover:text-white transition-premium"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-bold tracking-wide py-1.5 transition-premium border-b border-neutral-900/50 hover:text-brand-red ${isActive(link.href)
                        ? "text-brand-red pl-2 border-l-2 border-brand-red"
                        : "text-gray-300"
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-bold tracking-wide py-1.5 text-gray-300 hover:text-brand-green transition-premium"
                  >
                    <LayoutDashboard className="w-5 h-5 text-brand-green" />
                    Admin Panel
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-neutral-900">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-850 bg-neutral-950 text-sm font-bold text-gray-300 hover:bg-neutral-900 transition-premium"
                >
                  <ShoppingCart className="w-4 h-4 text-brand-red" />
                  Keranjang ({itemCount} Alat)
                </Link>

                <a
                  href="https://wa.me/6282262278182"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-800 text-sm font-bold text-gray-300 hover:bg-neutral-900 transition-premium"
                >
                  <PhoneCall className="w-4 h-4 text-brand-yellow" />
                  Hubungi Admin
                </a>

                <Link
                  href="/catalog"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest shadow-[0_4px_14px_rgba(214,0,0,0.4)]"
                >
                  Sewa Sekarang
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
