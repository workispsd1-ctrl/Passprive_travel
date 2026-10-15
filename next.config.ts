import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Keep every URL of the old static/PHP site working.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index%20updated.html", destination: "/", permanent: true },
      { source: "/mobile-index.html", destination: "/", permanent: true },
      { source: "/tablet-index.html", destination: "/", permanent: true },
      { source: "/admin.html", destination: "/admin", permanent: true },
      { source: "/mobile.html", destination: "/mobile", permanent: true },
      { source: "/mobile-preview.html", destination: "/mobile-preview", permanent: true },
      { source: "/legal/:slug.html", destination: "/legal/:slug", permanent: true },
    ];
  },

  async rewrites() {
    return [
      { source: "/api/bookings.php", destination: "/api/bookings" },
      { source: "/api/rates.php", destination: "/api/rates" },
    ];
  },

  // Security headers previously set in .htaccess.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Same-origin framing is required by /mobile-preview, which embeds /mobile.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
