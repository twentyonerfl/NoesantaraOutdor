import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Noesantara Outdoor | Penyewaan Alat Outdoor & Camping Premium",
  description: "Sewa tenda, carrier, perlengkapan mendaki, dan peralatan outdoor premium terlengkap di Noesantara Outdoor. Transaksi aman, produk terawat, checkout instan ke WhatsApp.",
  keywords: "sewa alat camping, rental outdoor, noesantara outdoor, sewa tenda, carrier eiger, alat daki gunung, rental camping jakarta, sewa alat naik gunung",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-dark-bg text-foreground font-sans selection:bg-brand-red selection:text-white">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

