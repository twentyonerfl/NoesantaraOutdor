"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin, Phone, Mail, Clock, ShieldCheck,
  Save, RotateCcw, CheckCircle2, AlertTriangle, Loader2,
  Tent, Backpack, Compass, Flame, Navigation, Trash2, KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSettingsAction, saveSettingsAction, resetFinanceJournalAction } from "@/app/actions";
import { BasecampSettings } from "@/lib/db-service";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center gap-2 border border-neutral-850 rounded-2xl min-h-[240px]">
      <Loader2 className="w-6 h-6 text-brand-red animate-spin" />
      <span className="text-[10px] text-gray-500 font-light">Memuat Peta Interaktif...</span>
    </div>
  )
});

export default function AdminSettings() {
  const [settings, setSettings] = useState<BasecampSettings>({
    address: "",
    phone: "",
    email: "",
    operatingHours: "",
    cleanWarranty: "",
    gmapsEmbedUrl: "",
    latitude: -6.890986,
    longitude: 107.604929,
    mapIcon: "default"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  // Default parameters for quick resets
  const defaultSeeds: BasecampSettings = {
    address: "Basecamp Noesantara, Jl. Gunung Rinjani No. 108, Kav. 5, Bandung, Jawa Barat",
    phone: "+62 812-3456-789",
    email: "info@noesantaraoutdoor.com",
    operatingHours: "Setiap Hari (Senin - Minggu) 08.00 WIB - 21.00 WIB",
    cleanWarranty: "Tenda & sleeping bag dicuci wangi setelah sewa.",
    gmapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9168067868735!2d107.60492857418702!3d-6.890985867429188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6587c6cfb4b%3A0xd674c2d46e10037a!2sParis%20Van%20Java!5e0!3m2!1sid!2sid!4v1716800000000!5m2!1sid!2sid",
    latitude: -6.890986,
    longitude: 107.604929,
    mapIcon: "default"
  };

  // Load settings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSettingsAction();
        setSettings({
          ...data,
          latitude: data.latitude ?? -6.890986,
          longitude: data.longitude ?? 107.604929,
          mapIcon: data.mapIcon ?? "default"
        });
      } catch (err) {
        console.error("Gagal memuat konfigurasi basecamp:", err);
        setStatus({ type: "error", msg: "Gagal memuat data dari database." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTrackLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }
    setTracking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setTracking(false);
        setStatus({
          type: "success",
          msg: `Lokasi perangkat berhasil dilacak: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        });
        setTimeout(() => setStatus(null), 5000);
      },
      (error) => {
        console.error("Gagal melacak lokasi:", error);
        setTracking(false);
        alert(`Gagal melacak lokasi: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "gmapsEmbedUrl" && value.includes("<iframe")) {
      const match = value.match(/src="([^"]+)"/);
      if (match && match[1]) {
        finalValue = match[1];
      }
    }
    setSettings((prev) => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang ke pengaturan default awal?")) {
      setSettings(defaultSeeds);
      setStatus({ type: "success", msg: "Form disetel ke bawaan pabrik. Klik simpan untuk merealisasikan." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Validation
    if (!settings.address.trim() || !settings.phone.trim() || !settings.email.trim()) {
      setStatus({ type: "error", msg: "Alamat, No WhatsApp, dan Email wajib diisi." });
      setSaving(false);
      return;
    }

    const finalSettings = {
      ...settings,
      latitude: settings.latitude ? Number(settings.latitude) : -6.890986,
      longitude: settings.longitude ? Number(settings.longitude) : 107.604929,
      mapIcon: settings.mapIcon || "default"
    };

    try {
      await saveSettingsAction(finalSettings);
      setSettings(finalSettings);
      setStatus({ type: "success", msg: "Konfigurasi Basecamp berhasil diperbarui dan dipublikasikan!" });

      // Auto clear success message after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      console.error("Gagal menyimpan konfigurasi:", err);
      setStatus({ type: "error", msg: "Gagal menyimpan perubahan ke database." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
        <p className="text-sm text-gray-400 font-light">Memuat konfigurasi basecamp...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl pb-12">
      {/* Title Header */}
      <div>
        <span className="text-[9px] sm:text-xs font-black tracking-[0.25em] text-brand-red uppercase">Portal Kontrol Utama</span>
        <h1 className="text-xl sm:text-3xl font-extrabold text-white mt-1">Pengaturan Basecamp</h1>
        <p className="text-[10px] sm:text-sm text-gray-400 mt-1.5 sm:mt-2 font-light leading-relaxed">
          Ubah informasi kontak, alamat operasional, dan garansi kebersihan yang ditampilkan secara real-time pada footer halaman publik.
        </p>
      </div>

      {/* Notification Banner */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-start gap-3 ${status.type === "success"
              ? "bg-brand-green/10 border-brand-green/30 text-brand-green"
              : "bg-brand-red/10 border-brand-red/30 text-brand-red"
            }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {status.type === "success" ? "Sukses" : "Peringatan"}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1 leading-relaxed">{status.msg}</p>
          </div>
        </motion.div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="glassmorphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-neutral-900 space-y-6 sm:space-y-8 relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-brand-red/5 rounded-full filter blur-2xl pointer-events-none" />

        {/* 1. Kontak & Alamat Grid */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-l-2 border-brand-red pl-2.5 sm:pl-3.5 mb-2">
            Informasi Kontak & Alamat
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Phone WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-yellow" /> No WhatsApp Admin
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="+62 812-3456-789"
                className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
              />
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-light block leading-relaxed">
                Nomor ini digunakan sebagai link direct chat pada footer dan tombol redirect checkout. Format bebas (disarankan diawali +62).
              </span>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-green" /> Email Basecamp
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="info@noesantaraoutdoor.com"
                className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
              />
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-light block leading-relaxed">
                Alamat korespondensi surat resmi toko Noesantara Outdoor.
              </span>
            </div>
          </div>

          {/* Physical Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-red" /> Alamat Fisik / Maps Basecamp
            </label>
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows={3}
              placeholder="Jl. Gunung Rinjani No. 108..."
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-light leading-relaxed"
            />
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-light block leading-relaxed">
              Tuliskan lokasi fisik toko secara lengkap agar memudahkan penyewa yang ingin mengambil alat langsung ke basecamp.
            </span>
          </div>

          {/* PETA KOORDINAT INTERAKTIF (Leaflet.js) */}
          <div className="space-y-3 pt-3 sm:pt-4 border-t border-neutral-900/60">
            <h3 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-brand-green" /> Lokasi Koordinat Basecamp
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={settings.latitude ?? ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="-6.890986"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={settings.longitude ?? ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="107.604929"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                />
              </div>
            </div>

            {/* Geolocation Button */}
            <button
              type="button"
              onClick={handleTrackLocation}
              disabled={tracking}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider transition-premium flex items-center justify-center gap-1.5"
            >
              {tracking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                  Melacak Koordinat Perangkat...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-brand-red fill-brand-red/10" />
                  Track Lokasi GPS<span className="hidden sm:inline"> (Gunakan Geolocation)</span>
                </>
              )}
            </button>
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-light block leading-relaxed -mt-1">
              Gunakan fitur Geolocation untuk mengambil titik koordinat GPS perangkat Anda saat ini secara real-time.
            </span>
          </div>

          {/* Custom Marker Selection */}
          <div className="space-y-2.5 pt-3 sm:pt-4 border-t border-neutral-900/60">
            <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-yellow" /> Kustomisasi Ikon Peta (Marker)
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {[
                { id: "default", label: "Pin", icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "tent", label: "Tenda", icon: <Tent className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "campfire", label: "Api", icon: <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "compass", label: "Kompas", icon: <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "backpack", label: "Tas", icon: <Backpack className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
              ].map((item) => {
                const isActive = settings.mapIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, mapIcon: item.id }))}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-premium ${isActive
                        ? "border-brand-red bg-brand-red/10 text-brand-red font-bold"
                        : "border-neutral-850 bg-neutral-950 text-gray-400 hover:text-white hover:border-neutral-750"
                      }`}
                  >
                    {item.icon}
                    <span className="text-[8px] sm:text-[10px] tracking-wide uppercase">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Maps Embed URL */}
          <div className="space-y-1.5 pt-3 sm:pt-4 border-t border-neutral-900/60">
            <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-550" /> Link Sematan Google Maps (Embed URL - Opsional)
            </label>
            <input
              type="text"
              name="gmapsEmbedUrl"
              value={settings.gmapsEmbedUrl || ""}
              onChange={handleChange}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
            />
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-light block leading-relaxed">
              URL Iframe cadangan dari Google Maps untuk sinkronisasi kompatibilitas.
            </span>
          </div>

          {/* Map Preview */}
          <div className="mt-3.5 rounded-2xl overflow-hidden border border-neutral-800 h-48 sm:h-64 relative bg-neutral-950 shadow-inner">
            <InteractiveMap
              latitude={settings.latitude ?? -6.890986}
              longitude={settings.longitude ?? 107.604929}
              mapIcon={settings.mapIcon}
              isDraggable={true}
              onPositionChange={(lat, lng) => {
                setSettings(prev => ({ ...prev, latitude: lat, longitude: lng }));
              }}
            />
            <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full bg-black/80 border border-neutral-800 text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              Pratinjau Peta Interaktif
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] text-brand-yellow font-light block mt-1 leading-relaxed">
            💡 <strong>Tips:</strong> Peta di atas sepenuhnya interaktif. Anda dapat <strong>menggeser (drag) ikon marker</strong> secara langsung pada peta untuk memposisikan letak koordinat Basecamp Anda secara presisi!
          </span>
        </div>

        {/* 2. Operations & Warranty */}
        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-neutral-900">
          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-l-2 border-brand-green pl-2.5 sm:pl-3.5 mb-2">
            Jadwal Operasional & Garansi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Operating Hours */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-yellow" /> Jam Operasional Basecamp
              </label>
              <input
                type="text"
                name="operatingHours"
                value={settings.operatingHours}
                onChange={handleChange}
                placeholder="08.00 WIB - 21.00 WIB"
                className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
              />
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-light block leading-relaxed">
                Jam aktif pengambilan barang dan pelayanan pelanggan.
              </span>
            </div>

            {/* Clean Warranty Guarantee */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" /> Deskripsi Garansi Higienis
              </label>
              <textarea
                name="cleanWarranty"
                value={settings.cleanWarranty}
                onChange={handleChange}
                rows={2}
                placeholder="Tenda & sleeping bag dicuci wangi..."
                className="w-full px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-light leading-relaxed resize-none"
              />
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-light block leading-relaxed">
                Slogan jaminan kebersihan yang dipajang di pojok kanan bawah footer.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 sm:pt-6 border-t border-neutral-900">
          {/* Submit Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl sm:rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_4px_14px_rgba(214,0,0,0.3)] hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:-translate-y-0 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Zona Bahaya / Reset Data */}
      <div className="glassmorphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-red-950/20 bg-red-950/5 space-y-4 sm:space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-red/5 rounded-full filter blur-xl pointer-events-none" />

        <div className="space-y-1.5">
          <h2 className="text-xs sm:text-sm font-bold text-brand-red uppercase tracking-wider border-l-2 border-brand-red pl-2.5 sm:pl-3.5">
            Zona Bahaya &amp; Kontrol Database
          </h2>
          <p className="text-[9.5px] sm:text-[11px] text-gray-400 leading-relaxed font-light">
            Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan. Pastikan Anda memahami konsekuensinya.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">Hapus Jurnal Arus Kas</h4>
            <p className="text-[9.5px] sm:text-[10px] text-gray-500 font-light leading-relaxed">
              Mereset seluruh riwayat catatan transaksi arus kas (pemasukan, pengeluaran, &amp; pendapatan sewa otomatis). Seluruh data keuangan di database akan dikosongkan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-red/10 border border-brand-red/35 hover:bg-brand-red text-brand-red hover:text-white text-[10px] sm:text-xs font-black uppercase tracking-wider transition-premium flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Arus Kas
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Arus Kas */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!resetting) {
                  setShowResetModal(false);
                  setPinInput("");
                  setResetError("");
                }
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
              className="w-full max-w-[340px] sm:max-w-sm glassmorphism border border-neutral-850 rounded-3xl p-5 sm:p-6 relative overflow-hidden mx-4 text-center z-10"
            >
              {/* Red decorative warning blur */}
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-brand-red/10 rounded-full filter blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-brand-red/5 rounded-full filter blur-xl pointer-events-none" />

              {/* Trash Icon */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">Hapus Jurnal Arus Kas?</h3>
              <p className="text-[10px] sm:text-xs text-gray-400 font-light mt-2 leading-relaxed">
                Tindakan ini akan menghapus permanen seluruh riwayat transaksi pemasukan &amp; pengeluaran. Masukkan 6-digit PIN keamanan untuk mengkonfirmasi.
              </p>

              {/* Pin Input Form */}
              <div className="mt-5 space-y-3">
                <div className="flex justify-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Allow only digits
                      setPinInput(val);
                      if (val.length === 6 && val !== "211102") {
                        setResetError("PIN Konfirmasi Salah!");
                      } else {
                        setResetError("");
                      }
                    }}
                    placeholder="PIN Keamanan"
                    className="w-full max-w-[180px] text-center px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-red tracking-widest font-mono font-bold"
                    disabled={resetting}
                  />
                </div>

                {resetError && (
                  <p className="text-[9px] sm:text-[10px] font-bold text-brand-red uppercase tracking-wider">
                    {resetError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {/* Cancel Button */}
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => {
                    setShowResetModal(false);
                    setPinInput("");
                    setResetError("");
                  }}
                  className="py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-xs font-bold text-gray-400 hover:text-white transition-premium cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>

                {/* Confirm Delete Button */}
                <button
                  type="button"
                  disabled={resetting || pinInput.length !== 6}
                  onClick={async () => {
                    if (pinInput !== "211102") {
                      setResetError("PIN Konfirmasi Salah!");
                      return;
                    }
                    setResetting(true);
                    setResetError("");
                    try {
                      const res = await resetFinanceJournalAction(pinInput);
                      if (res.success) {
                        setShowResetModal(false);
                        setPinInput("");
                        setStatus({ type: "success", msg: "Seluruh jurnal transaksi arus kas berhasil dikosongkan!" });
                        setResetting(false);
                        setTimeout(() => setStatus(null), 5000);
                      } else {
                        setResetError(res.error || "Gagal melakukan reset.");
                        setResetting(false);
                      }
                    } catch (e) {
                      const errMsg = e instanceof Error ? e.message : String(e);
                      setResetError(errMsg);
                      setResetting(false);
                    }
                  }}
                  className="py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(214,0,0,0.3)] hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:-translate-y-0 flex items-center justify-center gap-1.5"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Hapus Semua"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Preview Information Guide */}
      <div className="p-4 bg-neutral-950/40 border border-neutral-900 rounded-2xl flex items-start gap-3.5">
        <div className="w-8.5 h-8.5 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow flex-shrink-0 border border-brand-yellow/20">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider leading-none">Sinkronisasi Instan Halaman Publik</h4>
          <p className="text-[9.5px] sm:text-[11px] text-gray-400 font-light mt-1.5 leading-relaxed">
            Setiap kali Anda menekan tombol <strong>Simpan Pengaturan</strong> di atas, cache Next.js akan direvalidasi secara dinamis. Informasi Basecamp di website utama Anda akan langsung terupdate detik itu juga tanpa perlu melakukan reload server atau deploy ulang kode program.
          </p>
        </div>
      </div>
    </div>
  );
}
