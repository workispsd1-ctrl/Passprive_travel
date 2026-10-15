"use client";

import confetti from "canvas-confetti";
import { useState, type FormEvent } from "react";

import type { Destination, TourPackage } from "@/lib/catalog";

const inr = (n: number) => n.toLocaleString("en-IN");
const TOKEN = 1999;

/** e.g. PPTRV-20261014-482 */
const newBookingRef = () => "PPTRV-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(100 + Math.random() * 900);

export type UpsellFilter = "all" | "hotel" | "activity" | "transfer" | "dining";

export interface BookingDrawerState {
  regions: string[];
  flightsEnabled: boolean;
  departureCity: string;
  upsells: string[];
  upsellCategory: UpsellFilter;
  /**
   * Bumped on every change. The original rebuilt the whole drawer (innerHTML) on each
   * toggle, which reset the traveler fields and any confirmation; keying on this keeps that.
   */
  renderId: number;
}

export function calculateMobileTotals(d: Destination, pkg: TourPackage, s: BookingDrawerState) {
  let total = pkg.price;

  // Region extras (2 nights per added region)
  let regionCost = 0;
  (d.regions || []).forEach((r) => {
    if (s.regions.includes(r.id) && !r.included) regionCost += (r.extraCostPerNight || 3000) * 2;
  });
  total += regionCost;

  // Flights (2 travelers base)
  let flightCost = 0;
  if (s.flightsEnabled && d.flightMatrix && d.flightMatrix.cityAverages) {
    const cityData = d.flightMatrix.cityAverages[s.departureCity] || Object.values(d.flightMatrix.cityAverages)[0];
    flightCost = (cityData.avgFare || 35000) * 2;
    total += flightCost;
  }

  // Upsells
  let upsellCost = 0;
  (d.upsells || []).forEach((u) => {
    if (!s.upsells.includes(u.id)) return;
    if (u.priceType === "per_night") upsellCost += u.price * 5;
    else if (u.priceType === "per_booking") upsellCost += u.price;
    else upsellCost += u.price * 2;
  });
  total += upsellCost;

  return { grandTotal: total, balance: Math.max(0, total - TOKEN), flightCost, upsellCost, regionCost };
}

const UPSELL_FILTERS: [UpsellFilter, string][] = [
  ["all", "All"],
  ["hotel", "Hotels"],
  ["activity", "Tours"],
  ["transfer", "Transfers"],
  ["dining", "Dining"],
];

export function BookingDrawer({
  destination: d,
  pkg,
  state,
  onChange,
  onClose,
}: {
  destination: Destination;
  pkg: TourPackage;
  state: BookingDrawerState;
  onChange: (patch: Partial<BookingDrawerState>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col justify-end" onClick={onClose}>
      <div className="w-full bg-[#FFFDF9] rounded-t-3xl p-5 stack-y-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-neutral-300 mx-auto mb-1" />

        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E05A47]">Fast-Track Booking</span>
            <h3 className="font-extrabold text-base text-[#2D1E18]">Lock in for ₹1,999</h3>
            <p className="text-[11px] text-neutral-500">
              {d.name} {d.flag} — {pkg.fullName || pkg.name}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-800 font-bold p-1 text-lg">
            ✕
          </button>
        </div>

        <DrawerContent key={state.renderId} d={d} pkg={pkg} s={state} onChange={onChange} />
      </div>
    </div>
  );
}

interface BookingResult {
  refId: string;
  desc: string;
  waHref: string;
}

