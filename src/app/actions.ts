"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import * as db from "@/lib/db-service";

// Connection status
export async function getDbConnectionStatusAction() {
  return db.getDbConnectionStatus();
}

// Sync local cache to Google
export async function syncLocalToGoogleAction() {
  const res = await db.syncLocalToGoogle();
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/renters");
  revalidatePath("/admin/finance");
  return res;
}

// ------------------------------------------
// PRODUCTS ACTIONS
// ------------------------------------------
export async function getProductsAction() {
  return await db.getProducts();
}

export async function saveProductAction(product: db.Product) {
  await db.saveProduct(product);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${product.id}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function deleteProductAction(productId: string) {
  await db.deleteProduct(productId);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

// ------------------------------------------
// RENTALS ACTIONS
// ------------------------------------------
export async function getRentalsAction() {
  return await db.getRentals();
}

export async function saveRentalAction(rental: db.Rental) {
  await db.saveRental(rental);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${rental.productId}`);
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/renters");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

export async function saveRentalsAction(rentals: db.Rental[]) {
  await db.saveRentals(rentals);
  revalidatePath("/");
  revalidatePath("/catalog");
  for (const rental of rentals) {
    revalidatePath(`/catalog/${rental.productId}`);
  }
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/renters");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

export async function updateRentalStatusAction(rentalId: string, status: db.Rental["status"]) {
  await db.updateRentalStatus(rentalId, status);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/renters");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

// ------------------------------------------
// FINANCE ACTIONS
// ------------------------------------------
export async function getFinanceAction() {
  return await db.getFinance();
}

export async function saveFinanceEntryAction(entry: db.FinanceEntry) {
  await db.saveFinanceEntry(entry);
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

export async function deleteFinanceEntryAction(entryId: string) {
  await db.deleteFinanceEntry(entryId);
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
}

// ------------------------------------------
// CATEGORIES ACTIONS
// ------------------------------------------
export async function getCategoriesAction() {
  return await db.getCategories();
}

export async function saveCategoryAction(category: db.Category) {
  await db.saveCategory(category);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
}

export async function deleteCategoryAction(categoryId: string) {
  await db.deleteCategory(categoryId);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
}

// ------------------------------------------
// SETTINGS ACTIONS
// ------------------------------------------
export async function getSettingsAction() {
  return await db.getSettings();
}

export async function saveSettingsAction(settings: db.BasecampSettings) {
  await db.saveSettings(settings);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin");
}

// ------------------------------------------
// ADMIN AUTH ACTIONS
// ------------------------------------------
export async function loginAdminAction(email: string, pass: string) {
  const adminEmail = process.env.ADMIN_EMAIL || "sidentity32@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "noesantara123@";

  if (email === adminEmail && pass === adminPassword) {
    const msgUint8 = new TextEncoder().encode(adminEmail + adminPassword + "noesantara-salt-2026");
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const token = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Email atau Password Admin salah!" };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

// ------------------------------------------
// IMAGE UPLOAD ACTION
// ------------------------------------------
export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Tidak ada file yang diunggah" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename using timestamp
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return { success: true, url: publicUrl };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Gagal mengunggah file:", err);
    return { success: false, error: errMsg || "Gagal menyimpan file di server" };
  }
}

// ------------------------------------------
// TESTIMONIALS ACTIONS
// ------------------------------------------
export async function getTestimonialsAction() {
  return await db.getTestimonials();
}

export async function saveTestimonialAction(testimonial: db.Testimonial) {
  await db.saveTestimonial(testimonial);
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonialAction(testimonialId: string) {
  await db.deleteTestimonial(testimonialId);
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function resetFinanceJournalAction(pin: string) {
  const financePin = process.env.FINANCE_RESET_PIN || "211102";
  if (pin !== financePin) {
    return { success: false, error: "PIN Konfirmasi Salah!" };
  }
  try {
    await db.clearAllFinanceEntries();
    revalidatePath("/admin/finance");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Gagal mereset jurnal keuangan:", err);
    return { success: false, error: errMsg || "Gagal mengosongkan jurnal di database." };
  }
}

export async function deleteRentalsByPhoneAction(phone: string) {
  try {
    await db.deleteRentalsByPhone(phone);
    revalidatePath("/admin/renters");
    revalidatePath("/admin/rentals");
    revalidatePath("/admin/finance");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Gagal menghapus penyewa:", err);
    return { success: false, error: errMsg || "Gagal menghapus penyewa di database." };
  }
}



