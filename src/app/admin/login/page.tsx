"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/logo";
import { loginAdminAction } from "@/app/actions";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setError("Email dan Password wajib diisi!");
      setLoading(false);
      return;
    }

    try {
      const res = await loginAdminAction(email, password);
      if (res.success) {
        // Force fully refreshed route redirect to trigger middleware session update
        window.location.href = "/admin";
      } else {
        setError(res.error || "Kredensial login salah.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Gagal melakukan login admin:", err);
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Immersive background camp image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-[2px] pointer-events-none scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1920&auto=format&fit=crop')`
        }}
      />

      {/* Floating abstract glowing lights */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-red/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-green/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Inner Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Return to Public Site Link */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-premium text-xs font-bold uppercase tracking-wider mb-6 group bg-neutral-950/40 border border-neutral-900 px-4 py-2 rounded-full mx-auto"
        >
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-0.5 transition-premium text-brand-green" />
          Kembali ke Website Utama
        </button>

        {/* Login Glassmorphism Box */}
        <div className="glassmorphism rounded-[32px] border border-neutral-900 p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top Logo Frame */}
          <div className="flex flex-col items-center text-center gap-4">
            <Logo showText={false} className="h-20" />
            <div>
              <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.25em] block animate-pulse">Basecamp Portal</span>
              <h1 className="text-2xl font-black text-white mt-1">Autentikasi Admin</h1>
              <p className="text-xs text-gray-400 font-light mt-1.5 max-w-[280px] mx-auto leading-relaxed">
                Masukkan email & password administrator untuk masuk ke dasboard Noesantara Outdoor.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-red/10 border border-brand-red/30 rounded-2xl p-4 flex items-start gap-3 text-brand-red"
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Akses Ditolak</p>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block pl-1">Email Admin</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="email"
                  placeholder="admin@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-950/80 border border-neutral-900 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-brand-red focus:bg-neutral-950 transition-premium font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block pl-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl bg-neutral-950/80 border border-neutral-900 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-brand-red focus:bg-neutral-950 transition-premium font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-premium"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(214,0,0,0.3)] hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:-translate-y-0 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Membuka Kunci Dasbor...
                </>
              ) : (
                <>
                  <Lock className="w-4.5 h-4.5" />
                  Masuk Portal
                </>
              )}
            </button>
          </form>

          {/* Quick Notice Details */}
          <div className="text-center pt-2 border-t border-neutral-900 text-[10px] text-gray-500 leading-relaxed font-light">
            Sistem pengaman SSL terenkripsi aktif. Sesi Anda akan tersimpan selama 7 hari secara aman pada browser ini.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
