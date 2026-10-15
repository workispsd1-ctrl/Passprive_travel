import "../globals.css";

import type { Metadata, Viewport } from "next";

import { caveat, plusJakarta } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "PassPrivé Travel — Curated Luxury Vacations | ₹1,999 Token Pass",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✈</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-page="mobile" className={`scroll-smooth ${caveat.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-[#FFFDF9] text-[#2D1E18] overflow-x-hidden [-webkit-tap-highlight-color:transparent] selection:bg-[#E05A47] selection:text-white pb-24">
        {children}
      </body>
    </html>
  );
}
