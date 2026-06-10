"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tent, Backpack, Shirt, Flame, Compass,
  ChevronRight, CalendarRange, MessageCircleCode,
  MapPin, CheckCircle2, Star, ShieldAlert, BadgeCheck,
  Loader2, Armchair, ShoppingCart, HelpCircle, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useCart } from "@/context/CartContext";
import dynamic from "next/dynamic";
import Image from "next/image";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center gap-2 border border-neutral-850 rounded-[32px] min-h-[240px]">
      <Loader2 className="w-6 h-6 text-brand-red animate-spin" />
      <span className="text-[10px] text-gray-500 font-light">Memuat Peta Interaktif...</span>
    </div>
  )
});
import { getProductsAction, getCategoriesAction, getSettingsAction, getTestimonialsAction } from "./actions";
import { Product, Category, BasecampSettings, Testimonial } from "@/lib/db-service";

// Icon mapping helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "Tent": return <Tent className="w-6 h-6" />;
    case "Backpack": return <Backpack className="w-6 h-6" />;
    case "Shirt": return <Shirt className="w-6 h-6" />;
    case "Flame": return <Flame className="w-6 h-6" />;
    case "Compass": return <Compass className="w-6 h-6" />;
    case "Armchair": return <Armchair className="w-6 h-6" />;
    default: return <Compass className="w-6 h-6" />;
  }
};

