import fs from "fs";
import path from "path";
import { google } from "googleapis";

// TypeScript interfaces
export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  stock: number;
  availableStock: number;
  status: "Ready" | "Disewa" | "Maintenance";
  images: string[];
  description: string;
  features: string[];
}

export interface Rental {
  id: string;
  renterName: string;
  renterPhone: string;
  renterAddress: string;
  productId: string;
  productName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "disewa" | "selesai" | "telat";
  notes: string;
  renterSocial?: string;
}

export interface FinanceEntry {
  id: string;
  date: string;
  type: "pemasukan" | "pengeluaran";
  category: string;
  amount: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface BasecampSettings {
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  cleanWarranty: string;
  gmapsEmbedUrl: string;
  latitude?: number;
  longitude?: number;
  mapIcon?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar?: string;
}

export interface FullDatabase {
  products: Product[];
  rentals: Rental[];
  finance: FinanceEntry[];
  categories: Category[];
  settings: BasecampSettings;
  testimonials?: Testimonial[];
}

// Config variables
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID?.replace(/^["']|["']$/g, "");
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL?.replace(/^["']|["']$/g, "");
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/^["']|["']$/g, "");

const LOCAL_DB_PATH = path.join(process.cwd(), "src/data/db.json");

// Helper to determine if Google Sheets is configured
export function getDbConnectionStatus() {
  const configured = !!(SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);
  if (!configured) {
    return {
      mode: "local" as const,
      connected: false,
      message: "Menggunakan database lokal (Kredensial Google Sheets belum dikonfigurasi di .env)",
    };
  }
  return {
    mode: "google" as const,
    connected: true,
    message: "Terhubung ke Google Spreadsheet secara realtime!",
    spreadsheetId: SPREADSHEET_ID,
  };
}

// Get Google Sheets client
function getSheetsClient() {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Sheets credentials are not configured");
  }

  // Format private key (replace literal \n with actual newlines)
  const formattedKey = PRIVATE_KEY.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

// ==========================================
// CORE READ & WRITE ROUTINES
// ==========================================

const defaultSettings: BasecampSettings = {
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

const defaultTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Rian Hidayat",
    role: "Pendaki Santai",
    text: "Sewa tenda Naturehike di sini bener-bener mantap. Barangnya bersih banget, wangi, pasak lengkap dan framenya masih kokoh. Adminnya juga ramah banget ngasih tips packing gunung.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: "t2",
    name: "Siti Sarah",
    role: "Backpacker Wanita",
    text: "Carrier Osprey Atmos 50-nya juara! Bahannya terawat dan backsystem-nya masih berfungsi 100%. Gak bikin sakit pundak selama daki Merbabu. Proses rentalnya juga cepat banget lewat WA.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: "t3",
    name: "Farhan Mahendra",
    role: "Survival Enthusiast",
    text: "Set nesting kompor windproof-nya sangat membantu pas summit attack yang berangin kencang di Slamet. Kualitas barang sewaan di Noesantara bener-bener setara brand outdoor premium luar negeri.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop"
  }
];

// 1. Read Local JSON
function readLocalDb(): FullDatabase {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const defaultDb: FullDatabase = { 
        products: [], 
        rentals: [], 
        finance: [], 
        categories: [],
        settings: defaultSettings,
        testimonials: defaultTestimonials
      };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const rawData = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    const parsed = JSON.parse(rawData);
    
    // Ensure settings exists
    if (!parsed.settings) {
      parsed.settings = defaultSettings;
    } else {
      if (parsed.settings.latitude === undefined) parsed.settings.latitude = defaultSettings.latitude;
      if (parsed.settings.longitude === undefined) parsed.settings.longitude = defaultSettings.longitude;
      if (parsed.settings.mapIcon === undefined) parsed.settings.mapIcon = defaultSettings.mapIcon;
    }

    // Ensure testimonials exists
    if (!parsed.testimonials || parsed.testimonials.length === 0) {
      parsed.testimonials = defaultTestimonials;
    }

    return parsed;
  } catch (err) {
    console.error("Gagal membaca database lokal:", err);
    return { 
      products: [], 
      rentals: [], 
      finance: [], 
      categories: [],
      settings: defaultSettings,
      testimonials: defaultTestimonials
    };
  }
}

// 2. Write Local JSON
function writeLocalDb(db: FullDatabase): void {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Gagal menulis database lokal:", err);
  }
}

// 3. Read Google Spreadsheet
async function readGoogleDb(): Promise<FullDatabase | null> {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = SPREADSHEET_ID!;

    // Fetch values from all tabs in parallel
    const [productsRes, rentalsRes, financeRes, categoriesRes, settingsRes, testimonialsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: "products!A:J" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "rentals!A:M" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "finance!A:F" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "categories!A:D" }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "settings!A:B" }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: "testimonials!A:F" }).catch(() => ({ data: { values: null } })),
    ]);

    // Parse products (Header: id, name, category, pricePerDay, stock, availableStock, status, images, description, features)
    const products: Product[] = (productsRes.data.values || []).slice(1).map((row) => ({
      id: row[0] || "",
      name: row[1] || "",
      category: row[2] || "",
      pricePerDay: Number(row[3]) || 0,
      stock: Number(row[4]) || 0,
      availableStock: Number(row[5]) || 0,
      status: (row[6] as Product["status"]) || "Ready",
      images: row[7] ? row[7].split(",").map((s: string) => s.trim()) : [],
      description: row[8] || "",
      features: row[9] ? row[9].split(";").map((s: string) => s.trim()) : [],
    }));

    // Parse rentals (Header: id, renterName, renterPhone, renterAddress, productId, productName, quantity, startDate, endDate, totalPrice, status, notes, renterSocial)
    const rentals: Rental[] = (rentalsRes.data.values || []).slice(1).map((row) => ({
      id: row[0] || "",
      renterName: row[1] || "",
      renterPhone: row[2] || "",
      renterAddress: row[3] || "",
      productId: row[4] || "",
      productName: row[5] || "",
      quantity: Number(row[6]) || 0,
      startDate: row[7] || "",
      endDate: row[8] || "",
      totalPrice: Number(row[9]) || 0,
      status: (row[10] as Rental["status"]) || "pending",
      notes: row[11] || "",
      renterSocial: row[12] || "",
    }));

    // Parse finance (Header: id, date, type, category, amount, description)
    const finance: FinanceEntry[] = (financeRes.data.values || []).slice(1).map((row) => ({
      id: row[0] || "",
      date: row[1] || "",
      type: (row[2] as FinanceEntry["type"]) || "pemasukan",
      category: row[3] || "",
      amount: Number(row[4]) || 0,
      description: row[5] || "",
    }));

    // Parse categories (Header: id, name, icon, description)
    const categories: Category[] = (categoriesRes.data.values || []).slice(1).map((row) => ({
      id: row[0] || "",
      name: row[1] || "",
      icon: row[2] || "",
      description: row[3] || "",
    }));

    // Parse settings (Header: key, value)
    const settingsVal = settingsRes.data.values || [];
    const settingsMap: { [key: string]: string } = {};
    settingsVal.slice(1).forEach((row) => {
      if (row[0]) settingsMap[row[0]] = row[1] || "";
    });

    const settings: BasecampSettings = {
      address: settingsMap.address || "Basecamp Noesantara, Jl. Gunung Rinjani No. 108, Kav. 5, Bandung, Jawa Barat",
      phone: settingsMap.phone || "+62 812-3456-789",
      email: settingsMap.email || "info@noesantaraoutdoor.com",
      operatingHours: settingsMap.operatingHours || "Setiap Hari (Senin - Minggu) 08.00 WIB - 21.00 WIB",
      cleanWarranty: settingsMap.cleanWarranty || "Tenda & sleeping bag dicuci wangi setelah sewa.",
      gmapsEmbedUrl: settingsMap.gmapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9168067868735!2d107.60492857418702!3d-6.890985867429188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6587c6cfb4b%3A0xd674c2d46e10037a!2sParis%20Van%20Java!5e0!3m2!1sid!2sid!4v1716800000000!5m2!1sid!2sid",
      latitude: settingsMap.latitude ? Number(settingsMap.latitude) : -6.890986,
      longitude: settingsMap.longitude ? Number(settingsMap.longitude) : 107.604929,
      mapIcon: settingsMap.mapIcon || "default"
    };

    // Parse testimonials (Header: id, name, role, text, rating, avatar)
    const testimonialValues = testimonialsRes.data.values;
    let finalTestimonials = defaultTestimonials;

    if (testimonialValues) {
      const parsedTestimonials = testimonialValues.slice(1).map((row) => ({
        id: row[0] || "",
        name: row[1] || "",
        role: row[2] || "",
        text: row[3] || "",
        rating: Number(row[4]) || 5,
        avatar: row[5] || "",
      }));
      finalTestimonials = parsedTestimonials.length > 0 ? parsedTestimonials : defaultTestimonials;
    } else {
      // Fallback to local cache if Google Sheet tab doesn't exist
      try {
        if (fs.existsSync(LOCAL_DB_PATH)) {
          const localDb = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, "utf8"));
          if (localDb.testimonials && localDb.testimonials.length > 0) {
            finalTestimonials = localDb.testimonials;
          }
        }
      } catch (e) {
        console.warn("Gagal membaca lokal db untuk fallback testimoni:", e);
      }
    }

    return { products, rentals, finance, categories, settings, testimonials: finalTestimonials };
  } catch (err) {
    console.error("Google Sheets API error, falling back to local database:", err);
    return null;
  }
}

