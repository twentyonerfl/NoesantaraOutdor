"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/db-service";

export interface CartItem {
  id: string;
  name: string;
  pricePerDay: number;
  image: string;
  quantity: number;
  availableStock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage after mount to prevent SSR hydration mismatch
  useEffect(() => {
    const savedCart = localStorage.getItem("noesantara_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setTimeout(() => {
          setCart(parsed);
          setIsLoaded(true);
        }, 0);
        return;
      } catch (e) {
        console.error("Gagal memuat keranjang dari local storage:", e);
      }
    }
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, []);

  // Save cart to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("noesantara_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(product.availableStock, existing.quantity + qty);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          pricePerDay: product.pricePerDay,
          image: product.images[0] || "/placeholder.jpg",
          quantity: Math.min(product.availableStock, qty),
          availableStock: product.availableStock,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(item.availableStock, qty)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }
  return context;
}
