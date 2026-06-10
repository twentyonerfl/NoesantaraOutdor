"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  mapIcon?: string;
  isDraggable?: boolean;
  onPositionChange?: (lat: number, lng: number) => void;
}

export default function InteractiveMap({
  latitude,
  longitude,
  zoom = 15,
  mapIcon = "default",
  isDraggable = false,
  onPositionChange
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Helper to generate a modern, colorful SVG pin marker
  const getCustomIcon = (iconType: string) => {
    let iconHtml = "";
    let size: [number, number] = [40, 40];
    let anchor: [number, number] = [20, 40];
    
    switch (iconType) {
      case "tent":
        iconHtml = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-brand-red/30 bg-neutral-950/90 text-brand-red backdrop-blur-md shadow-lg relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tent"><path d="M19 20 12 4M5 20l7-16M12 4v16M2 20h20"/><path d="m12 12 4 8M12 12l-4 8"/></svg>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-brand-red/30 bg-neutral-950/90"></div>
          </div>
        `;
        break;
      case "campfire":
        iconHtml = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-brand-yellow/30 bg-neutral-950/90 text-brand-yellow backdrop-blur-md shadow-lg relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-brand-yellow/30 bg-neutral-950/90"></div>
          </div>
        `;
        break;
      case "compass":
        iconHtml = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-brand-green/30 bg-neutral-950/90 text-brand-green backdrop-blur-md shadow-lg relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.2 6.4-6.4 2.2 2.2-6.4z"/></svg>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-brand-green/30 bg-neutral-950/90"></div>
          </div>
        `;
        break;
      case "backpack":
        iconHtml = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-blue-500/30 bg-neutral-950/90 text-blue-500 backdrop-blur-md shadow-lg relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-backpack"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 22V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12"/><path d="M4 10h16"/></svg>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-blue-500/30 bg-neutral-950/90"></div>
          </div>
        `;
        break;
      default: // 'default' / 'pin'
        size = [34, 42];
        anchor = [17, 42];
        iconHtml = `
          <div class="flex items-center justify-center">
            <svg viewBox="0 0 24 30" width="34" height="42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.35));">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" stroke="#B31412" stroke-width="0.5" />
              <circle cx="12" cy="9" r="3.5" fill="#FFFFFF" />
              <circle cx="12" cy="9" r="1.5" fill="#76110D" />
            </svg>
          </div>
        `;
    }

    return L.divIcon({
      html: iconHtml,
      className: "custom-leaflet-icon",
      iconSize: size,
      iconAnchor: anchor
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map on mount if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([latitude, longitude], zoom);

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

      // Add Google Maps Roadmap tile layer
      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
      }).addTo(mapRef.current);
    } else {
      // Pan to new coordinates when they change
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
    }

    // Initialize or update marker
    const currentIcon = getCustomIcon(mapIcon);
    
    if (!markerRef.current) {
      markerRef.current = L.marker([latitude, longitude], {
        icon: currentIcon,
        draggable: isDraggable
      }).addTo(mapRef.current);

      if (isDraggable && onPositionChange) {
        markerRef.current.on("dragend", (e) => {
          const position = e.target.getLatLng();
          onPositionChange(position.lat, position.lng);
        });
      }
    } else {
      markerRef.current.setLatLng([latitude, longitude]);
      markerRef.current.setIcon(currentIcon);
      
      // Update draggable state dynamically
      if (isDraggable) {
        markerRef.current.dragging?.enable();
        markerRef.current.off("dragend");
        if (onPositionChange) {
          markerRef.current.on("dragend", (e) => {
            const position = e.target.getLatLng();
            onPositionChange(position.lat, position.lng);
          });
        }
      } else {
        markerRef.current.dragging?.disable();
      }
    }

    // Keep marker inside viewport bounds on resize/refresh
    const map = mapRef.current;
    const updateMapSize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", updateMapSize);

    return () => {
      window.removeEventListener("resize", updateMapSize);
    };
  }, [latitude, longitude, zoom, mapIcon, isDraggable, onPositionChange]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: "100%" }}>
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden border border-neutral-800" style={{ height: "100%" }} />
    </div>
  );
}
