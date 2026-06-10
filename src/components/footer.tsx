"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Mail, ShieldCheck, HelpCircle, FileText } from "lucide-react";
import Logo from "./logo";
import { getSettingsAction } from "@/app/actions";
import { BasecampSettings } from "@/lib/db-service";

export default function Footer() {
  const [settings, setSettings] = useState<BasecampSettings>({
    address: "Basecamp Noesantara, Jl. Gunung Rinjani No. 108, Kav. 5, Bandung, Jawa Barat",
    phone: "+62 812-3456-789",
    email: "info@noesantaraoutdoor.com",
    operatingHours: "Setiap Hari (Senin - Minggu) 08.00 WIB - 21.00 WIB",
    cleanWarranty: "Tenda & sleeping bag dicuci wangi setelah sewa.",
    gmapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9168067868735!2d107.60492857418702!3d-6.890985867429188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6587c6cfb4b%3A0xd674c2d46e10037a!2sParis%20Van%20Java!5e0!3m2!1sid!2sid!4v1716800000000!5m2!1sid!2sid"
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettingsAction();
        setSettings(data);
      } catch (err) {
        console.error("Gagal memuat pengaturan footer:", err);
      }
    }
    loadSettings();
  }, []);

  // Format phone for WhatsApp link (numeric only, e.g. 628123456789)
  const cleanPhone = settings.phone.replace(/[^0-9]/g, "");

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 pt-8 md:pt-16 pb-8 relative overflow-hidden">
      {/* Decorative mountain grid bg */}
      <div className="absolute inset-x-0 bottom-0 h-40 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-brand-red via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-8 md:mb-12">
          {/* Logo & Intro */}
          <div className="flex flex-col gap-4 md:gap-5 md:col-span-1">
            <Logo showText={true} />
            <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed font-light">
              Penyedia jasa sewa alat gunung & camping premium terpercaya. Kami menyediakan peralatan berkualitas terbaik dari brand ternama demi keselamatan dan kenyamanan petualangan Anda menjelajahi keindahan Nusantara.
            </p>
          </div>

          {/* Operating Hours */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 h-14 md:h-16">
              <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-brand-green animate-ping" />
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Stok Real-time Terkoneksi
              </span>
            </div>

            <h4 className="text-[11px] md:text-xs font-bold text-white uppercase tracking-wider border-l-2 border-brand-yellow pl-2">
              Jam Operasional
            </h4>
            <div className="flex flex-col gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400">
              <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-2 md:p-2.5 flex items-center gap-2 md:gap-2.5">
                <Clock className="w-4.5 h-4.5 md:w-6 md:h-6 text-brand-yellow flex-shrink-0" />
                <div>
                  <p className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider">Setiap Hari (Senin - Minggu)</p>
                  <p className="text-[7px] md:text-[8px] text-gray-400">{settings.operatingHours}</p>
                </div>
              </div>
              
              <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-2 md:p-2.5 flex items-center gap-2 md:gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 md:w-6 md:h-6 text-brand-green flex-shrink-0" />
                <div>
                  <p className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider">Garansi Alat Bersih</p>
                  <p className="text-[7px] md:text-[8px] text-gray-400">{settings.cleanWarranty}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3 md:gap-4">
            <h4 className="text-[11px] md:text-xs font-bold text-white uppercase tracking-wider border-l-2 border-brand-green pl-2">
              Kontak & Alamat
            </h4>
            <ul className="flex flex-col gap-2.5 md:gap-3.5 text-[10px] md:text-xs text-gray-400">
              <li className="flex items-start gap-2 md:gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-brand-red flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-light">
                  {settings.address}
                </span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Phone className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-brand-yellow flex-shrink-0" />
                <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="hover:text-white transition-premium font-light">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Mail className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-brand-green flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-premium font-light">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Catalog Categories */}
          <div className="flex flex-col gap-3 md:gap-4">
            <h4 className="text-[11px] md:text-xs font-bold text-white uppercase tracking-wider border-l-2 border-brand-red pl-2">
              Katalog Cepat
            </h4>
            <ul className="flex flex-col gap-2 md:gap-2.5 text-[10px] md:text-xs text-gray-400">
              <li>
                <Link href="/catalog" className="hover:text-brand-red transition-premium">Tenda & Shelter</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-brand-red transition-premium">Tas Carrier & Daypack</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-brand-red transition-premium">Jaket & Apparel Gunung</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-brand-red transition-premium">Kompor & Alat Masak</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-brand-red transition-premium">Aksesoris & Sleeping Bag</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-900 pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 text-[9px] md:text-[10px] text-gray-500">
          <p>&copy; {new Date().getFullYear()} Noesantara Outdoor Rental. All Rights Reserved.</p>
          <div className="flex items-center gap-4 md:gap-6">
            <span className="flex items-center gap-1 hover:text-white transition-premium cursor-pointer">
              <FileText className="w-3 h-3 md:w-3.5 md:h-3.5" /> Syarat & Ketentuan
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-premium cursor-pointer">
              <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> FAQ
            </span>
            <Link href="/admin" className="hover:text-white transition-premium">
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
