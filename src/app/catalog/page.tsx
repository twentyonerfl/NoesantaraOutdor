"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tent, Backpack, Shirt, Flame, Compass,
  Search, SlidersHorizontal, Info, ChevronRight, Inbox, Armchair,
  ChevronDown, X, Layers, ShoppingCart, Trash2
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getProductsAction, getCategoriesAction } from "@/app/actions";
import { Product, Category } from "@/lib/db-service";

// Icon mapping helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "Tent": return <Tent className="w-4 h-4" />;
    case "Backpack": return <Backpack className="w-4 h-4" />;
    case "Shirt": return <Shirt className="w-4 h-4" />;
    case "Flame": return <Flame className="w-4 h-4" />;
    case "Compass": return <Compass className="w-4 h-4" />;
    case "Armchair": return <Armchair className="w-4 h-4" />;
    default: return <Compass className="w-4 h-4" />;
  }
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

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

  // Load database content
  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await getProductsAction();
        const catData = await getCategoriesAction();
        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategorySelect = (catId: string) => {
    if (catId === "all") {
      router.push("/catalog");
    } else {
      router.push(`/catalog?category=${catId}`);
    }
  };

  // Filtering Logic
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = categoryParam === "all" || prod.category.toLowerCase() === categoryParam.toLowerCase();
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-between pt-28">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow pb-24">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-4 md:pb-6 mb-3 md:mb-5 gap-6">
          <div>
            <span className="text-xs font-black tracking-[0.25em] text-brand-red uppercase">Basecamp Alat Outdoor</span>
            <h1 className="text-xl md:text-3xl font-extrabold text-white mt-2">Katalog Perlengkapan</h1>
            <p className="text-sm text-gray-400 mt-2 font-light">
              Tentukan pilihan terbaik untuk petualangan Anda. Semua alat disterilkan dan diinspeksi dengan baik.
            </p>
          </div>

          {/* Search bar & filter trigger container */}
          <div className="flex items-center gap-3 w-full md:w-80">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari alat Outdoor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-950/80 border border-neutral-850 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-premium font-medium"
              />
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-850 flex items-center justify-center text-gray-400 bg-neutral-950/80 cursor-pointer hover:text-white transition-premium">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Categories Bar — Desktop: horizontal pills, Mobile: dropdown bottom-sheet */}
        {/* Desktop Pills (hidden on mobile) */}
        <div className="mb-10 pb-4 hidden md:block">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleCategorySelect("all")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-premium ${categoryParam === "all"
                ? "bg-brand-red text-white shadow-[0_4px_14px_rgba(214,0,0,0.4)]"
                : "bg-neutral-950 border border-neutral-850 text-gray-400 hover:text-white"
                }`}
            >
              <Compass className="w-4 h-4" />
              Semua Alat
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-premium ${categoryParam.toLowerCase() === cat.id.toLowerCase()
                  ? "bg-brand-red text-white shadow-[0_4px_14px_rgba(214,0,0,0.4)]"
                  : "bg-neutral-950 border border-neutral-850 text-gray-400 hover:text-white"
                  }`}
              >
                {getCategoryIcon(cat.icon)}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Category Dropdown Trigger (hidden on desktop) */}
        <div className="mb-6 md:hidden">
          <button
            onClick={() => setFilterOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-850 text-sm font-bold text-white transition-premium"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-brand-red" />
              <span className="text-xs uppercase tracking-wider">
                {categoryParam === "all"
                  ? "Semua Kategori"
                  : categories.find(c => c.id.toLowerCase() === categoryParam.toLowerCase())?.name || "Kategori"
                }
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Mobile Category Bottom-Sheet Modal */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setFilterOpen(false)}
                className="fixed inset-0 bg-black z-50 md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-neutral-800 rounded-t-[28px] z-50 p-5 pb-8 max-h-[70vh] overflow-y-auto md:hidden"
              >
                {/* Handle bar */}
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-1 rounded-full bg-neutral-700" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-red" />
                    Pilih Kategori
                  </h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-neutral-900 text-gray-400 hover:text-white transition-premium"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Category List */}
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => { handleCategorySelect("all"); setFilterOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-premium w-full text-left ${categoryParam === "all"
                      ? "bg-brand-red text-white shadow-[0_4px_14px_rgba(214,0,0,0.3)]"
                      : "bg-neutral-950 border border-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-900"
                      }`}
                  >
                    <Compass className="w-4 h-4" />
                    Semua Alat
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { handleCategorySelect(cat.id); setFilterOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-premium w-full text-left ${categoryParam.toLowerCase() === cat.id.toLowerCase()
                        ? "bg-brand-red text-white shadow-[0_4px_14px_rgba(214,0,0,0.3)]"
                        : "bg-neutral-950 border border-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-900"
                        }`}
                    >
                      {getCategoryIcon(cat.icon)}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-neutral-900 animate-pulse border border-neutral-850" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center glassmorphism rounded-3xl p-8 border border-neutral-900 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-gray-500 mb-6 border border-neutral-850">
              <Inbox className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-xl font-bold text-white leading-snug">Tidak Ada Perlengkapan Cocok</h3>
            <p className="text-sm text-gray-400 mt-2 font-light leading-relaxed max-w-sm">
              Kami tidak dapat menemukan produk yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo; atau kategori terpilih. Cobalah kata kunci lain.
            </p>
            <button
              onClick={() => { setSearchQuery(""); handleCategorySelect("all"); }}
              className="mt-6 px-6 py-2.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold uppercase tracking-wider transition-premium"
            >
              Reset Filter
            </button>
          </motion.div>
        ) : (
          /* Responsive Layout Grid with Framer Motion */
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 md:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((prod) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={prod.id}
                  className="flex"
                >
                  <Link
                    href={`/catalog/${prod.id}`}
                    className="group flex flex-col w-full glassmorphism gpu-accelerated rounded-2xl md:rounded-3xl overflow-hidden hover:border-neutral-700 transition-premium hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-950 border-b border-neutral-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-premium duration-700"
                      />

                      {/* Status Tag */}
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

                      {/* Category Label */}
                      <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg bg-neutral-950/80 backdrop-blur-md text-[8px] md:text-[9px] font-bold text-gray-400 border border-neutral-850">
                        {prod.category}
                      </span>
                    </div>

                    {/* Body contents */}
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
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Safety Note banner */}
        <div className="mt-16 bg-neutral-950/50 border border-neutral-900 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-5 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Catatan Kebersihan & Keselamatan Alat</p>
              <p className="text-xs text-gray-400 font-light mt-0.5 leading-relaxed">
                Setiap tenda dikeringkan menyeluruh, frame diperiksa dari keretakan, kompor dibersihkan dari kerak gas kaleng, dan sleeping bag dicuci disinfektan wangi sebelum dilepas ke pendaki berikutnya.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-widest flex-shrink-0 bg-brand-green/10 border border-brand-green/20 px-4 py-2 rounded-full">
            Noesantara Clean Guaranteed
          </span>
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-40"
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

export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-brand-red animate-spin" />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
