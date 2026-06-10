import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-14 md:h-16", showText = true }: LogoProps) {
  return (
    <div className="flex items-center select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Noesantara Outdoor Logo"
        className={`object-contain max-w-full ${className}`}
      />
    </div>
  );
}
