"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Edit3, Trash2, ShieldCheck, X, 
  AlertTriangle, Image as ImageIcon, Sparkles, Upload, Loader2, Camera 
} from "lucide-react";
import { getProductsAction, saveProductAction, deleteProductAction, uploadImageAction } from "@/app/actions";
import { Product } from "@/lib/db-service";

import ConfirmModal from "@/components/ConfirmModal";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Confirm Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tenda");
  const [pricePerDay, setPricePerDay] = useState(0);
  const [stock, setStock] = useState(1);
  const [availableStock, setAvailableStock] = useState(1);
  const [status, setStatus] = useState<Product["status"]>("Ready");
  const [imageUrls, setImageUrls] = useState("");
  const [description, setDescription] = useState("");
  const [featuresStr, setFeaturesStr] = useState("");

  // Upload States and Handlers
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        const currentList = imageUrls.trim();
        const separator = currentList ? ", " : "";
        setImageUrls(currentList + separator + res.url);
      } else {
        alert(res.error || "Gagal mengunggah gambar.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat mengunggah.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    const activeList = imageUrls.split(",").map(s => s.trim()).filter(Boolean);
    const updatedList = activeList.filter((_, i) => i !== indexToRemove);
    setImageUrls(updatedList.join(", "));
  };

  const categories = ["Tenda", "Carrier", "Apparel", "Masak", "Accessories"];

  async function loadProducts() {
    try {
      const data = await getProductsAction();
      setProducts(data);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadProducts();
    }, 0);
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setCategory("Tenda");
    setPricePerDay(15000);
    setStock(5);
    setAvailableStock(5);
    setStatus("Ready");
    setImageUrls("https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop");
    setDescription("");
    setFeaturesStr("");
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setCategory(prod.category);
    setPricePerDay(prod.pricePerDay);
    setStock(prod.stock);
    setAvailableStock(prod.availableStock);
    setStatus(prod.status);
    setImageUrls(prod.images.join(", "));
    setDescription(prod.description);
    setFeaturesStr(prod.features.join("; "));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prodId = editingId || `prod-${Date.now()}`;
      
      // Parse images (comma-separated)
      const images = imageUrls
        .split(",")
        .map((s) => s.trim())
        .filter((s) => !!s);
        
      // Parse features (semicolon-separated)
      const features = featuresStr
        .split(";")
        .map((s) => s.trim())
        .filter((s) => !!s);

      const savedProduct: Product = {
        id: prodId,
        name,
        category,
        pricePerDay: Number(pricePerDay) || 0,
        stock: Number(stock) || 1,
        availableStock: Number(availableStock) || 1,
        status,
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop"],
        description,
        features
      };

      await saveProductAction(savedProduct);
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error("Gagal menyimpan produk:", err);
    }
  };

  const requestDelete = (prodId: string) => {
    setItemToDelete(prodId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductAction(itemToDelete);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      loadProducts();
    } catch (err) {
      console.error("Gagal menghapus produk:", err);
      alert("Gagal menghapus produk.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-brand-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Kelola Perlengkapan</h1>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-light">
            Tambah, edit, atau hapus inventaris peralatan outdoor Noesantara.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(214,0,0,0.3)] transition-premium cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Alat Baru
        </button>
      </div>

      {/* Products list card & table wrapper */}
      <div className="glassmorphism rounded-2xl overflow-hidden border border-neutral-900 shadow-2xl">
        {/* Desktop Table View (MD & Up) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 bg-neutral-950/50 text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                <th className="p-4 pl-6">Foto & Nama</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga/Hari</th>
                <th className="p-4">Stok (Ready/Total)</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-neutral-950/30 transition-premium">
                  {/* Photo & Name */}
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0 border border-neutral-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-white text-sm truncate max-w-xs">{prod.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.id}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 font-semibold text-gray-300">{prod.category}</td>

                  {/* Price */}
                  <td className="p-4 font-extrabold text-brand-yellow">
                    Rp {prod.pricePerDay.toLocaleString("id-ID")}
                  </td>

                  {/* Stock count */}
                  <td className="p-4 text-gray-400 font-bold">
                    <span className="text-brand-green">{prod.availableStock}</span>
                    <span className="text-gray-600 font-normal"> / {prod.stock}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      prod.status === "Ready"
                        ? "bg-brand-green/20 text-brand-green"
                        : prod.status === "Disewa"
                        ? "bg-brand-red/20 text-brand-red"
                        : "bg-brand-yellow/20 text-brand-yellow"
                    }`}>
                      {prod.status}
                    </span>
                  </td>

                  {/* Actions column */}
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        title="Edit Alat"
                        className="p-2 rounded-lg bg-neutral-900 border border-neutral-850 text-gray-400 hover:text-white hover:border-neutral-700 transition-premium"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => requestDelete(prod.id)}
                        title="Hapus Alat"
                        className="p-2 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-premium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Hidden on MD & Up) */}
        <div className="md:hidden flex flex-col divide-y divide-neutral-900">
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">
              Belum ada inventaris perlengkapan terdaftar.
            </div>
          ) : (
            products.map((prod) => (
              <div key={prod.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-950/20 transition-premium">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0 border border-neutral-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-white text-xs truncate max-w-[150px]">{prod.name}</span>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-gray-400 font-bold">{prod.category}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-850" />
                      <span className="text-[9px] text-brand-yellow font-extrabold">Rp {prod.pricePerDay.toLocaleString("id-ID")}/hari</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-gray-500">Stok:</span>
                      <span className="text-[9px] text-brand-green font-bold">{prod.availableStock}</span>
                      <span className="text-[9px] text-gray-600 font-normal">/ {prod.stock}</span>
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${
                        prod.status === "Ready"
                          ? "bg-brand-green/15 text-brand-green"
                          : prod.status === "Disewa"
                          ? "bg-brand-red/15 text-brand-red border border-brand-red/25"
                          : "bg-brand-yellow/15 text-brand-yellow"
                      }`}>
                        {prod.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions column */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(prod)}
                    title="Edit Alat"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-850 text-gray-400 hover:text-white transition-premium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-green" />
                  </button>
                  <button
                    onClick={() => requestDelete(prod.id)}
                    title="Hapus Alat"
                    className="p-2 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-premium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          {/* Form Container */}
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-850 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest block leading-none">Form Inventaris</span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  {editingId ? "Edit Perlengkapan" : "Tambah Perlengkapan Baru"}
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
            <form onSubmit={handleSave} className="flex flex-col gap-5 text-xs">
              
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-widest">Nama Alat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tenda Arei Outpost 4P"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white placeholder-gray-600 focus:outline-none focus:border-brand-red transition-premium font-medium"
                />
              </div>

              {/* Row 2: Category, Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase tracking-widest">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase tracking-widest">Harga Sewa / Hari (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 35000"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                  />
                </div>
              </div>

              {/* Row 3: Stock, Available Stock, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase tracking-widest">Total Stok Alat</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase tracking-widest">Stok Ready Sekarang</label>
                  <input
                    type="number"
                    required
                    value={availableStock}
                    onChange={(e) => setAvailableStock(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase tracking-widest">Status Fisik</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Product["status"])}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                  >
                    <option value="Ready">Ready</option>
                    <option value="Disewa">Disewa</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Image upload and Thumbnail list */}
              <div className="flex flex-col gap-3">
                <label className="font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-yellow" />
                  Foto Alat & Upload Gambar
                </label>
                
                {/* 1. Drag & Drop or Button uploader */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative border-2 border-dashed border-neutral-800 hover:border-brand-red rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-neutral-900/40 transition-premium group min-h-[110px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-brand-red animate-spin" />
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Mengunggah file...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-gray-400 group-hover:text-white transition-premium">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-gray-400 group-hover:text-white font-bold uppercase tracking-wider">Klik / Tarik File Gambar</span>
                        <span className="text-[9px] text-gray-600">Mendukung JPG, PNG, WEBP (Max 5MB)</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 justify-center">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Atau Tempel URL Gambar</label>
                    <input
                      type="text"
                      placeholder="Pake URL langsung dari Unsplash / CDN lainnya"
                      value={imageUrls}
                      onChange={(e) => setImageUrls(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-mono text-[10px]"
                    />
                    <span className="text-[9px] text-gray-650 leading-normal">
                      Bisa multi-foto. Pisahkan link dengan karakter koma (,).
                    </span>
                  </div>
                </div>

                {/* 2. Visual Previews Grid */}
                {imageUrls.split(",").map(s => s.trim()).filter(Boolean).length > 0 && (
                  <div className="space-y-2 mt-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block pl-1">Gambar Terlampir ({imageUrls.split(",").map(s => s.trim()).filter(Boolean).length}):</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-3 bg-neutral-950 rounded-2xl border border-neutral-900">
                      {imageUrls.split(",").map(s => s.trim()).filter(Boolean).map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-850 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute inset-0 bg-brand-red/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-premium text-white font-bold cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rich Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-widest">Deskripsi Perlengkapan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ceritakan kelebihan dan kegunaan perlengkapan ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                />
              </div>

              {/* Features Semicolon Separated */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                  Fitur Ungkulan (Pisahkan dengan titik koma &ldquo;;&rdquo;)
                </label>
                <input
                  type="text"
                  placeholder="Kapasitas 4 Orang; Double Layer Waterproof; Frame Aluminum"
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-850 text-white focus:outline-none focus:border-brand-red transition-premium font-medium"
                />
              </div>

              {/* Submit Buttons */}
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
                  className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,122,61,0.3)] transition-premium"
                >
                  <ShieldCheck className="w-4 h-4" /> Simpan Data Alat
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
        title="Hapus Perlengkapan"
        message="Apakah Anda yakin ingin menghapus perlengkapan ini dari database? Data inventaris alat ini akan dihapus secara permanen."
        isLoading={isDeleting}
      />
    </div>
  );
}
