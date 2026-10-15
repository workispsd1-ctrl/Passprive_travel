/**
 * PassPrivé Travel — Persistent Bookings & Leads API
 * Stores and manages customer bookings, manual bookings, lifecycle stages,
 * and supplier booking status (Booked vs Not Booked). Port of api/bookings.php.
 */
import { connection, type NextRequest } from "next/server";

import type { Booking } from "@/lib/bookings";
import { readBookings, withBookingsLock, writeBookings } from "@/lib/server/bookings-store";
import { asInput, corsHeaders, corsJson, readJsonBody } from "@/lib/server/http";
import {
  daysFromNow,
  formatYmd,
  formatYmdCompact,
  formatYmdHis,
  phpBool,
  phpEmpty,
  phpIntval,
  phpIsset,
  phpTrim,
} from "@/lib/server/php";

const METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const json = (body: Record<string, unknown>, status = 200, pretty = false) =>
  corsJson(body, { status, methods: METHODS, pretty });
const storageFailure = () => json({ success: false, error: "Storage write failure" }, 500);

export function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders(METHODS) });
}

// ── GET: Return All Bookings ──
export async function GET() {
  await connection();
  const bookings = await readBookings();
  return json({ success: true, count: bookings.length, bookings }, 200, true);
}

// ── POST: Create New Booking / Lead ──
export async function POST(request: NextRequest) {
  const input = asInput(await readJsonBody(request));
  if (!input) {
    return json({ success: false, error: "Invalid JSON payload" }, 400);
  }

  const now = new Date();
  const randomPart = 100 + Math.floor(Math.random() * 900);
  const refId = !phpEmpty(input.refId) ? phpTrim(input.refId) : `PPTRV-${formatYmdCompact(now)}-${randomPart}`;
  const str = (key: string, fallback: string) => (!phpEmpty(input[key]) ? phpTrim(input[key]) : fallback);

  const total = phpIsset(input.total) ? phpIntval(input.total) : 0;
  const tokenPaid = phpIsset(input.tokenPaid) ? phpIntval(input.tokenPaid) : 0;
  const balance = phpIsset(input.balance) ? phpIntval(input.balance) : Math.max(0, total - tokenPaid);
  const inclusions = input.inclusions;

  const newBooking: Booking = {
    refId,
    createdAt: formatYmdHis(now),
    guest: str("guest", "Guest"),
    phone: str("phone", ""),
    email: str("email", ""),
    destination: str("destination", "Mauritius"),
    pkg: str("pkg", "Customized Mauritius Plan"),
    travelDate: str("travelDate", formatYmd(daysFromNow(30, now))),
    duration: str("duration", "5 Nights · 6 Days"),
    total,
    tokenPaid,
    balance,
    comfortDate: str("comfortDate", "Pending Call"),
    cutoffDate: str("cutoffDate", formatYmd(daysFromNow(22, now))),
    cutoffBufferHours: 48,
    stage: str("stage", "NEW_LEAD"),
    isBookedWithSupplier: !phpEmpty(input.isBookedWithSupplier),
    supplierBookingRef: str("supplierBookingRef", ""),
    supplierNotes: str("supplierNotes", ""),
    source: str("source", "WhatsApp Click"),
    inclusions: !phpEmpty(inclusions) && typeof inclusions === "object" ? inclusions : [],
  };

  const saved = await withBookingsLock(async () => {
    const bookings = await readBookings();
    bookings.unshift(newBooking);
    return writeBookings(bookings);
  });

  if (!saved) return storageFailure();
  return json({ success: true, message: "Booking created successfully", refId, booking: newBooking });
}

// ── PUT: Update Existing Booking (Lifecycle Stage, Supplier Booking Status, Notes) ──
export async function PUT(request: NextRequest) {
  const input = asInput(await readJsonBody(request));
  if (!input || phpEmpty(input.refId)) {
    return json({ success: false, error: "Booking refId is required for update" }, 400);
  }

  const refId = phpTrim(input.refId);

  const result = await withBookingsLock(async () => {
    const bookings = await readBookings();
    const booking = bookings.find((b) => b.refId === refId);
    if (!booking) return { status: "not_found" as const };

    // Editable fields
    if (phpIsset(input.stage)) booking.stage = phpTrim(input.stage);
    if (phpIsset(input.isBookedWithSupplier)) booking.isBookedWithSupplier = phpBool(input.isBookedWithSupplier);
    if (phpIsset(input.supplierBookingRef)) booking.supplierBookingRef = phpTrim(input.supplierBookingRef);
    if (phpIsset(input.supplierNotes)) booking.supplierNotes = phpTrim(input.supplierNotes);
    if (phpIsset(input.comfortDate)) booking.comfortDate = phpTrim(input.comfortDate);
    if (phpIsset(input.tokenPaid)) {
      booking.tokenPaid = phpIntval(input.tokenPaid);
      booking.balance = Math.max(0, phpIntval(booking.total) - booking.tokenPaid);
    }
    if (phpIsset(input.total)) {
      booking.total = phpIntval(input.total);
      booking.balance = Math.max(0, booking.total - phpIntval(booking.tokenPaid));
    }
    if (phpIsset(input.guest)) booking.guest = phpTrim(input.guest);
    if (phpIsset(input.phone)) booking.phone = phpTrim(input.phone);

    booking.updatedAt = formatYmdHis(new Date());

    return (await writeBookings(bookings)) ? { status: "ok" as const, booking } : { status: "write_failed" as const };
  });

  if (result.status === "not_found") return json({ success: false, error: "Booking not found" }, 404);
  if (result.status === "write_failed") return storageFailure();
  return json({ success: true, message: `Booking ${refId} updated successfully`, booking: result.booking });
}

// ── DELETE: Delete Booking ──
export async function DELETE(request: NextRequest) {
  let refId = phpTrim(request.nextUrl.searchParams.get("refId"));
  if (!refId) {
    const input = asInput(await readJsonBody(request));
    if (input && !phpEmpty(input.refId)) refId = phpTrim(input.refId);
  }

  if (!refId) {
    return json({ success: false, error: "refId required" }, 400);
  }

  const saved = await withBookingsLock(async () => {
    const bookings = await readBookings();
    return writeBookings(bookings.filter((b) => b.refId !== refId));
  });

  if (!saved) return storageFailure();
  return json({ success: true, message: `Booking ${refId} deleted successfully` });
}

export function PATCH() {
  return json({ success: false, error: "Method not allowed" }, 405);
}