// 4. Write to specific Google Sheet tab
async function writeGoogleSheetTab(tabName: string, headers: string[], rows: (string | number | boolean)[][]): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = SPREADSHEET_ID!;
  const range = `${tabName}!A:Z`;

  // Clear existing values in this sheet tab
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });

  // Prepare full data with headers
  const data = [headers, ...rows];

  // Write new values
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: data },
  });
}

// Sync all local data to Google Sheets (used on setup or backup)
export async function syncLocalToGoogle(): Promise<{ success: boolean; message: string }> {
  try {
    const db = readLocalDb();
    
    // 1. Sync Products
    const productHeaders = ["id", "name", "category", "pricePerDay", "stock", "availableStock", "status", "images", "description", "features"];
    const productRows = db.products.map((p) => [
      p.id,
      p.name,
      p.category,
      p.pricePerDay,
      p.stock,
      p.availableStock,
      p.status,
      p.images.join(","),
      p.description,
      p.features.join(";"),
    ]);
    await writeGoogleSheetTab("products", productHeaders, productRows);

    // 2. Sync Rentals
    const rentalHeaders = ["id", "renterName", "renterPhone", "renterAddress", "productId", "productName", "quantity", "startDate", "endDate", "totalPrice", "status", "notes", "renterSocial"];
    const rentalRows = db.rentals.map((r) => [
      r.id,
      r.renterName,
      r.renterPhone,
      r.renterAddress,
      r.productId,
      r.productName,
      r.quantity,
      r.startDate,
      r.endDate,
      r.totalPrice,
      r.status,
      r.notes,
      r.renterSocial || "",
    ]);
    await writeGoogleSheetTab("rentals", rentalHeaders, rentalRows);

    // 3. Sync Finance
    const financeHeaders = ["id", "date", "type", "category", "amount", "description"];
    const financeRows = db.finance.map((f) => [
      f.id,
      f.date,
      f.type,
      f.category,
      f.amount,
      f.description,
    ]);
    await writeGoogleSheetTab("finance", financeHeaders, financeRows);

    // 4. Sync Categories
    const categoryHeaders = ["id", "name", "icon", "description"];
    const categoryRows = db.categories.map((c) => [
      c.id,
      c.name,
      c.icon,
      c.description,
    ]);
    await writeGoogleSheetTab("categories", categoryHeaders, categoryRows);

    // 5. Sync Settings
    const settingsHeaders = ["key", "value"];
    const settingsRows = [
      ["address", db.settings.address],
      ["phone", db.settings.phone],
      ["email", db.settings.email],
      ["operatingHours", db.settings.operatingHours],
      ["cleanWarranty", db.settings.cleanWarranty],
      ["gmapsEmbedUrl", db.settings.gmapsEmbedUrl || ""],
      ["latitude", db.settings.latitude?.toString() || ""],
      ["longitude", db.settings.longitude?.toString() || ""],
      ["mapIcon", db.settings.mapIcon || ""],
    ];
    await writeGoogleSheetTab("settings", settingsHeaders, settingsRows);

    // 6. Sync Testimonials
    const testimonialHeaders = ["id", "name", "role", "text", "rating", "avatar"];
    const testimonialRows = (db.testimonials || []).map((t) => [
      t.id,
      t.name,
      t.role,
      t.text,
      t.rating,
      t.avatar || "",
    ]);
    await writeGoogleSheetTab("testimonials", testimonialHeaders, testimonialRows).catch((err) => {
      console.warn("Gagal sinkron tab testimonials, abaikan jika tidak ada tab:", err.message);
    });

    return { success: true, message: "Sinkronisasi ke Google Spreadsheet berhasil!" };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Gagal sinkronisasi ke Google Sheets:", err);
    return { success: false, message: `Gagal sinkronisasi: ${errMsg}` };
  }
}

