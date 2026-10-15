/** Booking records stored in data/bookings.json and served by /api/bookings. */
export interface Booking {
  refId: string;
  createdAt: string;
  updatedAt?: string;
  guest: string;
  phone: string;
  email?: string;
  destination?: string;
  pkg: string;
  travelDate?: string;
  duration?: string;
  total: number;
  tokenPaid: number;
  balance: number;
  comfortDate?: string;
  cutoffDate?: string;
  cutoffBufferHours?: number;
  stage: string;
  isBookedWithSupplier: boolean;
  supplierBookingRef?: string;
  supplierNotes?: string;
  source?: string;
  inclusions?: unknown;
}

export interface BookingsListResponse {
  success: true;
  count: number;
  bookings: Booking[];
}

export const BOOKING_STAGES = [
  { value: "NEW_LEAD", label: "New Lead" },
  { value: "COMFORT_SET", label: "Comfort Date Set" },
  { value: "TOKEN_LOCKED", label: "Token Locked" },
  { value: "PAYMENT_OVERDUE", label: "Payment Overdue" },
  { value: "ESCALATED", label: "Escalated" },
  { value: "VOUCHER_ISSUED", label: "Voucher Issued" },
  { value: "COMPLETED", label: "Trip Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const BOOKINGS_API = "/api/bookings";