const faqData = [
  {
    question: "Bagaimana jika barang yang saya sewa rusak atau hilang?",
    answer: "Penyewa bertanggung jawab penuh atas barang yang disewa. Apabila terjadi kerusakan atau kehilangan barang, penyewa wajib membayar biaya ganti rugi/penggantian sejumlah harga barang yang ditentukan oleh pihak Noesantara Outdoor."
  },
  {
    question: "Apa saja syarat utama untuk menyewa alat?",
    answer: "Penyewa wajib menyerahkan kartu identitas fisik asli yang masih berlaku (seperti KTP, SIM, atau Kartu Pelajar) sebagai jaminan saat pengambilan perlengkapan di basecamp."
  },
  {
    question: "Apakah peralatan camping dijamin kebersihannya?",
    answer: "Tentu saja. Semua peralatan kami, terutama tenda, sleeping bag, dan nesting kompor selalu dibersihkan, dicuci wangi, dan disterilisasi sebelum diserahkan kembali kepada penyewa berikutnya."
  },
  {
    question: "Bagaimana jika saya terlambat mengembalikan barang?",
    answer: "Keterlambatan pengembalian barang dari tanggal kesepakatan akan dikenakan biaya denda tambahan per hari senilai dengan tarif rental harian produk tersebut. Harap hubungi admin jika ingin memperpanjang masa sewa."
  }
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<BasecampSettings | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { cart, addToCart, removeFromCart } = useCart();
  const [toastMessage, setToastMessage] = useState("");

  const showAddSuccessToast = (productName: string) => {
    setToastMessage(`"${productName}" berhasil ditambahkan ke keranjang!`);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const showRemoveToast = (productName: string) => {
    setToastMessage(`"${productName}" dihapus dari keranjang.`);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.pricePerDay * item.quantity), 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await getProductsAction();
        const catData = await getCategoriesAction();
        const settingsData = await getSettingsAction();
        const testimonialData = await getTestimonialsAction();
        setProducts(prodData.slice(0, 4)); // Show first 4 popular products
        setCategories(catData);
        setSettings(settingsData);
        setTestimonials(testimonialData);
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const steps = [
    {
      num: "01",
      title: "Pilih Perlengkapan",
      desc: "Telusuri katalog lengkap kami. Pilih tenda, carrier, atau apparel gunung premium yang Anda butuhkan.",
      icon: <Tent className="w-6 h-6 text-brand-red" />
    },
    {
      num: "02",
      title: "Isi Tanggal & Alamat",
      desc: "Tentukan tanggal sewa & kembali serta alamat. Sistem akan otomatis menghitung total harga sewa.",
      icon: <CalendarRange className="w-6 h-6 text-brand-green" />
    },
    {
      num: "03",
      title: "Checkout via WhatsApp",
      desc: "Tekan tombol checkout, form booking otomatis dicompile menjadi pesan WA. Kirimkan langsung ke nomor admin.",
      icon: <MessageCircleCode className="w-6 h-6 text-brand-yellow" />
    },
    {
      num: "04",
      title: "Ambil Alat & Nikmati",
      desc: "Alat siap diambil di basecamp atau dikirim. Semua alat dijamin bersih, wangi, & siap badai gunung!",
      icon: <BadgeCheck className="w-6 h-6 text-white" />
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-20 pb-12 md:pt-20 md:pb-12 overflow-hidden">
        {/* Background Cinematic Campfire Photo */}
        <div className="absolute inset-0 z-0 overflow-hidden scale-105 transform transition duration-[10000ms]">
          <Image
            src="/bg (1).png"
            alt="Cinematic Campfire Background"
            fill
            priority
            quality={85}
            className="object-cover pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 to-neutral-950/95" />
        </div>

        {/* Floating glowing light */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-red/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/10 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <div className="flex flex-col items-center gap-6 hero-fade-in">
            {/* Top Tagline Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glassmorphism text-xs font-bold text-brand-yellow uppercase tracking-widest border border-brand-yellow/30 animate-pulse">
              <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
              Area Bireuen & Sekitarnya
            </span>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
              Jelajahi Alam Nusantara <br /> Dengan <span className="text-brand-red">Alat Outdoor Terbaik</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-gray-300 font-light max-w-2xl leading-relaxed">
              Menyediakan perlengkapan outdoor berkualitas untuk menemani camping, hiking, touring & berbagai aktivitas alam dengan proses rental yang mudah dan terpercaya.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <Link
                href="/catalog"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-sm font-black uppercase tracking-widest shadow-[0_4px_25px_rgba(214,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(214,0,0,0.7)] hover:-translate-y-0.5 transition-premium text-center"
              >
                Sewa Sekarang
              </Link>
              <a
                href="#cara-sewa"
                className="w-full sm:w-auto px-8 py-4 rounded-full glassmorphism hover:bg-neutral-900 text-gray-200 hover:text-white text-sm font-bold tracking-wide transition-premium text-center"
              >
                Bagaimana Cara Sewa?
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 sm:gap-12 mt-8 md:mt-16 pt-6 md:pt-8 border-t border-neutral-800/40 w-full max-w-lg text-center">
              <div>
                <p className="text-2xl sm:text-4xl font-extrabold text-white">50+</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Alat Ready</p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-extrabold text-brand-green">100%</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Steril & Wangi</p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-extrabold text-brand-yellow">1K+</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Penyewa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Alat Section */}
      <section className="bg-neutral-950 pt-14 pb-4 md:pt-16 md:pb-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6">
            <div>
              <span className="text-xs font-black tracking-[0.2em] text-brand-red uppercase">Koleksi Basecamp</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-2">Kategori Perlengkapan</h2>
            </div>
            <p className="text-gray-400 text-sm md:text-base font-light max-w-md">
              Pilih berdasarkan kategori alat yang Anda butuhkan untuk pendakian solo, kelompok, maupun ekspedisi jangka panjang.
            </p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="aspect-square md:aspect-auto md:h-48 rounded-2xl md:rounded-3xl bg-neutral-900 animate-pulse border border-neutral-850" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              {categories.map((cat, idx) => (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.id}`}
                  className="group relative aspect-square md:aspect-auto md:h-48 rounded-2xl md:rounded-3xl overflow-hidden glassmorphism gpu-accelerated flex flex-col justify-center items-center p-3 md:p-5 gap-2 md:gap-3 hover:border-brand-red/30 transition-premium hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(214,0,0,0.15)]"
                >
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-brand-red/5 rounded-full filter blur-xl group-hover:bg-brand-red/10 transition-premium" />

                  {/* Icon Shield */}
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-900 border border-neutral-850 flex items-center justify-center text-brand-yellow group-hover:text-brand-red group-hover:bg-neutral-950 transition-premium shadow-inner [&>svg]:w-4 md:[&>svg]:w-6 [&>svg]:h-4 md:[&>svg]:h-6">
                    {getCategoryIcon(cat.icon)}
                  </div>

                  <div className="text-center w-full">
                    <h3 className="text-[10px] md:text-base font-extrabold text-white tracking-wide group-hover:text-brand-red transition-premium">
                      {cat.name}
                    </h3>
                    <p className="text-[8px] md:text-[10px] text-gray-500 mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-2 leading-relaxed font-light">
                      {cat.description}
                    </p>
                  </div>

                  {/* Corner Accent Arrow */}
                  <ChevronRight className="hidden md:block absolute bottom-5 right-5 w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-premium" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Products Showcase */}
      <section className="pt-4 pb-4 md:pt-16 md:pb-10 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6">
            <div>
              <span className="text-xs font-black tracking-[0.2em] text-brand-green uppercase">Paling Sering Disewa</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-2">Produk Populer</h2>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-yellow hover:text-brand-red transition-premium group"
            >
              Lihat Semua Alat Outdoor
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-premium" />
            </Link>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-60 md:h-96 rounded-2xl md:rounded-3xl bg-neutral-900 animate-pulse border border-neutral-850" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {products.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/catalog/${prod.id}`}
                  className="group flex flex-col w-full glassmorphism gpu-accelerated rounded-2xl md:rounded-3xl overflow-hidden hover:border-neutral-700 transition-premium hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-950 border-b border-neutral-900">
                    <Image
                      src={prod.images[0]}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-premium duration-700"
                    />

                    {/* Stock Status Badge */}
                    <span
                      className={`absolute top-2 left-2 md:top-3 md:left-3 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-wider ${prod.status === "Ready"
                        ? "bg-brand-green/20 text-brand-green border border-brand-green/30"
                        : prod.status === "Disewa"
                          ? "bg-brand-red/20 text-brand-red border border-brand-red/30"
                          : "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30"
                        }`}
                    >
                      {prod.status}
                    </span>

                    {/* Category Overlay */}
                    <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg bg-neutral-950/80 backdrop-blur-md text-[8px] md:text-[9px] font-bold text-gray-400 border border-neutral-850">
                      {prod.category}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="p-3 md:p-4 flex flex-col justify-between flex-grow gap-2 md:gap-3">
                    <div>
                      <h3 className="font-extrabold text-white text-xs md:text-sm group-hover:text-brand-red transition-premium line-clamp-1 leading-snug">
                        {prod.name}
                      </h3>
                      <p className="text-[10px] md:text-[11px] text-gray-500 font-light mt-0.5 md:mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Bottom action container (vertical stack) */}
                    <div className="pt-2 md:pt-3 border-t border-neutral-900 mt-auto flex flex-col gap-2 md:gap-2.5">
                      {/* Price Row */}
                      <div className="flex items-baseline justify-between">
                        <span className="text-[7px] md:text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">Harga Sewa</span>
                        <span className="text-xs md:text-xs font-black text-brand-yellow leading-none">
                          Rp {prod.pricePerDay.toLocaleString("id-ID")}
                          <span className="text-[8px] md:text-[9px] font-normal text-gray-400 pl-0.5">/hari</span>
                        </span>
                      </div>

                      {/* Buttons Row */}
                      <div className="flex items-center justify-between gap-1 md:gap-1.5 font-sans w-full">
                        <div className="flex-grow">
                          {prod.availableStock > 0 && prod.status === "Ready" ? (
                            cart.some((item) => item.id === prod.id) ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeFromCart(prod.id);
                                  showRemoveToast(prod.name);
                                }}
                                className="w-full py-1 md:py-1.5 rounded-lg md:rounded-xl border border-brand-red/35 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-[8px] md:text-[9px] font-black uppercase tracking-wider transition-premium cursor-pointer text-center"
                                title="Batal Sewa"
                              >
                                Batal
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToCart(prod, 1);
                                  showAddSuccessToast(prod.name);
                                }}
                                className="w-full py-1 md:py-1.5 rounded-lg md:rounded-xl border border-brand-yellow/35 bg-brand-yellow/10 hover:bg-brand-yellow text-brand-yellow hover:text-black text-[8px] md:text-[9px] font-black uppercase tracking-wider transition-premium cursor-pointer text-center"
                                title="Sewa Alat"
                              >
                                Sewa
                              </button>
                            )
                          ) : (
                            <span className="text-[8px] md:text-[9px] font-bold text-brand-red uppercase tracking-wider block text-center py-1 md:py-1.5 bg-brand-red/10 border border-brand-red/20 rounded-lg md:rounded-xl font-sans">
                              Kosong
                            </span>
                          )}
                        </div>
                        <div className="w-6 h-6 md:w-7 h-7 rounded-lg md:rounded-xl bg-brand-red/10 group-hover:bg-brand-red flex items-center justify-center text-brand-red group-hover:text-white transition-premium flex-shrink-0">
                          <ChevronRight className="w-3 md:w-3.5 h-3 md:h-3.5 group-hover:translate-x-0.5 transition-premium" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cara Sewa Section */}
      <section id="cara-sewa" className="bg-neutral-950 pt-4 pb-4 md:pt-16 md:pb-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full filter blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-20">
            <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-brand-yellow uppercase">Simpel &amp; Praktis</span>
            <h2 className="text-2xl md:text-5xl font-extrabold text-white mt-1.5 md:mt-2">Alur Penyewaan</h2>
            <p className="hidden md:block text-sm text-gray-400 mt-4 leading-relaxed font-light">
              Proses penyewaan modern yang dirancang seminimal mungkin tanpa login bertele-tele. Pesan dari hp Anda dan konfirmasi instan di WhatsApp.
            </p>
          </div>

          {/* Desktop: 4-column horizontal grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative group p-6 rounded-3xl glassmorphism border border-neutral-900 hover:border-neutral-800 transition-premium"
              >
                {idx < 3 && (
                  <div className="hidden md:block absolute top-12 left-[90%] w-[35%] h-[1px] bg-neutral-900 group-hover:bg-brand-red/30 transition-premium z-0" />
                )}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-850 flex items-center justify-center text-white shadow-inner">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-neutral-900 group-hover:text-brand-red/20 transition-premium select-none font-mono">
                    {step.num}
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-brand-yellow transition-premium leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-light mt-3 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: 2x2 clean grid */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {[
              { color: "yellow", bg: "rgba(255,200,61,0.06)", border: "rgba(255,200,61,0.25)", text: "#FFC83D", dot: "#FFC83D" },
              { color: "green", bg: "rgba(0,122,61,0.06)", border: "rgba(0,122,61,0.25)", text: "#4ade80", dot: "#007A3D" },
              { color: "red", bg: "rgba(214,0,0,0.06)", border: "rgba(214,0,0,0.25)", text: "#ef4444", dot: "#D60000" },
              { color: "white", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.12)", text: "#ffffff", dot: "#ffffff" },
            ].map((accent, idx) => {
              const step = steps[idx];
              return (
                <div
                  key={step.num}
                  className="p-3 rounded-2xl border relative overflow-hidden flex flex-col justify-between min-h-[135px]"
                  style={{ background: accent.bg, borderColor: accent.border, backdropFilter: "blur(12px)" }}
                >
                  {/* Subtle Glow blob */}
                  <div
                    className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-20 blur-xl pointer-events-none"
                    style={{ background: accent.dot }}
                  />
                  {/* Watermark number */}
                  <span
                    className="absolute bottom-1 right-2 text-5xl font-black select-none font-mono leading-none opacity-20"
                    style={{ color: accent.dot }}
                  >
                    {step.num}
                  </span>

                  {/* Top content */}
                  <div>
                    {/* Icon box */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mb-2.5 relative z-10 border"
                      style={{ background: accent.bg, borderColor: accent.border }}
                    >
                      <span style={{ color: accent.text }} className="[&>svg]:w-3.5 [&>svg]:h-3.5">
                        {step.icon}
                      </span>
                    </div>
                    <h3 className="text-[11px] font-extrabold leading-snug relative z-10" style={{ color: accent.text }}>
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-[8px] text-gray-400 font-light mt-1.5 leading-relaxed line-clamp-4 relative z-10">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Testimoni Section */}
      <section id="testimoni" className="pt-4 pb-14 md:pt-16 md:pb-10 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-20">
            <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-brand-red uppercase">Suara Pelanggan</span>
            <h2 className="text-xl md:text-5xl font-extrabold text-white mt-1.5 md:mt-2">Testimoni Penyewa</h2>
            <p className="hidden md:block text-sm text-gray-400 mt-4 leading-relaxed font-light">
              Apa kata mereka yang telah menggunakan peralatan sewaan dari Noesantara Outdoor.
            </p>
          </div>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {testimonials.map((test, index) => (
              <div
                key={test.id || index}
                className="flex flex-col justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl glassmorphism border border-neutral-900 hover:border-neutral-800 transition-premium group hover:-translate-y-1 hover:shadow-2xl"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 md:gap-1.5 mb-3 md:mb-5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${star <= test.rating
                          ? "fill-brand-yellow text-brand-yellow"
                          : "text-neutral-800"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light italic line-clamp-4 md:line-clamp-none">
                    &ldquo;{test.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2.5 md:gap-4 mt-4 md:mt-8 pt-3 md:pt-5 border-t border-neutral-900">
                  <Image
                    src={test.avatar || "/logo.png"}
                    alt={test.name}
                    width={40}
                    height={40}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-neutral-800 group-hover:border-brand-red transition-premium flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-white text-xs md:text-sm tracking-wide truncate">{test.name}</h4>
                    <p className="text-[9px] md:text-[10px] font-bold text-brand-green uppercase tracking-wider truncate">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-neutral-950 pt-8 pb-4 md:pt-12 md:pb-8 relative overflow-hidden border-t border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(214,0,0,0.08),_transparent_40%)]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="glassmorphism rounded-3xl md:rounded-[40px] p-5 md:p-16 border border-neutral-850 flex flex-col items-center gap-3.5 md:gap-6 shadow-2xl relative overflow-hidden">
            {/* Background glowing rings */}
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border-2 border-brand-red/5 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full border-2 border-brand-green/5 pointer-events-none" />

            <Tent className="w-10 h-10 md:w-16 md:h-16 text-brand-red animate-bounce" />

            <h2 className="text-xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mt-2">
              Siap Menjelajah? Sewa Alat Outdoor Premium Sekarang!
            </h2>

            <p className="text-xs md:text-base text-gray-400 max-w-xl font-light leading-relaxed">
              Dapatkan diskon sewa sebesar 10% untuk masa sewa di atas 5 hari. Booking aman melalui WhatsApp, pembayaran mudah, alat higienis terjamin.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6 w-full sm:w-auto">
              <Link
                href="/catalog"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest shadow-[0_4px_25px_rgba(214,0,0,0.5)] hover:-translate-y-0.5 transition-premium text-center"
              >
                Pilih Alat Camping
              </Link>
              <a
                href="https://wa.me/6282262278182"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-neutral-800 hover:bg-neutral-900 text-gray-200 hover:text-white text-xs font-bold tracking-wide transition-premium text-center"
              >
                Tanya Jawab Admin
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Location Section */}
      {settings && settings.gmapsEmbedUrl && settings.gmapsEmbedUrl.startsWith("http") && (
        <section className="bg-neutral-950 pt-4 pb-4 md:pt-10 md:pb-8 border-t border-t-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12 items-center">
              {/* Address details card */}
              <div className="space-y-4 md:space-y-6 text-left">
                <div>
                  <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-brand-red uppercase">Kunjungi Kami</span>
                  <h2 className="text-xl md:text-3xl font-extrabold text-white mt-1.5 md:mt-2">Lokasi Basecamp</h2>
                  <p className="text-xs md:text-sm text-gray-400 mt-1.5 md:mt-2 font-light leading-relaxed">
                    Silakan kunjungi alamat fisik kami untuk pengambilan alat sewa secara langsung, fitting jaket gunung, atau sekadar berkonsultasi seputar rute pendakian Anda.
                  </p>
                </div>

                <div className="space-y-3.5 md:space-y-4">
                  <div className="flex gap-3 md:gap-4 items-start">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 md:w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Alamat Basecamp</h4>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 font-light leading-relaxed">{settings.address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 md:gap-4 items-start">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand-green/10 border border-brand-green/20 text-brand-green flex items-center justify-center flex-shrink-0">
                      <Compass className="w-4 h-4 md:w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Operasional Toko</h4>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 font-light leading-relaxed">{settings.operatingHours}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={
                      settings.latitude && settings.longitude
                        ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-green/70 backdrop-blur-md border border-brand-green/30 text-[10px] md:text-xs font-black text-white uppercase tracking-wider hover:bg-brand-green-hover/90 hover:border-brand-green/50 transition-premium shadow-[0_4px_20px_rgba(0,122,61,0.25)] hover:shadow-[0_4px_25px_rgba(0,122,61,0.45)] hover:-translate-y-0.5"
                  >
                    Buka Rute di Google Maps
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </a>
                </div>
              </div>

              {/* Interactive Colorful Map */}
              <div className="lg:col-span-2 rounded-2xl md:rounded-[32px] overflow-hidden border border-neutral-900 h-64 md:h-96 relative shadow-2xl bg-neutral-900/40">
                <InteractiveMap
                  latitude={settings.latitude ?? -6.890986}
                  longitude={settings.longitude ?? 107.604929}
                  mapIcon={settings.mapIcon}
                  isDraggable={false}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section id="faq" className="bg-[#080808] pt-14 pb-20 border-t border-neutral-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(214,0,0,0.04),_transparent_40%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-brand-red uppercase">Pertanyaan Umum</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-1.5 md:mt-2">Frequently Asked Questions (FAQ)</h2>
            <p className="text-xs md:text-sm text-gray-400 mt-3 font-light leading-relaxed max-w-xl mx-auto">
              Temukan informasi seputar kebijakan penyewaan, jaminan identitas, ganti rugi kerusakan alat, dan lainnya.
            </p>
          </div>

          {/* Accordion List */}
          <div className="flex flex-col gap-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="glassmorphism rounded-2xl border border-neutral-900 hover:border-neutral-850 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left transition-premium hover:bg-neutral-950/20"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-brand-red flex-shrink-0">
                        <HelpCircle className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-500"
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 h-5" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-gray-400 leading-relaxed font-light pl-[52px] sm:pl-[64px] border-t border-neutral-900/40 pt-2.5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Floating Bottom Cart Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-45"
          >
            <div className="bg-[#0c0c0c]/90 border border-neutral-800 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3.5 pl-1 sm:pl-2">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red flex-shrink-0 animate-pulse">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Keranjang Sewa</span>
                  <span className="text-[10px] sm:text-xs font-black text-white block mt-0.5">
                    {cartTotalItems} Barang Terpilih
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <div className="text-right hidden sm:block">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Estimasi Biaya</span>
                  <span className="text-sm font-black text-brand-yellow block mt-0.5">
                    Rp {cartTotalPrice.toLocaleString("id-ID")}
                    <span className="text-[10px] font-normal text-gray-400">/hari</span>
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-brand-red hover:bg-brand-red-hover text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_4px_14px_rgba(214,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(214,0,0,0.6)] hover:-translate-y-0.5 transition-premium flex items-center gap-1.5 sm:gap-2"
                >
                  Lihat Sewa
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 bg-neutral-900 border border-brand-green/30 text-white px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