// ==========================================
// HIGH LEVEL API METHODS
// ==========================================

// Memory cache for Google Sheets read results to minimize API overhead
let cachedDb: FullDatabase | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds TTL

// Get entire database
export async function getDb(): Promise<FullDatabase> {
  const isConfigured = getDbConnectionStatus().connected;
  if (isConfigured) {
    const now = Date.now();
    if (cachedDb && (now - lastCacheTime < CACHE_TTL_MS)) {
      return cachedDb;
    }

    const googleData = await readGoogleDb();
    if (googleData) {
      // Sync local cache for fallback safety
      writeLocalDb(googleData);
      cachedDb = googleData;
      lastCacheTime = now;
      return googleData;
    }
  }
  return readLocalDb();
}

// Save entire database (handles dual writing)
export async function saveDb(db: FullDatabase): Promise<void> {
  // Update cache immediately on save
  cachedDb = db;
  lastCacheTime = Date.now();

  // Always write locally first as a master source and cache
  writeLocalDb(db);

  const isConfigured = getDbConnectionStatus().connected;
  if (isConfigured) {
    try {
      // Parallel write to Google Sheets to keep it realtime
      const productHeaders = ["id", "name", "category", "pricePerDay", "stock", "availableStock", "status", "images", "description", "features"];
      const productRows = db.products.map((p) => [p.id, p.name, p.category, p.pricePerDay, p.stock, p.availableStock, p.status, p.images.join(","), p.description, p.features.join(";")]);
      
      const rentalHeaders = ["id", "renterName", "renterPhone", "renterAddress", "productId", "productName", "quantity", "startDate", "endDate", "totalPrice", "status", "notes", "renterSocial"];
      const rentalRows = db.rentals.map((r) => [r.id, r.renterName, r.renterPhone, r.renterAddress, r.productId, r.productName, r.quantity, r.startDate, r.endDate, r.totalPrice, r.status, r.notes, r.renterSocial || ""]);

      const financeHeaders = ["id", "date", "type", "category", "amount", "description"];
      const financeRows = db.finance.map((f) => [f.id, f.date, f.type, f.category, f.amount, f.description]);

      const categoryHeaders = ["id", "name", "icon", "description"];
      const categoryRows = db.categories.map((c) => [c.id, c.name, c.icon, c.description]);

      const settingsHeaders = ["key", "value"];
      const settingsRows = [
        ["address", db.settings.address],
        ["phone", db.settings.phone],
        ["email", db.settings.email],
        ["operatingHours", db.settings.operatingHours],
        ["cleanWarranty", db.settings.cleanWarranty],
        ["gmapsEmbedUrl", db.settings.gmapsEmbedUrl || ""],
        ["latitude", db.settings.latitude?.toString() || ""],
        ["longitude", db.settings.longitude?.toString() || ""],
        ["mapIcon", db.settings.mapIcon || ""],
      ];

      const testimonialHeaders = ["id", "name", "role", "text", "rating", "avatar"];
      const testimonialRows = (db.testimonials || []).map((t) => [t.id, t.name, t.role, t.text, t.rating, t.avatar || ""]);

      await Promise.all([
        writeGoogleSheetTab("products", productHeaders, productRows),
        writeGoogleSheetTab("rentals", rentalHeaders, rentalRows),
        writeGoogleSheetTab("finance", financeHeaders, financeRows),
        writeGoogleSheetTab("categories", categoryHeaders, categoryRows),
        writeGoogleSheetTab("settings", settingsHeaders, settingsRows),
        writeGoogleSheetTab("testimonials", testimonialHeaders, testimonialRows).catch((err) => {
          console.warn("Gagal menulis tab testimonials, abaikan jika tidak ada tab:", err.message);
        }),
      ]);
    } catch (err) {
      console.error("Gagal menulis ke Google Sheets realtime, data tersimpan lokal:", err);
    }
  }
}

