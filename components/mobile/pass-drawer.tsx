"use client";

import confetti from "canvas-confetti";
import { useState, type FormEvent } from "react";

import { BOOKINGS_API } from "@/lib/bookings";

const inr = (n: number) => n.toLocaleString("en-IN");
const TOKEN = 1999;

export interface PassBookingData {
  title: string;
  destinationName: string;
  items: { name: string; passPrice?: number; price?: number }[];
  gatePrice: number;
  passPrice: number;
  savings: number;
  savingsPct: number;
  bookingType?: string;
}

interface Confirmation {
  refId: string;
  balance: number;
  waHref: string;
}

/** Digital attraction pass checkout: lock any pass with the ₹1,999 token. */
export function PassDrawer({ data, destinationKey, onClose }: { data: PassBookingData; destinationKey: string; onClose: () => void }) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const handleMobilePassSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const phone = String(f.get("phone") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const month = String(f.get("month") ?? "");

    const refId = "PPTRV-PASS-" + Math.floor(1000 + Math.random() * 9000);
    const balance = Math.max(0, data.passPrice - TOKEN);

    const newBooking = {
      refId,
      createdAt: new Date().toISOString(),
      bookingType: data.bookingType || "CURATED_PASS",
      guest: name,
      phone: "+91 " + phone,
      email,
      destination: data.destinationName,
      destinationKey,
      flag: "PASS",
      pkg: data.title,
      total: data.passPrice,
      tokenPaid: TOKEN,
      balance,
      comfortDate: month,
      cutoffDate: "2026-11-30",
      cutoffBufferHours: 48,
      stage: "TOKEN_LOCKED",
      lastAction: "Booked online via Mobile Holiday Pass (Token ₹1,999 recorded)",
      inclusions: data.items ? data.items.map((i) => i.name) : [],
      dmcPartner: { id: null, name: "Unassigned Partner", status: "PENDING_DISPATCH" },
    };

    // Resilient local storage
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("passprive_bookings") || "[]");
      const list = Array.isArray(stored) ? stored : [];
      list.unshift(newBooking);
      localStorage.setItem("passprive_bookings", JSON.stringify(list));
    } catch (err) {
      console.warn("localStorage save warning:", err);
    }

    // Server persistence
    fetch(BOOKINGS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newBooking) })
      .then((r) => r.json())
      .then((res) => console.log("Mobile booking stored to server:", res))
      .catch((err) => console.warn("Server storage offline (saved in localStorage):", err));

    void confetti({ particleCount: 70, spread: 60 });

    const waMsg = encodeURIComponent(
      `Hi PassPrivé! I have locked the ${data.title} with the ₹1,999 token.\n\n` +
        `• Ref: ${refId}\n` +
        `• Destination: ${data.destinationName}\n` +
        `• Guest: ${name} (+91 ${phone})\n` +
        `• Travel Month: ${month}\n` +
        `• Pass Value: ₹${inr(data.passPrice)} (Saved ${data.savingsPct}%)\n` +
        `• Token: ₹1,999 (Balance: ₹${inr(balance)})\n\n` +
        `Please connect to issue my digital QR vouchers!`,
    );

    setConfirmation({ refId, balance, waHref: `https://wa.me/917838215147?text=${waMsg}` });
  };

  const field = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-[#E05A47] outline-hidden";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[92vh] overflow-y-auto p-5 stack-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E05A47]">Digital Attraction Pass</span>
            <h3 className="text-base font-extrabold text-[#2D1E18]">{data.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-800 text-lg">
            ✕
          </button>
        </div>

        <div className="stack-y-4">
          {confirmation ? (
            <div className="text-center py-4 stack-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 font-black text-2xl flex items-center justify-center mx-auto animate-bounce">
                ✓
              </div>
              <div>
                <h4 className="text-lg font-black text-[#2D1E18]">Pass Confirmed!</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Booking Ref: <strong className="font-mono text-[#2D1E18]">{confirmation.refId}</strong>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-left stack-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Pass:</span>
                  <span className="font-bold text-neutral-800 truncate max-w-[180px]">{data.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token Paid:</span>
                  <span className="font-bold text-emerald-600">₹1,999</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance Due:</span>
                  <span className="font-bold text-amber-600">₹{inr(confirmation.balance)}</span>
                </div>
              </div>

              <a
                href={confirmation.waHref}
                target="_blank"
                className="block w-full py-3.5 rounded-2xl bg-[#25D366] text-white font-extrabold text-xs shadow-md text-center"
              >
                Open WhatsApp Concierge Now →
              </a>
              <button type="button" onClick={onClose} className="w-full py-2 rounded-xl text-xs text-neutral-500 hover:bg-neutral-100">
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-neutral-900 text-white stack-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Official PassPrivé Pass</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-white/10 text-emerald-300">60-Day Pass</span>
                </div>
                <div className="stack-y-1 text-xs">
                  {data.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-neutral-300">
                      <span>• {it.name}</span>
                      <span>₹{inr((it.passPrice || it.price) ?? 0)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline text-xs">
                  <span className="text-neutral-400">
                    Total Savings: ₹{inr(data.savings)} ({data.savingsPct}%)
                  </span>
                  <span className="text-base font-black text-[#FDE68A]">₹{inr(data.passPrice)}</span>
                </div>
              </div>

              <form onSubmit={handleMobilePassSubmit} className="stack-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Full Name</label>
                  <input type="text" name="name" required placeholder="Rohan Sharma" className={field} />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">WhatsApp Phone (+91)</label>
                  <input type="tel" name="phone" required placeholder="7838215147" pattern="[0-9]{10}" className={field} />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Email</label>
                  <input type="email" name="email" required placeholder="rohan@example.com" className={field} />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Travel Month</label>
                  <select name="month" className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white outline-hidden">
                    <option>October 2026</option>
                    <option>November 2026</option>
                    <option>December 2026 (Festive)</option>
                    <option>January 2027</option>
                    <option>February 2027</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 stack-y-1">
                  <div className="flex justify-between font-bold text-[#E05A47]">
                    <span>Pay Today:</span>
                    <span>₹1,999 Entry Token</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Remaining Balance:</span>
                    <span>₹{inr(Math.max(0, data.passPrice - TOKEN))} (Pay on confirmation)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] text-white font-extrabold text-sm shadow-md cursor-pointer"
                >
                  Lock In Pass for ₹1,999 →
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
