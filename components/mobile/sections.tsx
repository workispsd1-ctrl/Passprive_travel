"use client";

import type { Destination, PassBundle, TourPackage, Upsell } from "@/lib/catalog";

import { ArrowRightIcon } from "./icons";
import type { ByopCategory, MobileCategory } from "./mobile-app";
import type { PassBookingData } from "./pass-drawer";

const inr = (n: number) => n.toLocaleString("en-IN");
const FALLBACK_BUNDLE_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

/** Gate price for an attraction; when unset the catalog assumes a 38% markup over the pass price. */
const gatePriceOf = (u: Upsell) => u.gatePrice || Math.round(u.price * 1.38);
const passPriceOf = (u: Upsell) => u.passPrice || u.price;

export function CuratedBundles({
  bundles,
  onLock,
}: {
  destination: Destination;
  bundles: PassBundle[];
  onLock: (bundle: PassBundle) => void;
}) {
  if (!bundles || bundles.length === 0) {
    return (
      <div className="stack-y-5">
        <div className="text-center py-6 text-neutral-400 text-xs">No bundles configured for this destination.</div>
      </div>
    );
  }

  return (
    <div className="stack-y-5">
      {bundles.map((b) => (
        <div key={b.id} className="rounded-3xl bg-white border border-orange-100 shadow-xs overflow-hidden flex flex-col">
          {/* Mobile 16:9 Hero Image Header */}
          <div className="relative h-40 w-full overflow-hidden bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image with an onError fallback */}
            <img
              src={b.image || FALLBACK_BUNDLE_IMAGE}
              alt={b.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_BUNDLE_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t/srgb from-black/85 via-black/25 to-transparent" />

            {/* Floating Badges */}
            <div className="absolute top-2.5 inset-x-3 flex items-center justify-between z-10">
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-300/30 text-[10px] font-extrabold uppercase">
                {b.badge || "Curated Pass"}
              </span>
              <span className="text-xs font-black text-neutral-950 bg-amber-400 px-2.5 py-0.5 rounded-full shadow-md">Save {b.savingsPercent}%</span>
            </div>

            {/* Floating Title Over Hero */}
            <div className="absolute bottom-2.5 inset-x-3 z-10">
              <div className="flex items-center gap-1 text-[10px] text-amber-200 font-mono font-bold mb-0.5">
                <span className="uppercase tracking-wider">{b.theme} Pass</span>
              </div>
              <h3 className="text-base font-black text-white leading-tight drop-shadow-xs">{b.name}</h3>
            </div>
          </div>

          {/* Mobile Card Content */}
          <div className="p-4 stack-y-3">
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">{b.tagline}</p>

            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 stack-y-1">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-neutral-200/60">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Included Experiences ({b.itemCount})</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{b.validity}</span>
              </div>
              {(b.includedItems || []).map((it) => (
                <div key={it.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span className="truncate text-[#2D1E18] font-medium">{it.name}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium shrink-0 line-through">Gate: ₹{inr(it.gatePrice || 0)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-neutral-100">
              <div>
                <span className="text-[11px] text-neutral-500 font-semibold line-through block">Gate: ₹{inr(b.gatePrice)}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-[#2D1E18]">₹{inr(b.passPrice)}</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white">Save {b.savingsPercent}%</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#E05A47]">₹1,999 Entry Token</span>
            </div>

            <button
              type="button"
              onClick={() => onLock(b)}
              className="w-full py-3 rounded-2xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] text-white font-extrabold text-xs shadow-md shadow-[#E05A47]/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lock This Pass for ₹1,999</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const BYOP_CATEGORIES: [ByopCategory, string][] = [
  ["all", "All Sights"],
  ["adventure", "Thrills & Safari"],
  ["cultural", "Sights & Culture"],
  ["dining", "VIP Dining"],
  ["hotel_upgrade", "Suites & Villas"],
];

export function ByopSection({
  destination: d,
  category,
  onCategory,
  selected,
  onToggle,
  onLock,
}: {
  destination: Destination;
  category: ByopCategory;
  onCategory: (c: ByopCategory) => void;
  selected: string[];
  onToggle: (id: string) => void;
  onLock: (data: PassBookingData) => void;
}) {
  const upsells = d.upsells || [];
  const filtered =
    category === "all" ? upsells : upsells.filter((u) => (u.bundleTags && u.bundleTags.includes(category)) || u.category === category);

  // ── Live pass calculator (5% extra off for 2+ attractions, rounded-sm to ₹100) ──
  const chosen = upsells.filter((u) => selected.includes(u.id));
  const count = chosen.length;
  const gateSum = chosen.reduce((acc, u) => acc + gatePriceOf(u), 0);
  const rawPassSum = chosen.reduce((acc, u) => acc + passPriceOf(u), 0);
  const finalPass = count >= 2 ? Math.round((rawPassSum * 0.95) / 100) * 100 : rawPassSum;
  const saving = gateSum - finalPass;
  const pct = Math.round((saving / gateSum) * 100);

  const lock = () => {
    if (count === 0) return;
    onLock({
      title: `Custom ${d.name} Pass (${count} Sights)`,
      destinationName: d.name,
      items: chosen,
      gatePrice: gateSum,
      passPrice: finalPass,
      savings: saving,
      savingsPct: pct,
    });
  };

  return (
    <div className="stack-y-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 -mx-4 px-4">
        {BYOP_CATEGORIES.map(([cat, label]) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategory(cat)}
            className={
              cat === category
                ? "px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2D1E18] text-white shrink-0"
                : "px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-neutral-600 border border-orange-200 shrink-0"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="stack-y-4">
        {filtered.map((u) => {
          const isSel = selected.includes(u.id);
          const gatePrice = gatePriceOf(u);
          const passPrice = passPriceOf(u);
          return (
            <div
              key={u.id}
              className={`rounded-3xl bg-white border ${
                isSel ? "border-[#E05A47] ring-2 ring-[#E05A47]/30 shadow-md" : "border-orange-100"
              } p-4 flex gap-3 items-center`}
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image */}
                <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 stack-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold px-1.5 rounded-sm bg-neutral-100 text-neutral-600">{u.duration}</span>
                  <span className="text-[9px] font-bold text-emerald-600">Save ₹{inr(gatePrice - passPrice)}</span>
                </div>
                <h4 className="text-xs font-bold text-[#2D1E18] truncate">{u.name}</h4>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-neutral-400 line-through">₹{inr(gatePrice)}</span>
                  <span className="text-xs font-extrabold text-[#E05A47]">₹{inr(passPrice)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggle(u.id)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 ${
                  isSel ? "bg-emerald-600 text-white" : "bg-orange-50 text-[#E05A47] border border-orange-200"
                }`}
              >
                {isSel ? "✓" : "+ Add"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Mobile Pass Calculator Bar */}
      <div className="sticky bottom-3 z-30 p-3.5 rounded-2xl bg-[#1C120C]/95 backdrop-blur-xl text-white border border-white/15 shadow-2xl stack-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">{count}</span>
            <span className="text-neutral-300 text-[11px]">
              {count === 0 ? "Select 2+ attractions" : `Save ₹${inr(saving)} (${pct}% Off)`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-neutral-400 text-[10px] line-through mr-1">₹{count === 0 ? 0 : inr(gateSum)}</span>{" "}
            <span className="font-extrabold text-[#FDE68A] text-sm">₹{count === 0 ? 0 : inr(finalPass)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={lock}
          disabled={count === 0}
          className="w-full py-2.5 rounded-xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] hover:opacity-95 disabled:opacity-40 font-extrabold text-xs text-white shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Lock In Custom Pass for ₹1,999</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

export function PackagesList({
  destination: d,
  category,
  onSelect,
}: {
  destination: Destination;
  category: MobileCategory;
  onSelect: (pkg: TourPackage) => void;
}) {
  const filtered = (d.packages || []).filter((p) => p.category === category);

  return (
    <div className="stack-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#2D1E18] tracking-tight">Curated Packages</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Authentic resorts &amp; handpicked excursions.</p>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-orange-100 text-[#E05A47]">{filtered.length} Tiers Available</span>
      </div>

      <div className="stack-y-6">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-3xl bg-white border border-orange-100 shadow-xs overflow-hidden flex flex-col">
            {/* Image & Badges */}
            <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image */}
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t/srgb from-black/60 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">{p.duration}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-extrabold uppercase">{p.tierLabel}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                <div>
                  <span className="text-xs text-amber-200 block">{p.groupLabel}</span>
                  <span className="text-xl font-black">₹{inr(p.price)}</span>
                </div>
                <span className="text-xs font-extrabold bg-[#E05A47] px-2.5 py-1 rounded-xl">₹1,999 Token</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 stack-y-4">
              <div>
                <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                  {"★".repeat(p.hotel.stars || 4)} {"☆".repeat(5 - (p.hotel.stars || 4))}
                  <span className="text-neutral-500 font-semibold text-[11px] ml-1">{p.hotel.stars}-Star Resort</span>
                </div>
                <h3 className="text-base font-black text-[#2D1E18]">{p.hotel.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{p.hotel.desc}</p>
              </div>

              {/* Activities */}
              <div className="stack-y-1.5 pt-2 border-t border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Included Excursions</span>
                {p.activities.map((act, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-neutral-700">
                    <span className="truncate pr-2">• {act.name}</span>
                    <span className="text-[10px] text-neutral-400 shrink-0">{act.duration}</span>
                  </div>
                ))}
              </div>

              {/* Inclusions */}
              <div className="stack-y-1 pt-2 border-t border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Package Inclusions</span>
                <div className="grid grid-cols-1 gap-1 text-xs text-neutral-600">
                  {p.inclusions.slice(0, 3).map((inc, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="truncate">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="w-full py-3 rounded-2xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-[#E05A47]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <span>Lock In This Package for ₹1,999</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
