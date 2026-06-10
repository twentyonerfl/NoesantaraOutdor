"use client";

import React, { useState, useEffect } from "react";
import {
  Layers, Plus, Trash2, Edit2, Loader2, Save, X, HelpCircle,
  Tent, Backpack, Shirt, Flame, Compass, Armchair
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCategoriesAction, saveCategoryAction, deleteCategoryAction
} from "@/app/actions";
import { Category } from "@/lib/db-service";
import ConfirmModal from "@/components/ConfirmModal";

// Icon mapping helper (mirroring public helper)
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "Tent": return <Tent className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />;
    case "Backpack": return <Backpack className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />;
    case "Shirt": return <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />;
    case "Flame": return <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />;
    case "Compass": return <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />;
    case "Armchair": return <Armchair className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />;
    default: return <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-brand-yellow" />;
  }
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Custom Confirm Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Category>({
    id: "",
    name: "",
    icon: "Tent",
    description: ""
  });

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategoriesAction();
        setCategories(data);
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: "",
      name: "",
      icon: "Tent",
      description: ""
    });
    setStatus(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (item: Category) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      icon: item.icon,
      description: item.description
    });
    setStatus(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setStatus({ type: "error", msg: "Semua kolom wajib diisi." });
      return;
    }

    setSaving(true);
    setStatus(null);

    // Auto-generate ID if adding new category
    let finalId = formData.id;
    if (!editingItem) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      finalId = `cat-${slug || Date.now()}`;
    }

    const payload: Category = {
      id: finalId,
      name: formData.name,
      icon: formData.icon,
      description: formData.description
    };

    try {
      await saveCategoryAction(payload);

      // Update local state
      if (editingItem) {
        setCategories((prev) => prev.map((c) => (c.id === editingItem.id ? payload : c)));
      } else {
        setCategories((prev) => [...prev, payload]);
      }

      setStatus({ type: "success", msg: "Kategori berhasil disimpan!" });
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Gagal menyimpan kategori ke database." });
    } finally {
      setSaving(false);
    }
  };

  // Trigger custom delete modal
  const handleDeleteTrigger = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Handle actual deletion after confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteCategoryAction(itemToDelete);
      setCategories((prev) => prev.filter((c) => c.id !== itemToDelete));
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
      alert("Gagal menghapus kategori.");
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-2 sm:gap-3">
            <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-brand-red" />
            Kategori Alat
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-500 font-light mt-1">
            Kelola pembagian kategori perlengkapan basecamp untuk memudahkan penyewa mencari alat outdoor.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_4px_14px_rgba(214,0,0,0.35)] transition-premium cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Main Categories Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-[#0a0a0a] border border-neutral-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <HelpCircle className="w-12 h-12 text-gray-700 animate-bounce" />
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">Belum Ada Kategori</h3>
            <p className="text-xs text-gray-500 font-light mt-1">Silakan tambahkan kategori perlengkapan pertama Anda.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#0a0a0a] border border-neutral-900 hover:border-neutral-800 rounded-2xl p-3 sm:p-5 flex flex-col justify-between transition-premium relative overflow-hidden group"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-14 h-14 sm:w-20 sm:h-20 bg-brand-red/5 rounded-full filter blur-xl group-hover:bg-brand-red/10 transition-premium" />

              <div>
                <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                  {/* Icon Frame */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-center">
                    {getCategoryIcon(cat.icon)}
                  </div>

                  {/* Category Slug / ID badge */}
                  <span className="text-[7px] sm:text-[10px] font-mono text-gray-500 bg-neutral-950 border border-neutral-900 px-1.5 py-0.5 rounded truncate max-w-[50px] sm:max-w-none">
                    {cat.id}
                  </span>
                </div>

                <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-brand-red transition-premium truncate">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 font-light mt-1 sm:mt-1.5 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 pt-2.5 mt-2.5 sm:pt-5 sm:mt-5 border-t border-neutral-950 z-10">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 text-[8px] sm:text-[10px] font-bold text-gray-400 hover:text-white transition-premium cursor-pointer"
                >
                  <Edit2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-brand-green" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTrigger(cat.id)}
                  className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-lg bg-red-950/10 hover:bg-brand-red border border-red-950/20 hover:border-brand-red text-brand-red hover:text-white transition-premium cursor-pointer"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Slide-Over Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-x-3 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-[#0a0a0a] border border-neutral-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 z-50 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-6">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
                    {editingItem ? <Edit2 className="w-5 h-5 text-brand-green" /> : <Plus className="w-5 h-5 text-brand-red" />}
                    {editingItem ? "Edit Kategori" : "Tambah Kategori"}
                  </h3>
                  <button
                    onClick={() => !saving && setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-neutral-900 text-gray-500 hover:text-white transition-premium"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Nama Kategori</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Tenda & Shelter"
                      required
                      disabled={saving}
                      className="w-full bg-neutral-950 border border-neutral-900 focus:border-brand-red px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-premium"
                    />
                  </div>

                  {/* Icon Selector Field */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Pilihan Ikon Visual</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      disabled={saving}
                      className="w-full bg-neutral-950 border border-neutral-900 focus:border-brand-red px-4 py-3 rounded-xl text-sm text-white focus:outline-none transition-premium cursor-pointer"
                    >
                      <option value="Tent">⛺ Tenda (Tent)</option>
                      <option value="Backpack">🎒 Tas Carrier (Backpack)</option>
                      <option value="Shirt">👕 Pakaian (Shirt)</option>
                      <option value="Flame">🔥 Alat Masak (Flame)</option>
                      <option value="Compass">🧭 Aksesoris (Compass)</option>
                      <option value="Armchair">🪑 Kursi (Armchair)</option>
                    </select>
                  </div>

                  {/* Description field */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Deskripsi Kategori</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tuliskan deskripsi singkat mengenai kategori alat ini..."
                      rows={3}
                      required
                      disabled={saving}
                      className="w-full bg-neutral-950 border border-neutral-900 focus:border-brand-red px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-premium resize-none"
                    />
                  </div>

                  {/* Feedback Status */}
                  {status && (
                    <div
                      className={`text-xs px-4 py-2.5 rounded-lg border leading-relaxed ${status.type === "success"
                          ? "bg-emerald-950/10 border-emerald-950/30 text-brand-green"
                          : "bg-red-950/10 border-red-950/30 text-brand-red"
                        }`}
                    >
                      {status.msg}
                    </div>
                  )}

                  {/* Submit / Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-900 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl border border-neutral-900 hover:border-neutral-800 text-xs font-bold text-gray-400 hover:text-white transition-premium cursor-pointer text-center"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(214,0,0,0.3)] transition-premium cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Simpan Kategori
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reusable Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori alat ini? Tindakan ini akan menghapus kategori secara permanen dari basis data."
        confirmText="Ya, Hapus Kategori"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
