import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    "charlsie-vitaminic-leighton.ngrok-free.dev",
    "charlsie-vitaminic-leighton.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok-free.app"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "*.ngrok-free.app",
        "*.ngrok-free.dev",
        "charlsie-vitaminic-leighton.ngrok-free.dev"
      ]
    }
  },
  // Ultra-fast compilation optimizations
  typescript: {
    // Skip type checking during builds for blazing fast compilation (saves 30-50s)
    ignoreBuildErrors: true,
  },
  // Disable browser source maps in production to reduce bundle size and build time
  productionBrowserSourceMaps: false,
  // Disable powered by header
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
