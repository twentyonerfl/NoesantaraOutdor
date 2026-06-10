"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare, Star, Plus, Trash2, Edit2, Loader2, Save, X, Upload, CheckCircle2, User, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTestimonialsAction, saveTestimonialAction, deleteTestimonialAction, uploadImageAction
} from "@/app/actions";
import { Testimonial } from "@/lib/db-service";

import ConfirmModal from "@/components/ConfirmModal";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Custom Confirm Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Omit<Testimonial, "id">>({
    name: "",
    role: "",
    text: "",
    rating: 5,
    avatar: ""
  });

  const [uploading, setUploading] = useState(false);

  // Fetch testimonials on mount
  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await getTestimonialsAction();
        setTestimonials(data);
      } catch (err) {
        console.error("Gagal memuat testimoni:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      role: "",
      text: "",
      rating: 5,
      avatar: ""
    });
    setStatus(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      text: item.text,
      rating: item.rating,
      avatar: item.avatar || ""
    });
    setStatus(null);
    setIsOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await uploadImageAction(uploadData);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, avatar: res.url }));
      } else {
        alert(res.error || "Gagal mengunggah gambar.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const requestDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeletingId(itemToDelete);
    try {
      await deleteTestimonialAction(itemToDelete);
      setTestimonials((prev) => prev.filter((t) => t.id !== itemToDelete));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus testimoni.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    if (!formData.name.trim() || !formData.role.trim() || !formData.text.trim()) {
      setStatus({ type: "error", msg: "Nama, Peran, dan Isi Testimoni wajib diisi." });
      setSaving(false);
      return;
    }

    const payload: Testimonial = {
      id: editingItem?.id || `t-${Date.now()}`,
      ...formData
    };

    try {
      await saveTestimonialAction(payload);

      // Update local state
      setTestimonials((prev) => {
        const index = prev.findIndex((t) => t.id === payload.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = payload;
          return updated;
        } else {
          return [...prev, payload];
        }
      });

      setStatus({ type: "success", msg: "Testimoni berhasil disimpan!" });
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Gagal menyimpan testimoni ke database." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 bg-[#0a0a0a] border border-neutral-900 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[32px]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-brand-red" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase text-white tracking-wider">Kelola Testimoni</h2>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 font-light max-w-xl leading-relaxed">
            Kelola ulasan dan suara pendaki yang ditampilkan pada beranda website utama Anda. Anda dapat menambah, mengedit, atau menghapus ulasan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-premium flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(214,0,0,0.3)] hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Testimoni
        </button>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
          <span className="text-xs text-gray-500 font-light">Memuat daftar testimoni...</span>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 bg-neutral-950/40 border border-neutral-900 rounded-[32px] space-y-3">
          <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Belum Ada Testimoni</h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto font-light">
            Klik tombol &quot;Tambah Testimoni&quot; di atas untuk memasukkan ulasan pelanggan Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="flex flex-col justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-neutral-950/80 border border-neutral-900/80 hover:border-neutral-800 transition-premium relative group hover:-translate-y-1 hover:shadow-2xl"
            >
              <div>
                {/* Header card: Stars rating and actions buttons */}
                <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${star <= item.rating
                          ? "fill-brand-yellow text-brand-yellow"
                          : "text-neutral-850"
                          }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-premium">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 rounded-lg border border-neutral-850 hover:border-neutral-700 bg-neutral-950 text-gray-400 hover:text-white transition-premium cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => requestDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1 rounded-lg border border-red-950/40 bg-red-950/10 text-brand-red hover:bg-brand-red hover:text-white transition-premium cursor-pointer disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-light italic line-clamp-4 sm:line-clamp-none">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Bottom user profile card */}
              <div className="flex items-center gap-2.5 mt-4 pt-3 sm:mt-6 sm:pt-4 border-t border-neutral-900/60">
                {item.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-neutral-850"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-gray-500">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-white text-[11px] sm:text-xs tracking-wide">{item.name}</h4>
                  <p className="text-[8px] sm:text-[9px] font-bold text-brand-green uppercase tracking-wider">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#0a0a0a] border border-neutral-900 rounded-[32px] p-6 md:p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-6">
                <h3 className="text-md font-black uppercase text-white tracking-wider">
                  {editingItem ? "Edit Testimoni" : "Tambah Testimoni Baru"}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-900 text-gray-500 hover:text-white transition-premium cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Alert */}
              {status && (
                <div
                  className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${status.type === "success"
                    ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                    : "bg-brand-red/10 border-brand-red/20 text-brand-red"
                    }`}
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-medium leading-normal">{status.msg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Contoh: Rian Hidayat"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs text-white focus:outline-none focus:border-brand-red transition-premium font-light"
                    />
                  </div>

                  {/* Role field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Asal
                    </label>
                    <input
                      type="text"
                      name="role"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                      placeholder="asal"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs text-white focus:outline-none focus:border-brand-red transition-premium font-light"
                    />
                  </div>
                </div>

                {/* Rating selection (Stars) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Penilaian (Rating)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                        className="p-1 rounded-md bg-neutral-950 border border-neutral-850/60 text-gray-500 hover:text-brand-yellow transition-premium cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${star <= formData.rating
                            ? "fill-brand-yellow text-brand-yellow"
                            : "text-gray-700"
                            }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-gray-500 ml-2 font-medium">{formData.rating} dari 5 Bintang</span>
                  </div>
                </div>

                {/* Testimonial Text */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Ulasan / Testimoni
                  </label>
                  <textarea
                    name="text"
                    required
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                    placeholder="Tuliskan ulasan pelanggan mengenai kualitas barang sewaan, pelayanan admin, dll..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs text-white focus:outline-none focus:border-brand-red transition-premium font-light leading-relaxed resize-none"
                  />
                </div>

                {/* Avatar field with Upload Support */}
                <div className="space-y-2 pt-2 border-t border-neutral-900">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Foto Profil Avatar (Opsional)
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Avatar Preview */}
                    {formData.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.avatar}
                        alt="Avatar Preview"
                        className="w-12 h-12 rounded-full object-cover border border-neutral-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center text-gray-650">
                        <User className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        name="avatar"
                        value={formData.avatar}
                        onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                        placeholder="Link URL foto atau upload file di samping..."
                        className="w-full px-4 py-2 rounded-lg bg-neutral-950 border border-neutral-850 text-[11px] text-white focus:outline-none focus:border-brand-red transition-premium font-light"
                      />

                      {/* Upload Button */}
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-850 bg-neutral-950 hover:bg-neutral-900 text-[10px] text-gray-300 font-bold uppercase tracking-wider transition-premium cursor-pointer">
                        {uploading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-brand-red" />
                            Mengunggah...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 text-brand-red" />
                            Upload Gambar
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-900">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-neutral-850 hover:bg-neutral-900/60 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-premium cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="px-6 py-2.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold uppercase tracking-wider transition-premium disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(214,0,0,0.3)]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Testimoni
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => !deletingId && setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Testimoni"
        message="Apakah Anda yakin ingin menghapus testimoni ini? Ulasan pelanggan ini akan dihapus permanen dari beranda utama."
        isLoading={deletingId !== null}
      />
    </div>
  );
}
