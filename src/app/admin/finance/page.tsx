"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, ShieldCheck, X, TrendingUp, TrendingDown, 
  Wallet, Trash2, RotateCw, DollarSign, Calendar 
} from "lucide-react";
import { getFinanceAction, saveFinanceEntryAction, deleteFinanceEntryAction } from "@/app/actions";
import { FinanceEntry } from "@/lib/db-service";

import ConfirmModal from "@/components/ConfirmModal";

export default function AdminFinance() {
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [category, setCategory] = useState("Sewa Alat");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // Custom Confirm Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = {
    pemasukan: ["Sewa Alat", "Denda Telat", "Penjualan Gear Bekas", "Lain-lain"],
    pengeluaran: ["Pembelian Alat Baru", "Maintenance & Laundry", "Gaji Staff", "Listrik & Internet", "Operasional Basecamp", "Lain-lain"]
  };

  async function loadFinance() {
    try {
      const data = await getFinanceAction();
      setFinance(data);
    } catch (err) {
      console.error("Gagal memuat keuangan:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadFinance();
      setDate(new Date().toISOString().split("T")[0]);
    }, 0);
  }, []);

  const openAddModal = (entryType: "pemasukan" | "pengeluaran") => {
    setType(entryType);
    setCategory(entryType === "pemasukan" ? "Sewa Alat" : "Maintenance & Laundry");
    setAmount(10000);
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const entryId = `fin-${Date.now()}`;
      const newEntry: FinanceEntry = {
        id: entryId,
        date,
        type,
        category,
        amount: Number(amount) || 0,
        description
      };

      await saveFinanceEntryAction(newEntry);
      setIsModalOpen(false);
      loadFinance();
    } catch (err) {
      console.error("Gagal menyimpan transaksi keuangan:", err);
    }
  };

  const requestDelete = (entryId: string) => {
    setItemToDelete(entryId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFinanceEntryAction(itemToDelete);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      loadFinance();
    } catch (err) {
      console.error("Gagal menghapus transaksi keuangan:", err);
      alert("Gagal menghapus catatan keuangan.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <RotateCw className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    );
  }

  // Mathematics
  const totalPemasukan = finance
    .filter((f) => f.type === "pemasukan")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPengeluaran = finance
    .filter((f) => f.type === "pengeluaran")
    .reduce((sum, f) => sum + f.amount, 0);

  const saldoBersih = totalPemasukan - totalPengeluaran;

  const reversedLogs = [...finance].reverse();

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Laporan Keuangan</h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-light">
            Catat pengeluaran basecamp, catat pemasukan manual, dan pantau saldo bersih Noesantara.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => openAddModal("pengeluaran")}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-brand-red/30 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-premium cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Pengeluaran
          </button>
          <button
            onClick={() => openAddModal("pemasukan")}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-premium cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Pemasukan
          </button>
        </div>
      </div>

      {/* Cashflow Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-6">
        
        {/* Pemasukan Card */}
        <div className="glassmorphism rounded-2xl p-3.5 sm:p-5 border border-neutral-900 flex items-center justify-between">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block leading-none truncate">Total Pemasukan</span>
            <span className="text-sm sm:text-xl font-black text-brand-green mt-0.5 sm:mt-1 block truncate">
              Rp {totalPemasukan.toLocaleString("id-ID")}
            </span>
            <span className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1">Sewa & Lain</span>
          </div>
          <div className="w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-xl bg-[#007A3D]/10 border border-[#007A3D]/20 flex-shrink-0 flex items-center justify-center text-brand-green">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Pengeluaran Card */}
        <div className="glassmorphism rounded-2xl p-3.5 sm:p-5 border border-neutral-900 flex items-center justify-between">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block leading-none truncate">Total Pengeluaran</span>
            <span className="text-sm sm:text-xl font-black text-brand-red mt-0.5 sm:mt-1 block truncate">
              Rp {totalPengeluaran.toLocaleString("id-ID")}
            </span>
            <span className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1 font-light">Belanja & Ops</span>
          </div>
          <div className="w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-xl bg-brand-red/10 border border-brand-red/20 flex-shrink-0 flex items-center justify-center text-brand-red">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Saldo Bersih Card */}
        <div className="glassmorphism rounded-2xl p-3.5 sm:p-5 border border-neutral-900 flex items-center justify-between col-span-2 sm:col-span-1">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block leading-none truncate">Kas / Saldo Bersih</span>
            <span className={`text-sm sm:text-xl font-black mt-0.5 sm:mt-1 block truncate ${saldoBersih >= 0 ? "text-brand-yellow" : "text-brand-red"}`}>
              Rp {saldoBersih.toLocaleString("id-ID")}
            </span>
            <span className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1">Net Balance</span>
          </div>
          <div className="w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-xl bg-neutral-950 border border-neutral-900 flex-shrink-0 flex items-center justify-center text-white">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

      </div>

      {/* Transactions List */}
      <div className="glassmorphism rounded-2xl overflow-hidden border border-neutral-900 shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-neutral-900">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Jurnal Transaksi Arus Kas</h3>
        </div>
        
        {/* Desktop Table View (MD & Up) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/50 text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                <th className="p-4 pl-6">Tanggal</th>
                <th className="p-4">Tipe</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4">Nominal</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {reversedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    Belum ada transaksi arus kas terdaftar.
                  </td>
                </tr>
              ) : (
                reversedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-950/30 transition-premium">
                    
                    {/* Date */}
                    <td className="p-4 pl-6 font-medium text-gray-400">
                      {log.date.split("-").reverse().join("-")}
                    </td>

                    {/* Type badge */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        log.type === "pemasukan" 
                          ? "bg-brand-green/20 text-brand-green" 
                          : "bg-brand-red/20 text-brand-red"
                      }`}>
                        {log.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-semibold text-gray-300">
                      {log.category}
                    </td>

                    {/* Description */}
                    <td className="p-4 font-light text-gray-400 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>

                    {/* Amount */}
                    <td className={`p-4 font-extrabold ${log.type === "pemasukan" ? "text-brand-green" : "text-brand-red"}`}>
                      {log.type === "pemasukan" ? "+" : "-"} Rp {log.amount.toLocaleString("id-ID")}
                    </td>

                    {/* Delete action */}
                    <td className="p-4 pr-6 text-right">
                      {log.id.startsWith("fin-auto-") ? (
                        <span className="text-[9px] text-gray-600 font-bold italic select-none">Auto-Generated</span>
                      ) : (
                        <button
                          onClick={() => requestDelete(log.id)}
                          title="Hapus Catatan"
                          className="p-1.5 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-premium cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Hidden on MD & Up) */}
        <div className="md:hidden flex flex-col divide-y divide-neutral-900">
          {reversedLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic text-xs">
              Belum ada transaksi arus kas terdaftar.
            </div>
          ) : (
            reversedLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex flex-col gap-2 hover:bg-neutral-950/20 transition-premium">
                {/* Header line: Category and Type badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-white text-xs truncate">{log.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    log.type === "pemasukan" 
                      ? "bg-brand-green/15 text-brand-green" 
                      : "bg-brand-red/15 text-brand-red border border-brand-red/25"
                  }`}>
                    {log.type}
                  </span>
                </div>

                {/* Body line: Description */}
                {log.description && (
                  <p className="text-[10px] text-gray-400 font-light mt-0.5 line-clamp-2 leading-relaxed">
                    {log.description}
                  </p>
                )}

                {/* Footer line: Date, Amount, Delete button */}
                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-neutral-950/60">
                  <span className="text-[9px] text-gray-500 font-mono">
                    {log.date.split("-").reverse().join("-")}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-xs ${log.type === "pemasukan" ? "text-brand-green" : "text-brand-red"}`}>
                      {log.type === "pemasukan" ? "+" : "-"} Rp {log.amount.toLocaleString("id-ID")}
                    </span>

                    {/* Delete button or Auto label */}
                    {log.id.startsWith("fin-auto-") ? (
                      <span className="text-[8px] text-gray-600 font-bold italic select-none">Auto</span>
                    ) : (
                      <button
                        onClick={() => requestDelete(log.id)}
                        title="Hapus Catatan"
                        className="p-1 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-premium cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Input Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-850 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest block leading-none">Pembukuan Manual</span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Catat {type === "pemasukan" ? "Pemasukan Baru" : "Pengeluaran Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-900 text-gray-400 hover:text-white transition-premium"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
              
              {/* Row 1: Date */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-red" />
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                />
              </div>

              {/* Row 2: Category, Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase tracking-widest">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                  >
                    {categories[type].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-brand-yellow" />
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-widest">Keterangan Transaksi</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Belanja frame aluminum tenda arei 4 pcs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                />
              </div>

              {/* Action trigger buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-900 transition-premium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition-premium ${
                    type === "pemasukan" 
                      ? "bg-brand-green hover:bg-brand-green-hover shadow-[0_4px_14px_rgba(0,122,61,0.3)]" 
                      : "bg-brand-red hover:bg-brand-red-hover shadow-[0_4px_14px_rgba(214,0,0,0.3)]"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" /> Simpan Transaksi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Catatan Keuangan"
        message="Apakah Anda yakin ingin menghapus catatan keuangan ini? Catatan ini akan dihapus secara permanen dari pembukuan."
        isLoading={isDeleting}
      />
    </div>
  );
}