// ------------------------------------------
// Products Operations
// ------------------------------------------
export async function getProducts(): Promise<Product[]> {
  const db = await getDb();
  return db.products;
}

export async function saveProduct(product: Product): Promise<void> {
  const db = await getDb();
  const index = db.products.findIndex((p) => p.id === product.id);
  
  if (index >= 0) {
    db.products[index] = product;
  } else {
    db.products.push(product);
  }
  
  await saveDb(db);
}

export async function deleteProduct(productId: string): Promise<void> {
  const db = await getDb();
  db.products = db.products.filter((p) => p.id !== productId);
  await saveDb(db);
}

// ------------------------------------------
// Rentals Operations
// ------------------------------------------
export async function getRentals(): Promise<Rental[]> {
  const db = await getDb();
  return db.rentals;
}

export async function saveRental(rental: Rental): Promise<void> {
  const db = await getDb();
  const index = db.rentals.findIndex((r) => r.id === rental.id);
  
  const isActiveStatus = (status: Rental["status"]) => status === "disewa" || status === "telat";
  const isInactiveStatus = (status: Rental["status"]) => status === "pending" || status === "selesai";

  if (index >= 0) {
    const oldRental = db.rentals[index];
    db.rentals[index] = rental;

    // Transition of status
    if (isInactiveStatus(oldRental.status) && isActiveStatus(rental.status)) {
      // Deduct stock
      const product = db.products.find((p) => p.id === rental.productId);
      if (product) {
        product.availableStock = Math.max(0, product.availableStock - rental.quantity);
        if (product.availableStock === 0) {
          product.status = "Disewa";
        }
      }
    } else if (isActiveStatus(oldRental.status) && isInactiveStatus(rental.status)) {
      // Restore stock
      const product = db.products.find((p) => p.id === rental.productId);
      if (product) {
        product.availableStock = Math.min(product.stock, product.availableStock + rental.quantity);
        if (product.availableStock > 0) {
          product.status = "Ready";
        }
      }
    }
  } else {
    db.rentals.push(rental);
    
    // Log income immediately if rental status is 'disewa' or 'selesai'
    if (rental.status === "disewa" || rental.status === "selesai") {
      const financeId = `fin-auto-${Date.now()}`;
      db.finance.push({
        id: financeId,
        date: new Date().toISOString().split("T")[0],
        type: "pemasukan",
        category: "Sewa Alat",
        amount: rental.totalPrice,
        description: `Pendapatan rental otomatis dari ${rental.renterName} (${rental.productName})`,
      });
    }

    // Only deduct stock if created directly with active status
    if (isActiveStatus(rental.status)) {
      const product = db.products.find((p) => p.id === rental.productId);
      if (product) {
        product.availableStock = Math.max(0, product.availableStock - rental.quantity);
        if (product.availableStock === 0) {
          product.status = "Disewa";
        }
      }
    }
  }
  
  await saveDb(db);
}

