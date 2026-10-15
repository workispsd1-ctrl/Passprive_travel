import "../globals.css";

import { bricolage, caveat, instrumentSans, kalam } from "@/lib/fonts";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-page="home"
      className={`${bricolage.variable} ${caveat.variable} ${instrumentSans.variable} ${kalam.variable} scroll-smooth`}
    >
      <body className="font-body text-pp-ink bg-pp-sand leading-[1.55] overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
