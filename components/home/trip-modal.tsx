"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

import { BOOKINGS_API } from "@/lib/bookings";
import {
  cancellationDeadline,
  computeDateFactors,
  datePricedItem,
  formatFriendlyDate,
  getTodayStr,
  inr,
  RESORT_STAY,
  type Trip,
} from "@/lib/trips";
import { waLink } from "@/lib/whatsapp";
import type { RatesResponse } from "@/lib/server/rates";

import { UserIcon } from "./icons";
import { btnPrimaryUnsized } from "./styles";
import { useTripPlanner } from "./trip-planner";

/** Values from /api/rates, tied to the travel date they were fetched for. */
interface LiveRates {
  date: string;
  rateBadge?: string;
  roomPrice?: number;
  diningPrice?: number;
  deadline?: string;
}

const itemKey = (category: string, index: number) => `${category}::${index}`;

function initialChecks(trip: Trip): Record<string, boolean> {
  const checks: Record<string, boolean> = {};
  for (const [category, items] of Object.entries(trip.categories)) {
    items.forEach((item, i) => (checks[itemKey(category, i)] = item.checked));
  }
  return checks;
}

export function TripModal() {
  const { modalOpen, modalSession, activeTrip, selectedTravelDate, closeModal } = useTripPlanner();
  if (!modalOpen || !selectedTravelDate) return null;

  return (
    <div
      id="trip-modal"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
      className="fixed inset-0 z-[500] bg-[rgba(26,20,14,0.65)] backdrop-blur-[6px] flex items-center justify-center p-4"
    >
      {/* Remount per open so the checklist and contact fields start from their defaults. */}
      <TripModalDialog key={modalSession} trip={activeTrip} travelDate={selectedTravelDate} />
    </div>
  );
}

