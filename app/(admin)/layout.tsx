import "../globals.css";

import type { Metadata } from "next";

import { geistMono, plusJakarta } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "PassPrivé Travel — Operations Control & Admin Command Center",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏝️</text></svg>",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-page="admin" className={`dark ${plusJakarta.variable} ${geistMono.variable}`}>
      <body className="bg-[#000000] text-[#EDEDED] font-sans antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