export async function saveRentals(rentals: Rental[]): Promise<void> {
  const db = await getDb();
  let timestampOffset = 0;
  
  const isActiveStatus = (status: Rental["status"]) => status === "disewa" || status === "telat";
  const isInactiveStatus = (status: Rental["status"]) => status === "pending" || status === "selesai";

  for (const rental of rentals) {
    const index = db.rentals.findIndex((r) => r.id === rental.id);
    if (index >= 0) {
      const oldRental = db.rentals[index];
      db.rentals[index] = rental;

      // Status transition
      if (isInactiveStatus(oldRental.status) && isActiveStatus(rental.status)) {
        // Deduct
        const product = db.products.find((p) => p.id === rental.productId);
        if (product) {
          product.availableStock = Math.max(0, product.availableStock - rental.quantity);
          if (product.availableStock === 0) {
            product.status = "Disewa";
          }
        }
      } else if (isActiveStatus(oldRental.status) && isInactiveStatus(rental.status)) {
        // Restore
        const product = db.products.find((p) => p.id === rental.productId);
        if (product) {
          product.availableStock = Math.min(product.stock, product.availableStock + rental.quantity);
          if (product.availableStock > 0) {
            product.status = "Ready";
          }
        }
      }
    } else {
      db.rentals.push(rental);
      
      // Log income immediately if rental status is 'disewa' or 'selesai'
      if (rental.status === "disewa" || rental.status === "selesai") {
        const financeId = `fin-auto-${Date.now()}-${timestampOffset++}`;
        db.finance.push({
          id: financeId,
          date: new Date().toISOString().split("T")[0],
          type: "pemasukan",
          category: "Sewa Alat",
          amount: rental.totalPrice,
          description: `Pendapatan rental otomatis dari ${rental.renterName} (${rental.productName})`,
        });
      }

      // Only deduct stock if active
      if (isActiveStatus(rental.status)) {
        const product = db.products.find((p) => p.id === rental.productId);
        if (product) {
          product.availableStock = Math.max(0, product.availableStock - rental.quantity);
          if (product.availableStock === 0) {
            product.status = "Disewa";
          }
        }
      }
    }
  }
  await saveDb(db);
}

