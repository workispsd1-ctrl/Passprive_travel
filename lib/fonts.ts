import { Bricolage_Grotesque, Caveat, Geist_Mono, Instrument_Sans, Kalam, Plus_Jakarta_Sans } from "next/font/google";

// Options must be literals (next/font is statically analyzed). `latin-ext` carries the ₹ glyph used in prices.
// The `variable` classes are applied in each layout to load the @font-face rules; app/globals.css
// references the families by name.

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--nf-bricolage",
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--nf-instrument",
});

export const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  variable: "--nf-caveat",
});

export const kalam = Kalam({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--nf-kalam",
});

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--nf-jakarta",
});

export const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--nf-geist-mono",
});
