"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  confirmText = "Hapus",
  cancelText = "Batal",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-neutral-900 rounded-[32px] p-6 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header Red Line Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />

            {/* Close Button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-neutral-900 text-gray-500 hover:text-white transition-premium cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex flex-col items-center text-center mt-2">
              {/* Warning Icon Container */}
              <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-4">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>

              {/* Title */}
              <h3 className="text-base font-black uppercase text-white tracking-wider mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-xs text-gray-400 font-light leading-relaxed max-w-xs mb-6">
                {message}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 w-full border-t border-neutral-900 pt-4">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={onClose}
                  className="w-1/2 py-2.5 rounded-full border border-neutral-850 hover:bg-neutral-900 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-premium cursor-pointer disabled:opacity-50"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={onConfirm}
                  className="w-1/2 py-2.5 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold uppercase tracking-wider transition-premium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(214,0,0,0.3)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Proses...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
