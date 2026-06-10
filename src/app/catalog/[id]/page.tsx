"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Tent, Backpack, Shirt, Flame, Compass, 
  ChevronLeft, ArrowRight, CheckCircle2, ShieldCheck, 
  Calendar, ShoppingCart, User, MapPin, MessageSquare, 
  Info, AlertTriangle, MessageCircle 
} from "lucide-react";
import confetti from "canvas-confetti";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getProductsAction, saveRentalAction } from "@/app/actions";
import { Product } from "@/lib/db-service";
import { useCart } from "@/context/CartContext";

interface DetailProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetail({ params }: DetailProps) {
  const router = useRouter();
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Booking Form States
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const [addedToCartMsg, setAddedToCartMsg] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedToCartMsg(true);
    setTimeout(() => {
      setAddedToCartMsg(false);
    }, 4000);
  };

  const handleSewaSekarang = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push("/checkout");
  };

  // Fetch product data
  useEffect(() => {
    async function loadProduct() {
      try {
        const prods = await getProductsAction();
        const found = prods.find((p) => p.id === id);
        if (found) {
          setProduct(found);
        }
      } catch (err) {
        console.error("Gagal memuat produk detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-brand-red animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col justify-between pt-28">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-20 px-6">
          <AlertTriangle className="w-16 h-16 text-brand-red mx-auto mb-6" />
          <h2 className="text-2xl font-extrabold text-white">Alat Tidak Ditemukan</h2>
          <p className="text-sm text-gray-400 mt-2 font-light">
            Perlengkapan outdoor yang Anda cari tidak tersedia atau telah dihapus dari sistem kami.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-red text-white text-xs font-bold uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-between pt-28">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow pb-24">
        {/* Back navigation link */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-400 hover:text-white transition-premium mb-5 md:mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-premium" />
          Kembali ke Katalog
        </Link>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left Column: Image Gallery & Description (8 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5 md:gap-8">
            
            {/* Gallery Frame */}
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="relative h-[250px] sm:h-[350px] md:h-[500px] w-full bg-neutral-950 rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-900 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[activeImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Float stock banner */}
                <span
                  className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    product.status === "Ready"
                      ? "bg-brand-green/20 text-brand-green border border-brand-green/30"
                      : product.status === "Disewa"
                      ? "bg-brand-red/20 text-brand-red border border-brand-red/30"
                      : "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30"
                  }`}
                >
                  {product.status}
                </span>
              </div>

              {/* Thumbnails row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2.5 md:gap-4">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-11 md:w-24 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-neutral-950 border transition-premium ${
                        activeImageIdx === idx ? "border-brand-red scale-102" : "border-neutral-900 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="glassmorphism rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col gap-4 md:gap-6">
              <div>
                <span className="text-[10px] md:text-xs font-bold text-brand-green uppercase tracking-widest">{product.category}</span>
                <h1 className="text-xl md:text-3xl font-extrabold text-white mt-1 leading-snug">{product.name}</h1>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[10px] md:text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                    Higienis & Wangi
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow" />
                    Tersedia: {product.availableStock} unit
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-gray-500" />
                    Total Stok: {product.stock}
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-900 pt-4 md:pt-6">
                <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">Deskripsi Lengkap</h3>
                <p className="text-[11px] md:text-sm text-gray-400 font-light leading-relaxed mt-2 md:mt-3">
                  {product.description}
                </p>
              </div>

              {/* Bullet Features list */}
              {product.features.length > 0 && (
                <div className="border-t border-neutral-900 pt-4 md:pt-6">
                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider mb-2 md:mb-3">Spesifikasi & Fitur Utama</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-[10px] md:text-xs text-gray-400">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 md:gap-2.5 leading-normal">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Floating Checkout Card (5 Cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="glassmorphism rounded-2xl md:rounded-3xl p-4 md:p-6 border border-neutral-850 shadow-2xl flex flex-col gap-4 md:gap-6 relative overflow-hidden">
              {/* Header inside the booking card */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 md:pb-4">
                <div>
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Harga Rental</span>
                  <p className="text-xl md:text-2xl font-extrabold text-brand-yellow mt-1">
                    Rp {product.pricePerDay.toLocaleString("id-ID")}
                    <span className="text-[10px] md:text-xs font-normal text-gray-400"> /hari</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest block leading-none">Sisa Stok</span>
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider block mt-1 ${product.availableStock > 0 ? "text-brand-green" : "text-brand-red"}`}>
                    {product.availableStock > 0 ? `${product.availableStock} Unit Ready` : "Stok Habis"}
                  </span>
                </div>
              </div>

              {/* Added to Cart Notification */}
              {addedToCartMsg && (
                <div className="bg-brand-yellow/20 border border-brand-yellow/30 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Ditambahkan ke Keranjang!</h4>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        &ldquo;{product.name}&rdquo; (x{quantity}) berhasil ditambahkan. Anda dapat terus memilih alat lainnya atau lanjut sewa.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      href="/catalog"
                      className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-gray-350 hover:text-white transition-premium"
                    >
                      Pilih Alat Lain
                    </Link>
                    <Link
                      href="/checkout"
                      className="px-4 py-2 rounded-xl bg-brand-red text-[10px] font-bold text-white hover:bg-brand-red-hover transition-premium flex items-center gap-1"
                    >
                      Lanjut Sewa &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* Rental Unavailable State */}
              {product.availableStock === 0 || product.status !== "Ready" ? (
                <div className="bg-brand-red/10 border border-brand-red/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Alat Sedang Tidak Tersedia</h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      Peralatan ini sedang disewa oleh pendaki lain atau masuk jadwal pemeliharaan (maintenance). Harap hubungi admin untuk antrean pemesanan berikutnya.
                    </p>
                    <a
                      href="https://wa.me/628123456789"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3.5 inline-flex items-center gap-2 text-xs font-bold text-brand-yellow hover:text-white transition-premium"
                    >
                      <MessageCircle className="w-4 h-4" /> Hubungi Admin Basecamp
                    </a>
                  </div>
                </div>
              ) : (
                /* Interactive Quantity & Cart Actions Container */
                <div className="flex flex-col gap-5">
                  {/* Quantity selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-brand-yellow" />
                      Jumlah Alat
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-xl border border-neutral-850 bg-neutral-950 flex items-center justify-center font-bold text-white hover:border-neutral-700 transition-premium"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-white">{quantity} Unit</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.availableStock, quantity + 1))}
                        className="w-9 h-9 rounded-xl border border-neutral-850 bg-neutral-950 flex items-center justify-center font-bold text-white hover:border-neutral-700 transition-premium"
                      >
                        +
                      </button>
                      <span className="text-[10px] text-gray-550 italic pl-1">Maks: {product.availableStock} unit</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-900/60 my-1" />

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleSewaSekarang}
                      className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest shadow-[0_4px_14px_rgba(214,0,0,0.4)] flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-premium cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Sewa Sekarang (Checkout)
                    </button>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full py-3.5 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 hover:bg-brand-yellow text-brand-yellow hover:text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-premium cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Tambah ke Keranjang
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-neutral-950/30 border border-neutral-900 p-3.5 rounded-xl mt-1">
                    <Info className="w-4 h-4 text-brand-green flex-shrink-0" />
                    <span className="text-[9.5px] text-gray-500 leading-normal font-light">
                      Anda bisa menambah alat lain ke keranjang belanja sebelum melengkapi formulir sewa di halaman checkout.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
