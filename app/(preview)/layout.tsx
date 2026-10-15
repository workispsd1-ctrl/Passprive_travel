import "../globals.css";

import type { Metadata } from "next";

import { plusJakarta } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "PassPrivé Travel — Mobile Preview Simulator",
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-page="preview" className={plusJakarta.variable}>
      <body
        className={`font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Display","SF_Pro_Text","Plus_Jakarta_Sans",sans-serif] overflow-x-hidden bg-[#15110E] text-neutral-100 min-h-screen flex flex-col transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
