import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared frame for the legal pages. Content is plain semantic HTML styled through
 * descendant variants (the original pages shared one stylesheet with no CSS reset,
 * so headings stay bold and lists keep their bullets). Headings pin opsz 14 (the static instance
 * Google served the original pages, which requested Bricolage without the opsz axis).
 */
export function LegalShell({ kicker, title, notice, children }: { kicker: string; title: string; notice: ReactNode; children: ReactNode }) {
  return (
    <div
      className={[
        "max-w-[820px] mx-auto bg-white border border-[rgba(26,20,14,0.08)] rounded-3xl p-[clamp(26px,5vw,50px)] shadow-[0_20px_50px_-15px_rgba(26,20,14,0.08)]",
        "[&_h2]:font-['Bricolage_Grotesque',sans-serif] [&_h2]:font-bold [&_h2]:[font-variation-settings:'opsz'_14] [&_h2]:text-[1.25rem] [&_h2]:mt-[30px] [&_h2]:mb-2.5 [&_h2]:text-pp-ink",
        "[&_p]:text-[#5A5148] [&_p]:text-[0.98rem] [&_p]:mb-3 [&_li]:text-[#5A5148] [&_li]:text-[0.98rem] [&_li]:mb-3",
        "[&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:list-disc",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:mt-[18px] [&_table]:mb-6 [&_table]:text-[0.92rem]",
        "[&_:is(th,td)]:px-3.5 [&_:is(th,td)]:py-3 [&_:is(th,td)]:text-left [&_:is(th,td)]:border-b [&_:is(th,td)]:border-[rgba(26,20,14,0.08)]",
        "[&_th]:bg-[rgba(26,20,14,0.03)] [&_th]:font-bold",
      ].join(" ")}
    >
      <Link href="/" className="inline-flex items-center gap-1.5 text-pp-teal font-bold text-[0.92rem] mb-6">
        &larr; Back to PassPrivé Mauritius Trips
      </Link>
      <span className="block font-['Caveat',cursive] font-bold text-[1.45rem] text-pp-orange mb-1.5">{kicker}</span>
      <h1 className="font-['Bricolage_Grotesque',sans-serif] font-bold [font-variation-settings:'opsz'_14] text-[clamp(2rem,4vw,2.7rem)] leading-[1.1] mb-3 tracking-[-0.02em]">
        {title}
      </h1>
      <p>Last updated: September 2026</p>

      <div className="bg-[rgba(14,111,99,0.06)] border-l-4 border-pp-teal px-[18px] py-3.5 rounded-xl my-5 text-[0.92rem] text-pp-ink">
        {notice}
      </div>

      {children}
    </div>
  );
}