export async function updateRentalStatus(rentalId: string, status: Rental["status"]): Promise<void> {
  const db = await getDb();
  const index = db.rentals.findIndex((r) => r.id === rentalId);
  
  const isActiveStatus = (status: Rental["status"]) => status === "disewa" || status === "telat";
  const isInactiveStatus = (status: Rental["status"]) => status === "pending" || status === "selesai";

  if (index >= 0) {
    const rental = db.rentals[index];
    const oldStatus = rental.status;
    rental.status = status;

    // Transition of status
    if (isInactiveStatus(oldStatus) && isActiveStatus(status)) {
      // Deduct stock
      const product = db.products.find((p) => p.id === rental.productId);
      if (product) {
        product.availableStock = Math.max(0, product.availableStock - rental.quantity);
        if (product.availableStock === 0) {
          product.status = "Disewa";
        }
      }

      // Add realized income when approved (transition from pending)
      if (oldStatus === "pending") {
        const financeId = `fin-auto-${Date.now()}`;
        db.finance.push({
          id: financeId,
          date: new Date().toISOString().split("T")[0],
          type: "pemasukan",
          category: "Sewa Alat",
          amount: rental.totalPrice,
          description: `Pendapatan rental disetujui dari ${rental.renterName} (${rental.productName})`,
        });
      }
    } else if (isActiveStatus(oldStatus) && isInactiveStatus(status)) {
      // Restore stock
      const product = db.products.find((p) => p.id === rental.productId);
      if (product) {
        product.availableStock = Math.min(product.stock, product.availableStock + rental.quantity);
        if (product.availableStock > 0) {
          product.status = "Ready";
        }
      }
    }

    await saveDb(db);
  }
}

