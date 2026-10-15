import "../globals.css";

import { bricolage, caveat, instrumentSans } from "@/lib/fonts";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-page="legal" className={`${bricolage.variable} ${caveat.variable} ${instrumentSans.variable}`}>
      <body className="font-['Instrument_Sans',sans-serif] bg-pp-sand text-pp-ink leading-[1.7] pt-10 px-[18px] pb-20">
        {children}
      </body>
    </html>
  );
}
