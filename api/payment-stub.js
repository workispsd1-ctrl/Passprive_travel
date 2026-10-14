/**
 * Project Lightshot — Passprive Travel
 * ISOLATED PAYMENT GATEWAY INTEGRATION POINT (PRD Section 16.3 & Section 0 Decision #3)
 *
 * Current Status: STUBBED for v1.
 * No real card/UPI charge occurs here yet.
 *
 * HOW TO WIRE REAL RAZORPAY / CASHFREE LATER:
 * 1. Create an order on your backend using Razorpay Orders API (`amount: 299900` in paise, `currency: "INR"`).
 * 2. Replace the simulated resolution inside `initiateLockInPayment()` below with `new window.Razorpay(options).open()`.
 * 3. Verify the payment signature on the serverless endpoint before returning `status: "confirmed"`.
 */

export const LOCK_IN_AMOUNT_INR = 2999;
export const REFUND_WINDOW_HOURS = 72;
export const DEFAULT_EMI_MONTHS = 3; // PRD Section 13 Decision #2: 3 equal monthly installments

export async function initiateLockInPayment(leadPayload) {
  // Validate required fields before initiating lock-in hold
  if (!leadPayload || !leadPayload.name || !leadPayload.phone) {
    throw new Error('Name and WhatsApp phone number are required to reserve your pass.');
  }

  // Simulate 650ms gateway handshake (isolated stub)
  await new Promise((resolve) => setTimeout(resolve, 650));

  const passReference = 'PP-MRU-' + Math.floor(100000 + Math.random() * 900000);
  const timestamp = new Date().toISOString();

  return {
    status: 'stub_locked',
    gateway: 'PASSPRIVE_V1_PAYMENT_STUB',
    amount_inr: LOCK_IN_AMOUNT_INR,
    currency: 'INR',
    pass_id: passReference,
    refundable_until_hours: REFUND_WINDOW_HOURS,
    emi_plan: `${DEFAULT_EMI_MONTHS} equal monthly installments before travel date (display-only)`,
    assigned_designer: {
      name: 'Maya Laurent',
      role: 'Senior Mauritius Island Designer (Grand Baie)',
      sla: 'WhatsApp reply within 15 minutes'
    },
    created_at: timestamp,
    lead: leadPayload
  };
}