function TripModalDialog({ trip, travelDate }: { trip: Trip; travelDate: string }) {
  const { setSelectedTravelDate, closeModal } = useTripPlanner();
  const [checks, setChecks] = useState(() => initialChecks(trip));
  const [live, setLive] = useState<LiveRates | null>(null);
  const [todayStr] = useState(getTodayStr);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // ── Async Live RateHawk API Sync (refetched whenever the travel date changes) ──
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/rates?trip=${encodeURIComponent(trip.id)}&checkin=${encodeURIComponent(travelDate)}&nights=5`)
      .then((r) => r.json() as Promise<RatesResponse>)
      .then((data) => {
        if (cancelled || !data) return;
        const next: LiveRates = { date: travelDate, rateBadge: data.yield_model?.rate_badge || undefined };
        if (data.yield_model?.is_live_api && data.pricing) {
          next.roomPrice = data.pricing.hotel_room_inr || undefined;
          next.diningPrice = data.pricing.hotel_dining_inr || undefined;
          next.deadline = data.cancellation_guarantee?.customer_free_cancellation_display || undefined;
        }
        setLive(next);
      })
      .catch(() => {
        // The client-side yield engine already prices everything.
      });
    return () => {
      cancelled = true;
    };
  }, [trip.id, travelDate]);

  // ── Dynamic pricing: date yield factors, optionally overridden by a live RateHawk rate ──
  const factors = computeDateFactors(travelDate);
  const liveForDate = live?.date === travelDate ? live : null;
  const rateBadge = liveForDate?.rateBadge ?? factors.rateBadge;
  const deadlineText = liveForDate?.deadline ?? cancellationDeadline(travelDate) ?? "...";

  const categories = Object.entries(trip.categories).map(([category, items]) => ({
    category,
    items: items.map((item, i) => {
      const livePrice =
        item.stayType === "room" ? liveForDate?.roomPrice : item.stayType === "dining" ? liveForDate?.diningPrice : undefined;
      return {
        ...item,
        key: itemKey(category, i),
        // Tag colour is fixed when the modal opens, from the base item price.
        isPaid: datePricedItem(category, item, factors) > 0,
        price: livePrice ?? datePricedItem(category, item, factors),
      };
    }),
  }));

  let stayTotal = 0;
  let flightsTotal = 0;
  let toursTotal = 0;
  let hasStay = false;
  let hasFlights = false;
  const checkedLabels: string[] = [];
  for (const { category, items } of categories) {
    for (const item of items) {
      if (!checks[item.key]) continue;
      checkedLabels.push(item.label);
      if (category === RESORT_STAY) {
        stayTotal += item.price;
        hasStay = true;
      } else if (item.isFlight) {
        flightsTotal += item.price;
        hasFlights = true;
      } else {
        toursTotal += item.price;
      }
    }
  }
  const grandTotal = stayTotal + flightsTotal + toursTotal;
  const checkedCount = checkedLabels.length;
  const friendlyDate = formatFriendlyDate(travelDate);

  // WhatsApp link with the exact custom breakdown (used if the link is opened without the click handler).
  let planMsg =
    `Hi! I want to customize the "${trip.title}" (${trip.forWho}) with PassPrivé Travel.\n\n` +
    `• Travel Date: ${friendlyDate} (5 Nights · ${factors.rateBadge})\n` +
    `• Customized Package: ₹${inr(grandTotal)}\n`;
  if (hasFlights) planMsg += `• Fixed Return Flights: DEL ⇄ MRU (Sir Seewoosagur) · ₹${inr(flightsTotal)}\n`;
  if (hasStay && deadlineText) planMsg += `• Free Cancellation until: ${deadlineText} (100% full refund guarantee)\n`;
  planMsg +=
    `\nSelected Items (${checkedCount}):\n${checkedLabels.map((l) => `• ${l}`).join("\n")}\n\n` +
    `Please confirm live availability for my travel dates.`;

  // ── Send Plan to WhatsApp (validates details, sends rich text & logs the lead for the admin panel) ──
  const handleSendPlanWhatsApp = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const guestName = nameRef.current?.value.trim() ?? "";
    const guestPhone = phoneRef.current?.value.trim() ?? "";
    if (!guestName || !guestPhone) {
      alert("कृपया अपना नाम और WhatsApp नंबर दर्ज करें ताकि हम आपकी पूरी कस्टमाइज्ड ट्रिप डीटेल्स भेज सकें।");
      if (!guestName) nameRef.current?.focus();
      else phoneRef.current?.focus();
      return;
    }

    let msg =
      `*PassPrivé Travel — Curated Mauritius Trip Plan*\n\n` +
      `👤 *Guest Name:* ${guestName}\n` +
      `📱 *WhatsApp Number:* ${guestPhone}\n\n` +
      `🌴 *Curated Trip:* ${trip.title} (${trip.forWho})\n` +
      `📅 *Travel Date:* ${friendlyDate} (5 Nights · ${factors.rateBadge})\n` +
      `💰 *Customized Package Total:* ₹${inr(grandTotal)}\n\n`;
    if (hasStay) msg += `🏨 *Resort Stay (5 Nights):* ₹${inr(stayTotal)}\n`;
    if (hasFlights) msg += `✈️ *Fixed Return Flights:* DEL ⇄ MRU (Sir Seewoosagur) · ₹${inr(flightsTotal)}\n`;
    msg += `🚗 *Private SUV & Island Excursions:* ₹${inr(toursTotal)}\n` + `👑 *PassPrivé VIP App:* Included Free (worth ₹13,500)\n`;
    if (hasStay && deadlineText) msg += `🛡️ *Free Cancellation until:* ${deadlineText} (100% full refund guarantee)\n`;
    msg +=
      `\n📋 *Selected Custom Inclusions (${checkedLabels.length}):*\n` +
      checkedLabels.map((item) => `• ${item}`).join("\n") +
      `\n\nPlease confirm resort & flight availability for my dates.`;

    // Log the lead so it shows up in the admin bookings grid.
    fetch(BOOKINGS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest: guestName,
        phone: guestPhone,
        destination: "Mauritius",
        pkg: `${trip.title} (${trip.forWho})`,
        travelDate,
        duration: "5 Nights · 6 Days",
        total: grandTotal,
        tokenPaid: 0,
        balance: grandTotal,
        stage: "NEW_LEAD",
        isBookedWithSupplier: false,
        source: "Website WhatsApp Plan Customizer",
        inclusions: checkedLabels,
      }),
    }).catch((err) => console.warn("/api/bookings log error:", err));

    window.open(waLink(msg), "_blank");
  };

  const pricingRow = "flex justify-between items-center text-[0.86rem] text-pp-inksoft";
  const pricingStrong = "text-pp-ink font-bold font-display";

  return (
    <div className="bg-pp-sand rounded-3xl w-full max-w-[600px] max-h-[88svh] overflow-y-auto pt-7 px-6 pb-[22px] relative shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-mob:px-4 max-mob:py-5 max-mob:rounded-[20px]">
      <div className="mb-4 pr-8">
        <span className="inline-block bg-pp-mint text-pp-teal font-display text-[0.72rem] font-extrabold uppercase tracking-[0.06em] px-2.5 py-[3px] rounded-full mb-1.5">
          {trip.forWho} · {trip.duration}
        </span>
        <h3 className="font-display text-[1.25rem] font-extrabold text-pp-ink leading-[1.2] tracking-[-0.02em]">{trip.title}</h3>
        <p className="text-[0.84rem] text-pp-inksoft mt-[3px]">
          Tick or untick anything below. We share your exact custom rate on WhatsApp.
        </p>
      </div>
      <button
        type="button"
        onClick={closeModal}
        aria-label="Close"
        className="absolute top-[18px] right-5 bg-[rgba(26,20,14,0.08)] border-none rounded-full w-8 h-8 cursor-pointer text-[1.2rem] [font-family:system-ui] text-pp-ink flex items-center justify-center"
      >
        &times;
      </button>

      <div>
        {/* Travel dates bar */}
        <div className="bg-white px-3.5 py-3 rounded-[14px] mb-4 border border-[rgba(26,20,14,0.08)] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 w-full justify-between">
            <label htmlFor="travel-date-input" className="text-[0.82rem] font-bold text-pp-ink font-display whitespace-nowrap">
              Travel Date:
            </label>
            <input
              type="date"
              id="travel-date-input"
              defaultValue={travelDate}
              min={todayStr}
              onChange={(e) => {
                if (e.target.value) setSelectedTravelDate(e.target.value);
              }}
              className="border-[1.5px] border-[rgba(26,20,14,0.14)] rounded-lg px-3 py-1.5 font-display text-[0.84rem] font-bold text-pp-ink bg-pp-sandwarm outline-none cursor-pointer focus:border-pp-teal"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[0.74rem] font-extrabold text-pp-teal bg-pp-mint px-3 py-[5px] rounded-full whitespace-nowrap">
              5 Nights Stay
            </span>
            <span
              id="modal-rate-badge"
              className="text-[0.74rem] font-bold text-[#0f766e] bg-[#f0fdfa] border border-[rgba(15,118,110,0.25)] px-3 py-[5px] rounded-full whitespace-nowrap transition-all duration-[250ms] ease-[ease]"
            >
              {rateBadge}
            </span>
          </div>
        </div>

        {/* Checklist */}
        {categories.map(({ category, items }, i) => (
          <div key={category} className="mb-4">
            <div className="font-display text-[0.76rem] font-extrabold uppercase tracking-[0.06em] text-pp-teal mb-2 flex justify-between">
              <span>
                {i + 1}. {category}
              </span>
              <span className="text-[0.72rem] font-semibold text-pp-inksoft normal-case">Tick / untick to customize</span>
            </div>
            <div className="flex flex-col gap-[7px]">
              {items.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 bg-white px-3 py-[9px] rounded-[10px] cursor-pointer text-[0.86rem] text-pp-ink border border-[rgba(26,20,14,0.05)]"
                >
                  <input
                    type="checkbox"
                    value={item.label}
                    checked={!!checks[item.key]}
                    onChange={(e) => setChecks((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                    className="accent-pp-teal w-4 h-4 shrink-0"
                  />
                  <span className="flex-1">{item.label}</span>
                  <span className={`text-[0.78rem] font-bold ${item.isPaid ? "text-pp-inksoft" : "text-pp-teal"}`}>
                    {item.price > 0 ? `+₹${inr(item.price)}` : "Included"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Live price breakdown (recalculated on every tick / untick) */}
        <div className="bg-white rounded-2xl px-[18px] py-4 mt-3.5 border border-[rgba(26,20,14,0.08)] flex flex-col gap-[9px]">
          {hasStay && (
            <div className={pricingRow}>
              <span>All-Inclusive Resort Stay (5 Nights):</span>
              <strong className={pricingStrong}>₹{inr(stayTotal)}</strong>
            </div>
          )}
          {hasFlights && (
            <div className={pricingRow}>
              <span>Fixed Return Flights (DEL ⇄ MRU):</span>
              <strong className={pricingStrong}>₹{inr(flightsTotal)}</strong>
            </div>
          )}
          <div className={pricingRow}>
            <span>Private SUV &amp; Island Excursions:</span>
            <strong className={pricingStrong}>₹{inr(toursTotal)}</strong>
          </div>
          <div className={pricingRow}>
            <span>PassPrivé VIP App (Tables &amp; Cashback):</span>
            {/* The row's `strong` styles out-ranked the badge's own colour and weight in the original CSS. */}
            <strong className="bg-pp-orange text-pp-ink font-bold font-display text-[0.68rem] px-[7px] py-0.5 rounded-[5px]">
              INCLUDED FREE (₹13,500)
            </strong>
          </div>
          <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-[rgba(26,20,14,0.15)] text-[0.96rem] text-pp-ink font-extrabold">
            <span>Total Package Price:</span>
            <strong className="text-[1.25rem] text-pp-teal font-bold font-display">₹{inr(grandTotal)}</strong>
          </div>
        </div>

        {/* Guest contact details */}
        <div className="bg-white rounded-2xl px-4 py-3.5 mt-3.5 border border-[rgba(26,20,14,0.08)]">
          <div className="font-display text-[0.78rem] font-extrabold text-pp-teal uppercase tracking-[0.05em] mb-2 flex items-center gap-1.5">
            <UserIcon />
            <span>Your Details to Receive Live Plan &amp; Availability</span>
          </div>
          <div className="grid grid-cols-[1fr_1fr] gap-2.5 max-[600px]:grid-cols-[1fr]">
            <div className="flex flex-col gap-1">
              <label htmlFor="modal-guest-name" className="text-[0.74rem] font-bold text-pp-inksoft">
                Your Full Name *
              </label>
              <input
                ref={nameRef}
                type="text"
                id="modal-guest-name"
                placeholder="e.g. Rahul Sharma"
                required
                className={guestInput}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="modal-guest-phone" className="text-[0.74rem] font-bold text-pp-inksoft">
                WhatsApp Number *
              </label>
              <input
                ref={phoneRef}
                type="tel"
                id="modal-guest-phone"
                placeholder="e.g. 98765 43210"
                required
                className={guestInput}
              />
            </div>
          </div>
        </div>

        {/* Handwritten free-cancellation guarantee (1-day safety buffer applied) */}
        {hasStay && (
          <div className="text-center pt-2.5 px-3 pb-1 mt-1">
            <span className="font-hand text-[1.45rem] text-pp-teal font-bold leading-[1.25] inline-block">
              ~ free cancellation until <span id="modal-cancel-deadline">{deadlineText}</span> &middot; 100% full refund
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-[rgba(26,20,14,0.1)] pt-4 mt-3 flex items-center justify-between flex-wrap gap-2.5">
        <div>
          <p className="font-display text-[0.9rem] font-extrabold text-pp-ink">{checkedCount} items selected</p>
          <p className="text-[0.78rem] text-pp-inksoft">Custom rate on WhatsApp · Free VIP App included</p>
        </div>
        <div className="flex gap-2 max-mob:flex-col max-mob:w-full">
          <a
            href={waLink(planMsg)}
            onClick={handleSendPlanWhatsApp}
            className={`${btnPrimaryUnsized} text-[0.95rem] px-6 py-3 cursor-pointer max-mob:w-full max-mob:justify-center`}
          >
            Send Plan to WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

const guestInput =
  "border border-[rgba(26,20,14,0.14)] rounded-[10px] px-3 py-[9px] text-[0.85rem] font-[inherit] text-pp-ink bg-pp-sandwarm outline-none transition-[border-color] duration-200 focus:border-pp-teal focus:bg-white";
