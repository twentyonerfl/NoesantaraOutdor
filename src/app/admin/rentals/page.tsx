"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarRange, CheckCircle, Clock, AlertTriangle, 
  RefreshCw, MessageSquare, PhoneCall, Check, X 
} from "lucide-react";
import { getRentalsAction, updateRentalStatusAction } from "@/app/actions";
import { Rental } from "@/lib/db-service";

export default function AdminRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadRentals() {
    try {
      const data = await getRentalsAction();
      setRentals(data);
    } catch (err) {
      console.error("Gagal memuat rentals:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadRentals();
    }, 0);
  }, []);

  const handleUpdateStatus = async (rentId: string, status: Rental["status"]) => {
    try {
      await updateRentalStatusAction(rentId, status);
      loadRentals();
    } catch (err) {
      console.error("Gagal mengupdate status rental:", err);
    }
  };

  const filteredRentals = rentals.filter((rent) => {
    if (statusFilter === "all") return true;
    return rent.status.toLowerCase() === statusFilter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-brand-red animate-spin" />
      </div>
    );
  }

  const filters = [
    { id: "all", label: "Semua" },
    { id: "pending", label: "Pending" },
    { id: "disewa", label: "Disewa" },
    { id: "selesai", label: "Selesai" },
    { id: "telat", label: "Telat" }
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Kelola Transaksi</h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-light">
            Pantau sewa aktif, verifikasi barang kembali, dan lacak keterlambatan pengembalian alat.
          </p>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-center gap-1 border-b border-neutral-900 pb-2 overflow-x-auto scrollbar-none">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase tracking-wider transition-premium ${
              statusFilter === filter.id
                ? "bg-brand-red text-white"
                : "text-gray-400 hover:text-white hover:bg-neutral-900/40"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Rentals Table/Cards Container */}
      <div className="glassmorphism rounded-2xl overflow-hidden border border-neutral-900 shadow-2xl">
        {/* Desktop Table View (MD & Up) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/50 text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                <th className="p-4 pl-6">ID & Penyewa</th>
                <th className="p-4">Alat & Qty</th>
                <th className="p-4">Durasi Sewa</th>
                <th className="p-4">Total Biaya</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    Tidak ada transaksi sewa dengan status ini.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rent) => (
                  <tr key={rent.id} className="hover:bg-neutral-950/30 transition-premium">
                    
                    {/* ID & Customer Info */}
                    <td className="p-4 pl-6">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-extrabold text-white text-sm">{rent.renterName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-gray-500">{rent.id}</span>
                          <span className="text-gray-600">|</span>
                          <a
                            href={`https://wa.me/${rent.renterPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-brand-green font-bold flex items-center gap-1 hover:text-white transition-premium"
                          >
                            <PhoneCall className="w-3 h-3" />
                            {rent.renterPhone}
                          </a>
                          {rent.renterSocial && (
                            <>
                              <span className="text-gray-600">|</span>
                              <span className="text-[10px] text-brand-red font-bold">{rent.renterSocial}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Product & Qty */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-300">{rent.productName}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">{rent.quantity} unit</span>
                      </div>
                    </td>

                    {/* Timeline dates */}
                    <td className="p-4">
                      <div className="flex flex-col text-gray-400 font-medium">
                        <span>{rent.startDate.split("-").reverse().join("-")}</span>
                        <span className="text-[10px] text-gray-600 font-normal">s/d {rent.endDate.split("-").reverse().join("-")}</span>
                      </div>
                    </td>

                    {/* Billing */}
                    <td className="p-4 font-extrabold text-brand-yellow">
                      Rp {rent.totalPrice.toLocaleString("id-ID")}
                    </td>

                    {/* Status Select Box */}
                    <td className="p-4">
                      <select
                        value={rent.status}
                        onChange={(e) => handleUpdateStatus(rent.id, e.target.value as Rental["status"])}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider focus:outline-none border ${
                          rent.status === "selesai"
                            ? "bg-brand-green/20 text-brand-green border-brand-green/35"
                            : rent.status === "disewa"
                            ? "bg-brand-yellow/20 text-brand-yellow border-brand-yellow/35"
                            : rent.status === "telat"
                            ? "bg-brand-red/20 text-brand-red border-brand-red/35 animate-pulse"
                            : "bg-neutral-900 text-gray-400 border-neutral-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="disewa">Disewa</option>
                        <option value="selesai">Selesai</option>
                        <option value="telat">Telat</option>
                      </select>
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rent.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(rent.id, "disewa")}
                            title="Setujui Barang Keluar"
                            className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-white transition-premium"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(rent.status === "disewa" || rent.status === "telat") && (
                          <button
                            onClick={() => handleUpdateStatus(rent.id, "selesai")}
                            title="Selesaikan Rental (Kembali)"
                            className="p-1.5 rounded-lg bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 hover:bg-brand-yellow hover:text-white transition-premium"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {rent.notes && (
                          <div 
                            title={rent.notes} 
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-850 text-gray-500 cursor-help"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Hidden on MD & Up) */}
        <div className="md:hidden flex flex-col divide-y divide-neutral-900">
          {filteredRentals.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic text-xs">
              Tidak ada transaksi sewa dengan status ini.
            </div>
          ) : (
            filteredRentals.map((rent) => (
              <div key={rent.id} className="p-3.5 flex flex-col gap-2.5 hover:bg-neutral-950/20 transition-premium">
                {/* Header: Name and Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-white text-xs truncate">{rent.renterName}</span>
                    <span className="text-[9px] font-mono text-gray-500">{rent.id}</span>
                  </div>
                  
                  {/* Select status status dropdown directly in card header */}
                  <select
                    value={rent.status}
                    onChange={(e) => handleUpdateStatus(rent.id, e.target.value as Rental["status"])}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider focus:outline-none border ${
                      rent.status === "selesai"
                        ? "bg-brand-green/20 text-brand-green border-brand-green/35"
                        : rent.status === "disewa"
                        ? "bg-brand-yellow/20 text-brand-yellow border-brand-yellow/35"
                        : rent.status === "telat"
                        ? "bg-brand-red/20 text-brand-red border-brand-red/35 animate-pulse"
                        : "bg-neutral-900 text-gray-400 border-neutral-800"
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="disewa">Disewa</option>
                    <option value="selesai">Selesai</option>
                    <option value="telat">Telat</option>
                  </select>
                </div>

                {/* Details: Product, Date Range, Price */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 border-t border-neutral-950 pt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-300 truncate max-w-[130px]">{rent.productName}</span>
                    <span className="text-[9px] text-gray-500">{rent.quantity} Unit</span>
                  </div>
                  
                  <div className="flex flex-col gap-0.5 items-end">
                    <span className="font-extrabold text-brand-yellow text-xs">Rp {rent.totalPrice.toLocaleString("id-ID")}</span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      {rent.startDate.split("-").reverse().slice(0,2).join("/")} - {rent.endDate.split("-").reverse().slice(0,2).join("/")}
                    </span>
                  </div>
                </div>

                {/* Bottom line: WhatsApp phone, Quick Actions, Notes */}
                <div className="flex items-center justify-between border-t border-neutral-950/60 pt-2 mt-0.5">
                  <a
                    href={`https://wa.me/${rent.renterPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] text-brand-green font-bold flex items-center gap-1 hover:text-white transition-premium"
                  >
                    <PhoneCall className="w-3 h-3" />
                    {rent.renterPhone}
                  </a>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    {rent.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(rent.id, "disewa")}
                        title="Setujui Barang Keluar"
                        className="p-1 rounded-lg bg-brand-green/15 text-brand-green border border-brand-green/25 hover:bg-brand-green hover:text-white transition-premium cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    
                    {(rent.status === "disewa" || rent.status === "telat") && (
                      <button
                        onClick={() => handleUpdateStatus(rent.id, "selesai")}
                        title="Selesaikan Rental"
                        className="p-1 rounded-lg bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/25 hover:bg-brand-yellow hover:text-white transition-premium cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}

                    {rent.notes && (
                      <div 
                        title={rent.notes} 
                        className="p-1 rounded-lg bg-neutral-900 border border-neutral-850 text-gray-500 cursor-help"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