function DrawerContent({
  d,
  pkg,
  s,
  onChange,
}: {
  d: Destination;
  pkg: TourPackage;
  s: BookingDrawerState;
  onChange: (patch: Partial<BookingDrawerState>) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const totals = calculateMobileTotals(d, pkg, s);
  const flightMatrix = d.flightMatrix || ({} as Destination["flightMatrix"]);
  const cityAverages = flightMatrix.cityAverages || {};
  const upsells = d.upsells || [];
  const filteredUpsells = s.upsellCategory === "all" ? upsells : upsells.filter((u) => u.category === s.upsellCategory);

  const toggleRegion = (regId: string) => {
    const reg = (d.regions || []).find((r) => r.id === regId);
    if (reg && reg.included) return; // base region cannot be removed
    onChange({ regions: s.regions.includes(regId) ? s.regions.filter((id) => id !== regId) : [...s.regions, regId] });
  };

  const toggleUpsell = (id: string) =>
    onChange({ upsells: s.upsells.includes(id) ? s.upsells.filter((x) => x !== id) : [...s.upsells, id] });

  const handleMobileBookingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const phone = String(f.get("phone") ?? "").trim() || "7838215147";
    setSubmitting(true);

    const refId = newBookingRef();

    void confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    const waText = encodeURIComponent(
      `Hi PassPrive! I locked in my holiday booking ${refId} for ${d.name} (${pkg.name}) for ₹1,999 advance token. Total estimate: ₹${inr(totals.grandTotal)}. Please connect with my concierge!`,
    );

    setResult({
      refId,
      desc: `Your ₹1,999 token deposit for ${d.name} has been secured. Our concierge is messaging you on WhatsApp (+91 ${phone}) right now.`,
      waHref: `https://wa.me/917838215147?text=${waText}`,
    });
  };

  const field = "w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:border-[#E05A47] focus:outline-hidden";

  return (
    <div className="stack-y-4">
      <form onSubmit={handleMobileBookingSubmit} className="stack-y-4 text-xs">
        {/* Step A: Choose Regions */}
        <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 stack-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#2D1E18] uppercase text-[11px]">1. {d.name} Regions</span>
            <span className="text-[10px] text-[#E05A47] font-semibold">{s.regions.length} Selected</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(d.regions || []).map((reg) => {
              const isSel = s.regions.includes(reg.id);
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => toggleRegion(reg.id)}
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSel ? "border-[#E05A47] bg-white ring-1 ring-[#E05A47]" : "border-neutral-200 bg-white/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-[#2D1E18] truncate">{reg.name}</span>
                    <span className={`text-[9px] font-bold ${reg.included ? "text-emerald-600" : "text-[#E05A47]"}`}>
                      {reg.included ? "Base" : "+₹" + (reg.extraCostPerNight || 3000)}
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-400 truncate mt-0.5">{reg.tagline || ""}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B: Return Flights Option */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 stack-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#2D1E18] uppercase text-[11px]">2. Flights to {d.name}</span>
              <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-1 rounded-sm">{flightMatrix.destinationAirport || "Direct"}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={s.flightsEnabled} onChange={(e) => onChange({ flightsEnabled: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E05A47]" />
            </label>
          </div>

          {s.flightsEnabled ? (
            <div className="stack-y-1.5 pt-1">
              <select
                value={s.departureCity}
                onChange={(e) => onChange({ departureCity: e.target.value })}
                className="w-full p-2 rounded-xl border border-amber-200 bg-white text-xs font-semibold focus:outline-hidden"
              >
                {Object.entries(cityAverages).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name} ({code}) — {info.airline || ""} — Avg ₹{inr(info.avgFare)}/person
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-amber-800 leading-tight">✓ Flight total ₹{inr(totals.flightCost)} added. Zero booking fee markup.</div>
            </div>
          ) : (
            <p className="text-[10px] text-neutral-500 italic">Self-arranged flights. VIP airport transfer in {d.name} included.</p>
          )}
        </div>

        {/* Step C: Curated Enhancements / Upsells */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 stack-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#2D1E18] uppercase text-[11px]">3. Curated Upgrades ({upsells.length})</span>
            <span className="text-[10px] text-[#E05A47] font-semibold">{s.upsells.length} Added</span>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {UPSELL_FILTERS.map(([cat, label]) => (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ upsellCategory: cat })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer ${
                  s.upsellCategory === cat ? "bg-[#E05A47] text-white" : "bg-white text-neutral-600 border border-neutral-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Upsells List */}
          <div className="stack-y-1.5 max-h-48 overflow-y-auto pr-1">
            {filteredUpsells.map((u) => {
              const isSel = s.upsells.includes(u.id);
              const priceUnit = u.priceType === "per_night" ? "/n" : u.priceType === "per_booking" ? "/trip" : "/pp";
              return (
                <div
                  key={u.id}
                  onClick={() => toggleUpsell(u.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isSel ? "border-[#E05A47] bg-orange-50/70 ring-1 ring-[#E05A47]" : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog thumbnail */}
                    <img src={u.image} alt={u.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] text-[#2D1E18] truncate">{u.name}</div>
                      <div className="text-[9px] text-neutral-400 truncate">{u.badge || u.duration || ""}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-black text-[#E05A47]">
                      +₹{inr(u.price)}
                      <span className="text-[9px] text-neutral-400">{priceUnit}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={isSel}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleUpsell(u.id)}
                      className="w-3.5 h-3.5 accent-[#E05A47]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step D: Lead Traveler Form */}
        <div className="stack-y-2 pt-1">
          <span className="font-bold text-[#2D1E18] uppercase text-[11px] block">4. Lead Traveler Details</span>
          <div>
            <input type="text" name="guest" placeholder="Full Name (e.g. Aarav Sharma)" required className={field} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="tel" name="phone" placeholder="WhatsApp Number" required className={field} />
            <input type="email" name="email" placeholder="Email Address" required className={field} />
          </div>
          <div>
            <select name="month" className={`${field} cursor-pointer`}>
              <option>Target Month: October 2026</option>
              <option>Target Month: November 2026</option>
              <option>Target Month: December 2026 (Festive)</option>
              <option>Target Month: January 2027</option>
              <option>Target Month: February 2027</option>
              <option>Target Month: Flexible / Other</option>
            </select>
          </div>
        </div>

        {/* Step E: Total & ₹1,999 Deposit */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-orange-200 stack-y-2">
          <div className="flex justify-between text-neutral-600 text-xs">
            <span>Total Package Estimate:</span>
            <span className="font-extrabold text-[#2D1E18]">₹{inr(totals.grandTotal)}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-orange-100">
            <span className="text-[#E05A47]">Payable Today:</span>
            <span className="text-xl text-[#E05A47]">₹1,999</span>
          </div>
          <div className="text-[10px] text-neutral-500">
            ✓ Balance ₹{inr(totals.balance)} confirmed on your comfort call. 100% refundable within 48h.
          </div>
        </div>

        {!result && (
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] text-white font-extrabold text-sm shadow-md shadow-[#E05A47]/30 cursor-pointer active:scale-95 transition-transform"
          >
            {submitting ? "Securing ₹1,999 Token..." : "Confirm & Pay ₹1,999"}
          </button>
        )}
      </form>

      {/* Success Result Card */}
      {result && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 stack-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-800 uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">Booking Confirmed!</span>
            <span className="font-mono font-bold text-neutral-700">{result.refId}</span>
          </div>
          <p className="text-neutral-700 leading-relaxed">{result.desc}</p>
          <a href={result.waHref} target="_blank" className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2">
            <span>Open WhatsApp Concierge</span>
          </a>
        </div>
      )}
    </div>
  );
}
