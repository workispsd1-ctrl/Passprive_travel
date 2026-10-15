import type { ReactNode } from "react";

import { CardIcon, ShieldIcon, StarIcon } from "./icons";

const ITEMS: { icon: ReactNode; label: string; sub: string }[] = [
  { icon: <ShieldIcon />, label: "Direct On-Ground Care", sub: "dedicated private chauffeur" },
  { icon: <ShieldIcon />, label: "15-Min Reply", sub: "direct on WhatsApp" },
  { icon: <StarIcon />, label: "8.5+ Rated Only", sub: "every stay hand-checked" },
  { icon: <CardIcon />, label: "Flexible Payments", sub: "split before you fly" },
];

export function TrustStrip() {
  return (
    <div className="py-3.5 border-y border-[rgba(26,20,14,0.07)] bg-white max-mob:py-3">
      <div className="max-w-[1240px] mx-auto px-6 flex justify-center gap-9 flex-wrap max-mob:grid max-mob:grid-cols-[1fr_1fr] max-mob:gap-x-2.5 max-mob:gap-y-2 max-mob:px-4">
        {ITEMS.map(({ icon, label, sub }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 [&>svg]:text-pp-teal [&>svg]:shrink-0 max-mob:px-2.5 max-mob:py-2 max-mob:bg-[rgba(255,255,255,0.85)] max-mob:border max-mob:border-[rgba(26,20,14,0.06)] max-mob:rounded-[10px] max-mob:gap-2"
          >
            {icon}
            <div>
              <p className="font-display text-[0.88rem] font-extrabold text-pp-ink leading-[1.15] max-mob:text-[0.78rem] max-mob:font-bold max-mob:leading-[1.2]">
                {label}
              </p>
              <p className="font-hand text-[1.05rem] text-pp-inksoft font-semibold leading-[1.1] max-mob:text-[0.7rem] max-mob:leading-[1.2]">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
