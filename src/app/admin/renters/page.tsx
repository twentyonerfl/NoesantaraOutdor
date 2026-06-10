"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, PhoneCall, MapPin, Send, MessageCircle, RotateCw, Trash2, Loader2 } from "lucide-react";
import { getRentalsAction, deleteRentalsByPhoneAction } from "@/app/actions";
import { Rental } from "@/lib/db-service";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminRenters() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renterToDelete, setRenterToDelete] = useState<{ name: string; phone: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getRentalsAction();
        setRentals(data);
      } catch (err) {
        console.error("Gagal memuat penyewa:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <RotateCw className="w-8 h-8 text-brand-red animate-spin" />
      </div>
    );
  }

  // De-duplicate renters by phone number to create a clean customer directory
  const rentersMap: { [phone: string]: { name: string; address: string; phone: string; rentalsCount: number; lastItem: string; lastDate: string; social?: string } } = {};

  rentals.forEach((r) => {
    if (!rentersMap[r.renterPhone]) {
      rentersMap[r.renterPhone] = {
        name: r.renterName,
        address: r.renterAddress,
        phone: r.renterPhone,
        rentalsCount: 0,
        lastItem: r.productName,
        lastDate: r.startDate,
        social: r.renterSocial || ""
      };
    }
    rentersMap[r.renterPhone].rentalsCount += 1;
  });

  const uniqueRenters = Object.values(rentersMap);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Direktori Penyewa</h1>
        <p className="text-xs text-gray-400 mt-1 font-light">
          Lihat database pelanggan, alamat, dan hubungi penyewa secara instan via WhatsApp.
        </p>
      </div>

      {/* Grid listing renters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueRenters.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 italic glassmorphism rounded-2xl">
            Belum ada penyewa terdaftar dalam database.
          </div>
        ) : (
          uniqueRenters.map((renter) => (
            <div
              key={renter.phone}
              className="glassmorphism rounded-2xl p-5 border border-neutral-900 flex flex-col justify-between gap-5 hover:border-neutral-800 transition-premium group shadow-lg"
            >
              <div className="flex flex-col gap-3">
                {/* Renter Title */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-900 flex items-center justify-center text-brand-green group-hover:text-white group-hover:bg-brand-green transition-premium">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base leading-snug">{renter.name}</h3>
                      <span className="text-[10px] text-gray-500 block">Pelanggan Aktif</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRenterToDelete({ name: renter.name, phone: renter.phone });
                      setShowDeleteModal(true);
                    }}
                    className="w-8 h-8 rounded-xl bg-red-950/10 border border-red-950/30 hover:bg-brand-red text-brand-red hover:text-white flex items-center justify-center transition-premium cursor-pointer flex-shrink-0"
                    title="Hapus Penyewa beserta riwayat sewa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info block */}
                <div className="flex flex-col gap-2 text-xs text-gray-400 pt-3 border-t border-neutral-900/60 mt-1 font-light">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{renter.address}</span>
                  </div>
                  {renter.social && (
                    <div className="flex items-center gap-2.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red text-[9px] font-bold">
                        Medsos: {renter.social}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 mt-1 text-[10px] font-semibold text-gray-500">
                    <span>Sewa Terakhir:</span>
                    <span className="text-brand-yellow font-bold">{renter.lastItem}</span>
                  </div>
                </div>
              </div>

              {/* Action WhatsApp connector */}
              <div className="flex items-center justify-between border-t border-neutral-900/60 pt-4 mt-auto">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                  Total Order: <span className="text-white font-black">{renter.rentalsCount}x</span>
                </span>

                <a
                  href={`https://wa.me/${renter.phone}?text=${encodeURIComponent(`Halo ${renter.name}, kami dari basecamp Noesantara Outdoor ingin menyapa Anda...`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white border border-brand-green/20 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-premium"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Hubungi WA
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Konfirmasi Hapus Penyewa */}
      <AnimatePresence>
        {showDeleteModal && renterToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!deleting) {
                  setShowDeleteModal(false);
                  setRenterToDelete(null);
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

              {/* Warning Icon */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">Hapus Penyewa?</h3>
              <p className="text-[10px] sm:text-xs text-gray-400 font-light mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus pelanggan <strong className="text-white">{renterToDelete.name}</strong>? Seluruh catatan transaksi sewa untuk nomor telepon <span className="font-mono text-brand-yellow font-bold">{renterToDelete.phone}</span> akan dihapus secara permanen.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {/* Cancel Button */}
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRenterToDelete(null);
                  }}
                  className="py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-900 text-xs font-bold text-gray-400 hover:text-white transition-premium cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>

                {/* Confirm Delete Button */}
                <button
                  type="button"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      const res = await deleteRentalsByPhoneAction(renterToDelete.phone);
                      if (res.success) {
                        setRentals((prev) => prev.filter((r) => r.renterPhone !== renterToDelete.phone));
                        setShowDeleteModal(false);
                        setRenterToDelete(null);
                      } else {
                        alert(res.error || "Gagal menghapus penyewa.");
                      }
                                        } catch (e) {
                      const errMsg = e instanceof Error ? e.message : String(e);
                      alert(errMsg);
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  className="py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(214,0,0,0.3)] hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:-translate-y-0 flex items-center justify-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
