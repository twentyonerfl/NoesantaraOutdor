"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, ShoppingCart, UserCheck, Wallet,
  RotateCw, AlertTriangle, Check, RefreshCw, CheckCircle, Database
} from "lucide-react";
import {
  getProductsAction, getRentalsAction, getFinanceAction,
  getDbConnectionStatusAction, syncLocalToGoogleAction, updateRentalStatusAction
} from "../actions";
import { Product, Rental, FinanceEntry } from "@/lib/db-service";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [dbStatus, setDbStatus] = useState<{ mode: "local" | "google"; connected: boolean; message: string; spreadsheetId?: string }>({
    mode: "local",
    connected: false,
    message: "Memuat status..."
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  async function loadData() {
    try {
      const prodData = await getProductsAction();
      const rentData = await getRentalsAction();
      const finData = await getFinanceAction();
      const status = await getDbConnectionStatusAction();

      setProducts(prodData);
      setRentals(rentData);
      setFinance(finData);
      setDbStatus(status);
    } catch (err) {
      console.error("Gagal memuat dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await syncLocalToGoogleAction();
      setSyncMsg(res.message);
      // Reload status
      const status = await getDbConnectionStatusAction();
      setDbStatus(status);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setSyncMsg(`Gagal sinkronisasi: ${errMsg}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateStatus = async (rentId: string, nextStatus: Rental["status"]) => {
    try {
      await updateRentalStatusAction(rentId, nextStatus);
      await loadData(); // Refresh page data
    } catch (err) {
      console.error("Gagal mengupdate status rental:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <RotateCw className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    );
  }

  // Calculate Metrics
  const readyStock = products.reduce((sum, p) => sum + p.availableStock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalTransaksi = rentals.length;
  const barangDisewaCount = rentals.filter((r) => r.status === "disewa").length;

  // Realized income: Sum amount of 'pemasukan' type in finance records
  const totalPendapatan = finance
    .filter((f) => f.type === "pemasukan")
    .reduce((sum, f) => sum + f.amount, 0);

  // Recent/Pending rentals list
  const recentRentals = rentals.slice(-5).reverse();

  // Simple statistics grouping for the SVG bar chart (incomes by date or category)
  // Let's group income from the past 5 transactions for a neat presentation
  const incomeEntries = finance.filter((f) => f.type === "pemasukan").slice(-5);
  const maxIncome = incomeEntries.length > 0 ? Math.max(...incomeEntries.map((e) => e.amount)) : 100000;

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Ringkasan Bisnis</h1>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-light">
          Monitor performa, data rental, inventaris basecamp, dan keuangan Noesantara Outdoor.
        </p>
      </div>

      {/* Database Connection / Google Sheets Sync Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-premium ${dbStatus.connected
        ? "bg-brand-green/5 border-brand-green/20"
        : "bg-brand-yellow/5 border-brand-yellow/20"
        }`}>
        <div className="flex items-start gap-3 w-full md:w-auto">
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${dbStatus.connected ? "bg-brand-green/10 text-brand-green" : "bg-brand-yellow/10 text-brand-yellow"
            }`}>
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">Integrasi Database</span>
              <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${dbStatus.connected ? "bg-brand-green/20 text-brand-green" : "bg-brand-yellow/20 text-brand-yellow"
                }`}>
                {dbStatus.mode === "google" ? "Google Sheets" : "Local Cache"}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 leading-relaxed font-light truncate md:whitespace-normal">
              {dbStatus.message}
            </p>
            {dbStatus.spreadsheetId && (
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono mt-0.5 sm:mt-1 block select-all truncate">
                ID: {dbStatus.spreadsheetId}
              </span>
            )}
          </div>
        </div>

        {/* Sync Trigger button */}
        <div className="flex flex-col items-end gap-1.5 w-full md:w-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`w-full md:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-premium ${syncing
              ? "bg-neutral-900 border border-neutral-800 text-gray-600"
              : "bg-brand-red hover:bg-brand-red-hover text-white shadow-[0_4px_14px_rgba(214,0,0,0.3)]"
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Mensinkronkan..." : "Sinkronkan Cache"}
          </button>
          {syncMsg && (
            <span className="text-[9px] sm:text-[10px] font-semibold text-brand-yellow leading-none">
              {syncMsg}
            </span>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">

        {/* Total Alat */}
        <div className="glassmorphism rounded-2xl p-3.5 sm:p-5 border border-neutral-900 flex items-center justify-between">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block leading-none truncate">Total Alat Outdoor</span>
            <span className="text-sm sm:text-2xl font-black text-white mt-0.5 sm:mt-1 block truncate">{readyStock} / {totalStock} Unit</span>
            <span className="text-[8px] sm:text-[10px] text-brand-green font-semibold mt-0.5 sm:mt-1">Stok Ready / Total</span>
          </div>
          <div className="w-8.5 h-8.5 sm:w-12 sm:h-12 rounded-xl bg-neutral-950 border border-neutral-900 flex-shrink-0 flex items-center justify-center text-brand-red">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Rents */}
        <div className="glassmorphism rounded-2xl p-3.5 sm:p-5 border border-neutral-900 flex items-center justify-between">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block leading-none truncate">Total Booking</span>
            <span className="text-sm sm:text-2xl font-black text-white mt-0.5 sm:mt-1 block truncate">{totalTransaksi} Kali</span>
            <span className="text-[8px] sm:text-[10px] text-brand-green font-semibold mt-0.5 sm:mt-1">Sewa Terlaksana</span>
          </div>
          <div className="w-8.5 h-8.5 sm:w-12 sm:h-12 rounded-xl bg-neutral-950 border border-neutral-900 flex-shrink-0 flex items-center justify-center text-brand-green">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Items Sedang Rented */}
        <div className="glassmorphism rounded-2xl p-3.5 sm:p-5 border border-neutral-900 flex items-center justify-between">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block leading-none truncate">Sedang Disewa</span>
            <span className="text-sm sm:text-2xl font-black text-white mt-0.5 sm:mt-1 block truncate">{barangDisewaCount} Unit</span>
            <span className="text-[8px] sm:text-[10px] text-brand-yellow font-semibold mt-0.5 sm:mt-1">Di Luar Basecamp</span>
          </div>
          <div className="w-8.5 h-8.5 sm:w-12 sm:h-12 rounded-xl bg-neutral-950 border border-neutral-900 flex-shrink-0 flex items-center justify-center text-brand-yellow">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total realized cash */}
        <div className="glassmorphism rounded-2xl p-3.5 sm:p-5 border border-neutral-900 flex items-center justify-between">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block leading-none truncate">Pendapatan Bersih</span>
            <span className="text-sm sm:text-xl font-black text-brand-green mt-0.5 sm:mt-1 block truncate">
              Rp {totalPendapatan.toLocaleString("id-ID")}
            </span>
            <span className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1">Realized Billing</span>
          </div>
          <div className="w-8.5 h-8.5 sm:w-12 sm:h-12 rounded-xl bg-neutral-950 border border-neutral-900 flex-shrink-0 flex items-center justify-center text-white bg-brand-green/10">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

      </div>

      {/* Grid: Revenue Chart & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Custom SVG bar chart (7 Cols) */}
        <div className="lg:col-span-7 glassmorphism rounded-2xl p-6 border border-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Grafik Arus Pemasukan</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Pendapatan sewa terealisasi dari 5 transaksi terakhir.</p>
            </div>
            <span className="text-xs font-bold text-brand-green">Total Rp {totalPendapatan.toLocaleString("id-ID")}</span>
          </div>

          {/* SVG Chart */}
          {incomeEntries.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-gray-600 italic">
              Belum ada data pemasukan sewa untuk digambarkan.
            </div>
          ) : (
            <div className="w-full">
              <svg viewBox="0 0 500 200" className="w-full h-56 bg-neutral-950/40 rounded-xl border border-neutral-900/50 p-4">
                {/* Horizontal grid lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#161616" strokeDasharray="4 4" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#161616" strokeDasharray="4 4" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#161616" strokeDasharray="4 4" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#262626" strokeWidth="2" />

                {/* Y-axis metrics label */}
                <text x="35" y="35" fill="#525252" fontSize="9" textAnchor="end">Max</text>
                <text x="35" y="100" fill="#525252" fontSize="9" textAnchor="end">Med</text>
                <text x="35" y="174" fill="#525252" fontSize="9" textAnchor="end">0</text>

                {/* Bars dynamic mapping */}
                {incomeEntries.map((entry, idx) => {
                  const barWidth = 36;
                  const barGap = 50;
                  const startX = 70 + idx * (barWidth + barGap);

                  // Compute scale ratio (height matches maxIncome)
                  const barHeight = Math.max(20, (entry.amount / maxIncome) * 120);
                  const startY = 170 - barHeight;

                  return (
                    <g key={entry.id} className="group">
                      {/* Bar Pillar with glowing brand green/yellow gradient fill */}
                      <rect
                        x={startX}
                        y={startY}
                        width={barWidth}
                        height={barHeight}
                        rx="6"
                        fill="#007A3D"
                        className="transition-premium duration-500 hover:fill-brand-red opacity-85 hover:opacity-100 cursor-pointer"
                      />
                      {/* Amount floating tag */}
                      <text
                        x={startX + barWidth / 2}
                        y={startY - 6}
                        fill="#FFC83D"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Rp {Math.floor(entry.amount / 1000)}k
                      </text>
                      {/* Date label at bottom */}
                      <text
                        x={startX + barWidth / 2}
                        y="186"
                        fill="#8a8a8a"
                        fontSize="8"
                        textAnchor="middle"
                      >
                        {entry.date.split("-").slice(1).reverse().join("/")}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Right: Recent Bookings list (5 Cols) */}
        <div className="lg:col-span-5 glassmorphism rounded-2xl p-6 border border-neutral-900 flex flex-col gap-5">
          <div className="border-b border-neutral-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Antrean Transaksi Terbaru</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Klik untuk mengonfirmasi status sewa dengan cepat.</p>
          </div>

          <div className="flex flex-col gap-3">
            {recentRentals.length === 0 ? (
              <p className="text-xs text-gray-600 italic py-6 text-center">Belum ada sewa terdaftar.</p>
            ) : (
              recentRentals.map((rent) => (
                <div
                  key={rent.id}
                  className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white truncate">{rent.renterName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${rent.status === "selesai"
                        ? "bg-brand-green/20 text-brand-green"
                        : rent.status === "disewa"
                          ? "bg-brand-yellow/20 text-brand-yellow"
                          : rent.status === "telat"
                            ? "bg-brand-red/20 text-brand-red border border-brand-red/35"
                            : "bg-gray-800 text-gray-400"
                        }`}>
                        {rent.status}
                      </span>
                    </div>
                    <span className="text-gray-400 font-light truncate">{rent.productName} (x{rent.quantity})</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {rent.startDate.split("-").reverse().join("-")} s/d {rent.endDate.split("-").reverse().join("-")}
                    </span>
                  </div>

                  {/* Actions buttons directly from dashboard */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {rent.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(rent.id, "disewa")}
                        title="Setujui Barang Keluar"
                        className="w-7 h-7 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center justify-center hover:bg-brand-green hover:text-white transition-premium"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {rent.status === "disewa" && (
                      <button
                        onClick={() => handleUpdateStatus(rent.id, "selesai")}
                        title="Selesaikan Rental (Kembali)"
                        className="w-7 h-7 rounded-lg bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 flex items-center justify-center hover:bg-brand-yellow hover:text-white transition-premium"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
