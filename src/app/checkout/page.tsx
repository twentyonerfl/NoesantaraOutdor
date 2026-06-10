"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Trash2, Calendar, User, PhoneCall,
  MapPin, MessageSquare, AlertTriangle, ShieldCheck,
  ChevronLeft, CheckCircle2, MessageCircle, Info, AtSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useCart } from "@/context/CartContext";
import { getSettingsAction, saveRentalsAction } from "@/app/actions";
import { Rental } from "@/lib/db-service";

// Helper functions defined outside component to satisfy React purity rules
function generateOrderGroupId(): string {
  return `rent-${Math.floor(100 + Math.random() * 900)}`;
}

function redirectToWhatsApp(url: string): void {
  if (typeof window !== "undefined") {
    window.location.href = url;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, itemCount } = useCart();

  // Form States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [renterName, setRenterName] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [renterAddress, setRenterAddress] = useState("");
  const [renterSocial, setRenterSocial] = useState("");
  const [notes, setNotes] = useState("");

  const [adminPhone, setAdminPhone] = useState("628123456789");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load Basecamp phone settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSettingsAction();
        if (settings && settings.phone) {
          // Clean phone number: remove +, space, hyphens, and ensure it uses country code
          let cleaned = settings.phone.replace(/[^0-9]/g, "");
          if (cleaned.startsWith("0")) {
            cleaned = "62" + cleaned.slice(1);
          }
          setAdminPhone(cleaned);
        }
      } catch (err) {
        console.error("Gagal memuat setting basecamp:", err);
      }
    }
    loadSettings();
  }, []);

  // Calculate rental day count
  const getDayCount = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  const dayCount = getDayCount();
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.pricePerDay * item.quantity * (dayCount || 1),
    0
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Keranjang sewa Anda kosong.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Harap pilih tanggal sewa dan tanggal kembali.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg("Tanggal kembali tidak boleh mendahului tanggal sewa.");
      return;
    }
    if (!renterName || !renterPhone || !renterAddress) {
      setErrorMsg("Harap lengkapi semua data diri Anda.");
      return;
    }

    // Check stocks
    for (const item of cart) {
      if (item.quantity > item.availableStock) {
        setErrorMsg(`Stok tidak mencukupi untuk "${item.name}". Tersedia: ${item.availableStock} unit.`);
        return;
      }
    }

    setLoading(true);

    try {
      const orderGroupId = generateOrderGroupId();

      // Map cart items into individual Rental transactions
      const newRentals: Rental[] = cart.map((item, index) => ({
        id: `${orderGroupId}-${index + 1}`,
        renterName,
        renterPhone,
        renterAddress,
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        startDate,
        endDate,
        totalPrice: item.pricePerDay * item.quantity * dayCount,
        status: "pending" as const,
        notes: notes || "",
        renterSocial: renterSocial || ""
      }));

      // 1. Save rentals in database batch
      await saveRentalsAction(newRentals);

      // 2. Confetti trigger
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#D60000", "#007A3D", "#FFC83D", "#FFFFFF"]
      });

      setSuccessMsg(true);

      // 3. Formulate WhatsApp Order Text
      let itemsListText = "";
      cart.forEach((item, idx) => {
        itemsListText += `${idx + 1}. ${item.name} (x${item.quantity}) - Rp ${(item.pricePerDay * item.quantity * dayCount).toLocaleString("id-ID")}\n`;
      });

      const formattedStartDate = startDate.split("-").reverse().join("-");
      const formattedEndDate = endDate.split("-").reverse().join("-");

      const message = `Halo Admin Noesantara Outdoor, saya ingin menyewa:
${itemsListText}
Tanggal sewa: ${formattedStartDate}
Tanggal kembali: ${formattedEndDate}
Durasi sewa: ${dayCount} hari
Total Harga: Rp ${totalPrice.toLocaleString("id-ID")}

Detail Penyewa:
Nama: ${renterName}
No HP: ${renterPhone}
Medsos: ${renterSocial || "-"}
Alamat: ${renterAddress}
Catatan: ${notes || "-"}

Terima kasih.`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

      // 4. Clear Cart state
      clearCart();

      // 5. Open WhatsApp redirect immediately
      redirectToWhatsApp(waUrl);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Terjadi kesalahan sistem: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-between pt-28">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow pb-24 w-full">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-400 hover:text-white transition-premium mb-6 md:mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-premium" />
          Kembali ke Katalog
        </Link>

        {/* Page Header */}
        <div className="border-b border-neutral-900 pb-5 mb-8">
          <h1 className="text-3xl font-extrabold text-white">Checkout Sewa</h1>
          <p className="text-sm text-gray-400 mt-1 font-light">
            Selesaikan pemesanan sewa perlengkapan outdoor Anda. Hubungkan langsung ke admin.
          </p>
        </div>

        {successMsg ? (
          /* Success Screen State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glassmorphism rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto border border-neutral-850 shadow-2xl flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 border border-brand-green/20">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Pemesanan Terkirim!</h2>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed font-light">
              Transaksi Anda telah tersimpan di sistem kami. Sekarang kami sedang mengarahkan Anda ke WhatsApp Admin untuk memverifikasi KTP, penyerahan jaminan fisik, dan penjadwalan pengambilan barang.
            </p>
            <p className="text-xs text-brand-yellow font-medium mt-3">
              Jika halaman tidak teralihkan otomatis, klik tombol di bawah ini.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full mt-8">
              <Link
                href="/catalog"
                className="flex-1 py-3 px-5 rounded-xl border border-neutral-800 text-xs font-bold text-gray-300 hover:text-white transition-premium bg-neutral-950/50"
              >
                Kembali ke Katalog
              </Link>
              <a
                href={`https://wa.me/${adminPhone}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold uppercase tracking-wider transition-premium flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Hubungi WhatsApp
              </a>
            </div>
          </motion.div>
        ) : cart.length === 0 ? (
          /* Empty Cart Screen State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism rounded-3xl p-10 md:p-16 text-center max-w-lg mx-auto border border-neutral-900 shadow-xl flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-gray-500 mb-6">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Keranjang Sewa Kosong</h3>
            <p className="text-sm text-gray-400 mt-2 font-light max-w-xs leading-relaxed">
              Anda belum memilih produk perlengkapan gunung apapun. Silakan kunjungi katalog kami untuk memilih tenda, jaket, dan alat mendaki lainnya.
            </p>
            <Link
              href="/catalog"
              className="mt-8 px-6 py-3 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold uppercase tracking-wider transition-premium shadow-[0_4px_14px_rgba(214,0,0,0.4)]"
            >
              Mulai Pilih Produk
            </Link>
          </motion.div>
        ) : (
          /* Split Checkout Columns */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column: Cart Items (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-red" />
                Alat Outdoor Terpilih ({itemCount} Unit)
              </h2>

              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="glassmorphism rounded-2xl p-4 border border-neutral-900 flex gap-4 items-center"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0 border border-neutral-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info and action details */}
                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-extrabold text-white text-sm line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-xs text-brand-yellow font-semibold mt-1">
                          Rp {item.pricePerDay.toLocaleString("id-ID")}/hari
                        </p>
                        <span className="text-[9px] text-gray-500 block mt-1 italic">
                          Tersedia: {item.availableStock} unit
                        </span>
                      </div>

                      {/* Quantity and Delete Controls */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="flex items-center gap-2 bg-neutral-950/70 border border-neutral-850 p-1.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center hover:bg-neutral-800 transition-premium text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center hover:bg-neutral-800 transition-premium text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 rounded-xl bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/20 transition-premium"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Rent Form (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="glassmorphism rounded-2xl md:rounded-3xl p-5 md:p-6 border border-neutral-850 shadow-2xl flex flex-col gap-5">

                <div className="border-b border-neutral-900 pb-3">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-brand-green" />
                    Formulir Sewa Alat
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                    Lengkapi data diri dan rentang waktu penyewaan barang di bawah.
                  </p>
                </div>

                <form onSubmit={handleCheckout} className="flex flex-col gap-4">

                  {/* Select Dates */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        Tanggal Sewa
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        Tanggal Kembali
                      </label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        min={startDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                      />
                    </div>
                  </div>

                  {/* Personal details */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="text"
                        required
                        placeholder="Nama Lengkap"
                        value={renterName}
                        onChange={(e) => setRenterName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                      />
                    </div>

                    <div className="relative">
                      <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="tel"
                        required
                        placeholder="No WhatsApp (contoh: 08123456789)"
                        value={renterPhone}
                        onChange={(e) => setRenterPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                      />
                    </div>

                    <div className="relative">
                      <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type="text"
                        placeholder="Instagram/TikTok (contoh: @username)"
                        value={renterSocial}
                        onChange={(e) => setRenterSocial(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-600" />
                      <textarea
                        required
                        rows={2}
                        placeholder="Alamat Lengkap"
                        value={renterAddress}
                        onChange={(e) => setRenterAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                      />
                    </div>

                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-600" />
                      <textarea
                        rows={1}
                        placeholder="Catatan (warna, jam jemput dll, opsional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                      />
                    </div>
                  </div>

                  {/* Pricing breakdown summary */}
                  <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Durasi Sewa</span>
                      <span className="font-bold text-white">{dayCount > 0 ? `${dayCount} hari` : "-"}</span>
                    </div>

                    <div className="border-t border-neutral-900/60 my-1.5" />

                    <div className="flex flex-col gap-1.5 text-xs text-gray-400 max-h-36 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-[11px]">
                          <span className="truncate max-w-[70%]">{item.name} (x{item.quantity})</span>
                          <span className="font-medium text-gray-300">
                            Rp {(item.pricePerDay * item.quantity * (dayCount || 1)).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-neutral-900 pt-2.5 mt-1 flex items-center justify-between text-sm">
                      <span className="font-extrabold text-white">Total Pembayaran</span>
                      <span className="font-extrabold text-brand-yellow text-base">
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* System Error Message */}
                  {errorMsg && (
                    <div className="text-[11px] text-brand-red font-bold flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 p-2.5 rounded-lg">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {/* Order Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-black uppercase tracking-widest shadow-[0_4px_14px_rgba(0,122,61,0.35)] hover:-translate-y-0.5 transition-premium flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {loading ? "Menyimpan Transaksi..." : "Kirim Pemesanan via WA"}
                  </button>

                  <div className="flex items-center gap-2 mt-1.5 bg-neutral-950/30 border border-neutral-900 p-3 rounded-xl">
                    <Info className="w-4.5 h-4.5 text-brand-yellow flex-shrink-0" />
                    <span className="text-[9px] text-gray-300 leading-normal font-bold">
                      Fisik KTP/Kartu Identitas asli dan jaminan harus diserahkan kepada admin basecamp saat pengambilan perlengkapan.
                    </span>
                  </div>

                </form>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