// ------------------------------------------
// Finance Operations
// ------------------------------------------
export async function getFinance(): Promise<FinanceEntry[]> {
  const db = await getDb();
  return db.finance;
}

export async function saveFinanceEntry(entry: FinanceEntry): Promise<void> {
  const db = await getDb();
  const index = db.finance.findIndex((f) => f.id === entry.id);
  
  if (index >= 0) {
    db.finance[index] = entry;
  } else {
    db.finance.push(entry);
  }
  
  await saveDb(db);
}

export async function deleteFinanceEntry(entryId: string): Promise<void> {
  const db = await getDb();
  db.finance = db.finance.filter((f) => f.id !== entryId);
  await saveDb(db);
}

// ------------------------------------------
// Categories Operations
// ------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.categories;
}

export async function saveCategory(category: Category): Promise<void> {
  const db = await getDb();
  const index = db.categories.findIndex((c) => c.id === category.id);
  
  if (index >= 0) {
    db.categories[index] = category;
  } else {
    db.categories.push(category);
  }
  
  await saveDb(db);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = await getDb();
  db.categories = db.categories.filter((c) => c.id !== categoryId);
  await saveDb(db);
}

// ------------------------------------------
// Settings Operations
// ------------------------------------------
export async function getSettings(): Promise<BasecampSettings> {
  const db = await getDb();
  return db.settings || {
    address: "Basecamp Noesantara, Jl. Gunung Rinjani No. 108, Kav. 5, Bandung, Jawa Barat",
    phone: "+62 812-3456-789",
    email: "info@noesantaraoutdoor.com",
    operatingHours: "Setiap Hari (Senin - Minggu) 08.00 WIB - 21.00 WIB",
    cleanWarranty: "Tenda & sleeping bag dicuci wangi setelah sewa.",
    gmapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9168067868735!2d107.60492857418702!3d-6.890985867429188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6587c6cfb4b%3A0xd674c2d46e10037a!2sParis%20Van%20Java!5e0!3m2!1sid!2sid!4v1716800000000!5m2!1sid!2sid"
  };
}

export async function saveSettings(settings: BasecampSettings): Promise<void> {
  const db = await getDb();
  db.settings = settings;
  await saveDb(db);
}

// ------------------------------------------
// Testimonials Operations
// ------------------------------------------
export async function getTestimonials(): Promise<Testimonial[]> {
  const db = await getDb();
  return db.testimonials || [];
}

export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const db = await getDb();
  if (!db.testimonials) db.testimonials = [];
  const index = db.testimonials.findIndex((t) => t.id === testimonial.id);
  
  if (index >= 0) {
    db.testimonials[index] = testimonial;
  } else {
    db.testimonials.push(testimonial);
  }
  
  await saveDb(db);
}

export async function deleteTestimonial(testimonialId: string): Promise<void> {
  const db = await getDb();
  if (!db.testimonials) db.testimonials = [];
  db.testimonials = db.testimonials.filter((t) => t.id !== testimonialId);
  await saveDb(db);
}

export async function clearAllFinanceEntries(): Promise<void> {
  const db = await getDb();
  db.finance = [];
  await saveDb(db);
}

export async function deleteRentalsByPhone(phone: string): Promise<void> {
  const db = await getDb();
  
  // Find all rentals for this phone
  const rentalsToDelete = db.rentals.filter((r) => r.renterPhone === phone);
  
  // Restore product stock ONLY for active rentals ('disewa' or 'telat')
  for (const rental of rentalsToDelete) {
    if (rental.status === "disewa" || rental.status === "telat") {
      const product = db.products.find((p) => p.id === rental.productId);
      if (product) {
        product.availableStock = Math.min(product.stock, product.availableStock + rental.quantity);
        if (product.availableStock > 0) {
          product.status = "Ready";
        }
      }
    }
  }

  // Delete rentals
  db.rentals = db.rentals.filter((r) => r.renterPhone !== phone);
  await saveDb(db);
}

