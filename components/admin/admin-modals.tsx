"use client";

import { useRef, type FormEvent } from "react";

import { BOOKING_STAGES, type Booking } from "@/lib/bookings";

const label = "block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1";
const input =
  "w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E05A47] focus:outline-hidden";

export interface BookingFormValues {
  refId: string;
  guest: string;
  phone: string;
  pkg: string;
  travelDate: string;
  total: number;
  tokenPaid: number;
  stage: string;
  isBooked: boolean;
  notes: string;
}

function ModalFrame({ maxWidth, space, children }: { maxWidth: string; space: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full ${maxWidth} rounded-3xl bg-[#0F0F0F] border border-[#2A2A2A] shadow-2xl p-6 ${space}`}>{children}</div>
    </div>
  );
}

/** Add / edit manual booking. `booking` null = new booking with desk defaults. */
export function BookingFormModal({
  booking,
  defaultTravelDate,
  onClose,
  onSave,
}: {
  booking: Booking | null;
  defaultTravelDate: string;
  onClose: () => void;
  onSave: (values: BookingFormValues) => void;
}) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    onSave({
      refId: booking?.refId ?? "",
      guest: get("guest").trim(),
      phone: get("phone").trim(),
      pkg: get("pkg").trim(),
      travelDate: get("travelDate"),
      total: parseInt(get("total") || "0"),
      tokenPaid: parseInt(get("tokenPaid") || "0"),
      stage: get("stage"),
      isBooked: get("supplierBooked") === "true",
      notes: get("notes").trim(),
    });
  };

  return (
    <ModalFrame maxWidth="max-w-lg" space="space-y-5">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <h3 className="text-base font-bold text-white">{booking ? `Edit Booking: ${booking.refId}` : "+ Add Manual Booking"}</h3>
        <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white cursor-pointer text-sm">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 font-sans">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Guest Full Name *</label>
            <input type="text" name="guest" required placeholder="e.g. Rahul Sharma" defaultValue={booking?.guest || ""} className={input} />
          </div>
          <div>
            <label className={label}>WhatsApp Phone *</label>
            <input type="tel" name="phone" required placeholder="+91 98765 43210" defaultValue={booking?.phone || ""} className={input} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Trip / Package *</label>
            <input
              type="text"
              name="pkg"
              required
              placeholder="Romantic Lagoon & Sunset Catamaran"
              defaultValue={booking ? booking.pkg || "" : "Romantic Lagoon & Sunset Catamaran Escape"}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Travel Date *</label>
            <input
              type="date"
              name="travelDate"
              required
              defaultValue={booking ? booking.travelDate || "" : defaultTravelDate}
              className={input}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Total Package Price (₹) *</label>
            <input type="number" name="total" required placeholder="214382" defaultValue={booking ? booking.total || 0 : "214382"} className={input} />
          </div>
          <div>
            <label className={label}>Token Paid (₹)</label>
            <input type="number" name="tokenPaid" placeholder="0" defaultValue={booking ? booking.tokenPaid || 0 : "0"} className={input} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Lifecycle Stage</label>
            <select name="stage" defaultValue={booking?.stage || "NEW_LEAD"} className={`${input} cursor-pointer`}>
              {BOOKING_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Supplier Booked?</label>
            <select name="supplierBooked" defaultValue={booking?.isBookedWithSupplier ? "true" : "false"} className={`${input} cursor-pointer`}>
              <option value="false">🔴 Not Booked Yet</option>
              <option value="true">🟢 Booked (Done)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={label}>Supplier Ref / Hotel Confirmation / Notes</label>
          <input
            type="text"
            name="notes"
            placeholder="e.g. RateHawk Booking #98214, PNR: 6X9K"
            defaultValue={booking?.supplierNotes || ""}
            className={input}
          />
        </div>

        <div className="pt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-xl bg-linear-to-r from-[#E05A47] to-[#EA580C] hover:opacity-95 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
          >
            Save Booking
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

/** Supplier booking toggle & notes. */
export function SupplierStatusModal({
  booking,
  onClose,
  onSave,
}: {
  booking: Booking;
  onClose: () => void;
  onSave: (isBooked: boolean, notes: string) => void;
}) {
  const statusRef = useRef<HTMLSelectElement>(null);
  const notesRef = useRef<HTMLInputElement>(null);

  return (
    <ModalFrame maxWidth="max-w-md" space="space-y-4">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <h3 className="text-sm font-bold text-white">Update Supplier Booking Status</h3>
        <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white cursor-pointer text-sm">
          ✕
        </button>
      </div>

      {/* Not a <form> (as in the original): Enter in the notes field does not save. */}
      <div className="space-y-3 font-sans">
        <p className="text-xs text-neutral-300">
          Booking: {booking.refId} — {booking.guest} ({booking.pkg})
        </p>

        <div>
          <label className={label}>Status (क्या आपने होटल/RateHawk बुक किया?)</label>
          <select
            ref={statusRef}
            defaultValue={booking.isBookedWithSupplier ? "true" : "false"}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E05A47] focus:outline-hidden cursor-pointer"
          >
            <option value="false">🔴 Not Booked Yet (होटल अभी बुक नहीं हुआ)</option>
            <option value="true">🟢 Booked (Done) — होटल / RateHawk में बुकिंग हो चुकी है</option>
          </select>
        </div>

        <div>
          <label className={label}>Supplier Confirmation # / PNR / Notes</label>
          <input
            ref={notesRef}
            type="text"
            placeholder="e.g. RateHawk #100234, PNR: 4B9K2"
            defaultValue={booking.supplierNotes || booking.supplierBookingRef || ""}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E05A47] focus:outline-hidden"
          />
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(statusRef.current?.value === "true", notesRef.current?.value.trim() ?? "")}
            className="flex-1 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
          >
            Save Status
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
