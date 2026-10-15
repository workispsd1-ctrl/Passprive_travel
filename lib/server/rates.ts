import "server-only";

import { formatDMY, formatYmd, numberFormat, phpEmpty, phpFloatval, phpRound } from "@/lib/server/php";

// ── RateHawk API Configuration (credentials come from the environment, see .env.example) ──
const RATEHAWK_KEY_ID = process.env.RATEHAWK_KEY_ID ?? "";
const RATEHAWK_API_TOKEN = process.env.RATEHAWK_API_TOKEN ?? "";
const IS_PRODUCTION = process.env.RATEHAWK_PRODUCTION === "true";
const API_BASE_URL = IS_PRODUCTION
  ? "https://api.ratehawk.com/api/b2b/v3/"
  : "https://api-sandbox.ratehawk.com/api/b2b/v3/";
const USER_AGENT = "PasspriveTravel/1.0";

// Currency & Agency Margin (internal wholesale-to-retail conversion)
const EUR_TO_INR = 93.0;
const MARKUP_PERCENT = 15; // 15% PassPrivé agency wholesale-to-retail margin

export type TripType = "couple" | "family" | "friends";

interface TripConfig {
  hotel_name: string;
  location: string;
  stars: number;
  sandbox_hid: string;
  room_type: string;
  meal: string;
  default_base_eur: number;
  base_room_inr: number;
  base_dining_inr: number;
  chauffeur_tours_inr: number;
  guests: { adults: number; children: number[] }[];
}

const TRIP_CONFIGS: Record<TripType, TripConfig> = {
  couple: {
    hotel_name: "Veranda Grand Baie Hotel & Spa",
    location: "Grand Baie & North Coast",
    stars: 4,
    sandbox_hid: "10004834",
    room_type: "Deluxe Creole Ocean Room (King Bed)",
    meal: "All-Inclusive Creole Dining & Drinks",
    default_base_eur: 960.0,
    base_room_inr: 86000,
    base_dining_inr: 16000,
    chauffeur_tours_inr: 51000,
    guests: [{ adults: 2, children: [] }],
  },
  family: {
    hotel_name: "Ambre Resort & Spa",
    location: "Belle Mare · East Coast Lagoon",
    stars: 4,
    sandbox_hid: "8819557",
    room_type: "Family Beachfront Suite (Interconnecting)",
    meal: "All-Inclusive Family Buffet & Kids Club Dining",
    default_base_eur: 1420.0,
    base_room_inr: 112000,
    base_dining_inr: 20000,
    chauffeur_tours_inr: 64500,
    guests: [{ adults: 2, children: [7] }],
  },
  friends: {
    hotel_name: "Tamassa Bel Ombre Resort",
    location: "Bel Ombre · South Coast",
    stars: 4,
    sandbox_hid: "9744270",
    room_type: "Superior Beach Twin/Double Rooms",
    meal: "All-Inclusive Open-Bar & Sunset Themed Dinners",
    default_base_eur: 1280.0,
    base_room_inr: 98000,
    base_dining_inr: 21000,
    chauffeur_tours_inr: 56000,
    guests: [{ adults: 4, children: [] }],
  },
};

export interface RatesQuery {
  trip: string | null;
  checkin: string | null;
  nights: number | null;
}

const addDays = (d: Date, days: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
};

/** `DateTime::createFromFormat('Y-m-d', ...)` (lenient, overflowing days like PHP). */
function parseYmd(value: string): Date | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const calendarDaysBetween = (from: Date, to: Date) =>
  Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      86_400_000,
  );

interface RateHawkRate {
  room_name?: string;
  meal_data?: { value?: string };
  payment_options?: {
    payment_types?: {
      amount?: string | number;
      cancellation_penalties?: { free_cancellation_before?: string };
    }[];
  };
}

async function fetchLiveRate(config: TripConfig, checkin: string, checkout: string): Promise<RateHawkRate | null> {
  if (!RATEHAWK_KEY_ID || !RATEHAWK_API_TOKEN) return null;
  try {
    const res = await fetch(`${API_BASE_URL}search/serp/hotels/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${RATEHAWK_KEY_ID}:${RATEHAWK_API_TOKEN}`).toString("base64")}`,
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        checkin,
        checkout,
        residency: "in",
        language: "en",
        guests: config.guests,
        ids: [config.sandbox_hid],
        currency: "EUR",
      }),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.status !== 200) return null;
    const data = (await res.json()) as { data?: { hotels?: { rates?: RateHawkRate[] }[] } };
    const rate = data?.data?.hotels?.[0]?.rates?.[0];
    return rate && !phpEmpty(rate) ? rate : null;
  } catch {
    return null;
  }
}

export async function computeRates(query: RatesQuery) {
  const now = new Date();

  let tripType = query.trip !== null ? query.trip.trim().toLowerCase() : "couple";
  if (!(tripType in TRIP_CONFIGS)) tripType = "couple";
  const config = TRIP_CONFIGS[tripType as TripType];

  const nights = query.nights ?? 5;
  let checkin = query.checkin !== null ? query.checkin.trim() : formatYmd(addDays(now, 30));

  // Invalid or past check-in dates fall back to 30 days out.
  // PHP's createFromFormat('Y-m-d') took the current time with zero microseconds, which is a hair
  // *before* `new DateTime()`: today's date therefore counted as past, and future dates came out
  // one day short in `$now->diff()`. Both quirks are kept so prices fall in the same bands.
  let checkinDate = parseYmd(checkin);
  let diffDays: number;
  if (!checkinDate || checkinDate <= startOfDay(now)) {
    checkinDate = startOfDay(addDays(now, 30));
    checkin = formatYmd(checkinDate);
    diffDays = 30;
  } else {
    diffDays = calendarDaysBetween(now, checkinDate) - 1;
  }
  const checkout = formatYmd(addDays(checkinDate, nights));

  // ── 1. Date-Based Yield & Seasonality Multipliers ──
  const month = checkinDate.getMonth() + 1;
  const day = checkinDate.getDate();

  // A. Lead Time Multiplier (farther dates cheaper, near dates higher)
  let leadMultiplier: number;
  let leadLabel: string;
  let rateBadge: string;
  if (diffDays <= 7) {
    leadMultiplier = 1.22;
    leadLabel = "Last-Minute High Demand (+22%)";
    rateBadge = "⚡ Last-Minute Demand";
  } else if (diffDays <= 14) {
    leadMultiplier = 1.12;
    leadLabel = "High Demand Window (+12%)";
    rateBadge = "High Demand";
  } else if (diffDays <= 35) {
    leadMultiplier = 1.0;
    leadLabel = "Standard Seasonal Rate";
    rateBadge = "Best Available Rate";
  } else if (diffDays <= 75) {
    leadMultiplier = 0.9;
    leadLabel = "Early Bird Savings (-10%)";
    rateBadge = "🌿 Early Bird (-10%)";
  } else {
    leadMultiplier = 0.85;
    leadLabel = "Advance Booking Privilege (-15%)";
    rateBadge = "✨ Advance Saver (-15%)";
  }

  // B. Mauritius Seasonality Multiplier
  // Festive peak (Dec 18 - Jan 10); low season (May 1 - Aug 31)
  const isFestivePeak = (month === 12 && day >= 18) || (month === 1 && day <= 10);
  const isLowSeason = month >= 5 && month <= 8;

  let seasonMultiplier: number;
  let seasonLabel: string;
  if (isFestivePeak) {
    seasonMultiplier = 1.3;
    seasonLabel = "Mauritius Festive Peak Season (+30%)";
    rateBadge = "✨ Festive Peak Season";
  } else if (isLowSeason) {
    seasonMultiplier = 0.88;
    seasonLabel = "Mauritius Island Saver Season (-12%)";
    rateBadge = "☀️ Island Saver (-12%)";
  } else {
    seasonMultiplier = 1.0;
    seasonLabel = "Standard Island Season";
  }

  // Clamp between 0.75 and 1.55 for realistic hotel pricing
  const combinedDateMultiplier = Math.max(0.75, Math.min(1.55, phpRound(leadMultiplier * seasonMultiplier, 3)));

  // ── 2. Query RateHawk API (Live or Sandbox) ──
  const liveRate = await fetchLiveRate(config, checkin, checkout);
  const liveApiSuccess = liveRate !== null;
  let rawCancellationDeadline =
    liveRate?.payment_options?.payment_types?.[0]?.cancellation_penalties?.free_cancellation_before || null;

  // ── 3. Dynamic Hotel Pricing Calculation ──
  let hotelMarkedUpInr: number;
  let hotelRoomInr: number;
  let hotelDiningInr: number;
  let mealTypeDesc: string;
  let roomNameDesc: string;

  if (liveRate) {
    const baseHotelEur = phpFloatval(liveRate.payment_options?.payment_types?.[0]?.amount ?? config.default_base_eur);
    const meal = liveRate.meal_data?.value;
    mealTypeDesc = !phpEmpty(meal) ? meal!.charAt(0).toUpperCase() + meal!.slice(1) : config.meal;
    roomNameDesc = !phpEmpty(liveRate.room_name) ? liveRate.room_name! : config.room_type;
    rateBadge = "RateHawk Live Direct";

    // Convert RateHawk wholesale EUR to marked-up INR
    hotelMarkedUpInr = phpRound(baseHotelEur * (1 + MARKUP_PERCENT / 100) * EUR_TO_INR);
    hotelRoomInr = phpRound(hotelMarkedUpInr * 0.84);
    hotelDiningInr = hotelMarkedUpInr - hotelRoomInr;
  } else {
    // Date-based yield model (far dates cheaper, near dates surge, festive peak surcharge)
    hotelRoomInr = phpRound((config.base_room_inr * combinedDateMultiplier) / 100) * 100;
    hotelDiningInr = phpRound((config.base_dining_inr * combinedDateMultiplier) / 100) * 100;
    hotelMarkedUpInr = hotelRoomInr + hotelDiningInr;
    mealTypeDesc = config.meal;
    roomNameDesc = config.room_type;
  }

  const chauffeurToursInr = config.chauffeur_tours_inr;
  const totalPackageInr = hotelMarkedUpInr + chauffeurToursInr;

  // ── 4. Free Cancellation Deadline with 1-Day Safety Buffer ──
  let customerDeadline: Date;
  if (rawCancellationDeadline) {
    customerDeadline = new Date(new Date(rawCancellationDeadline).getTime() - 24 * 3600 * 1000);
  } else {
    // 1-day safety buffer before the supplier's 7-day window (check-in - 8 days)
    customerDeadline = addDays(checkinDate, -8);
    rawCancellationDeadline = `${formatYmd(addDays(checkinDate, -7))}T23:59:00`;
  }
  const customerDeadlineFormatted = formatDMY(customerDeadline);
  const customerDeadlineIso = formatYmd(customerDeadline);

  return {
    status: "success",
    source: liveApiSuccess ? "ratehawk_live_api" : "ratehawk_yield_algorithm",
    trip: tripType,
    hotel: {
      name: config.hotel_name,
      location: config.location,
      stars: config.stars,
      room_type: roomNameDesc,
      meal_plan: mealTypeDesc,
      nights,
      checkin,
      checkout,
    },
    yield_model: {
      is_live_api: liveApiSuccess,
      days_in_advance: diffDays,
      lead_factor: leadMultiplier,
      lead_label: leadLabel,
      season_factor: seasonMultiplier,
      season_label: seasonLabel,
      combined_multiplier: combinedDateMultiplier,
      rate_badge: rateBadge,
    },
    pricing: {
      currency: "INR",
      hotel_marked_up_inr: hotelMarkedUpInr,
      hotel_room_inr: hotelRoomInr,
      hotel_dining_inr: hotelDiningInr,
      chauffeur_and_excursions_inr: chauffeurToursInr,
      passprive_vip_app_inr: 0, // Included free
      total_package_inr: totalPackageInr,
      formatted_total: `₹${numberFormat(totalPackageInr)}`,
      formatted_hotel_share: `₹${numberFormat(hotelMarkedUpInr)}`,
      formatted_tours_share: `₹${numberFormat(chauffeurToursInr)}`,
    },
    flights: {
      route: "DEL (Delhi) ⇄ MRU (Mauritius)",
      origin: "DEL · Delhi Airport India",
      destination: "MRU · Sir Seewoosagur Mauritius",
      fixed_price_oneway_inr: 30691,
      fixed_price_return_inr: 61382,
      formatted_oneway: "₹30,691",
      formatted_return: "₹61,382",
    },
    cancellation_guarantee: {
      is_free_cancellation: true,
      buffer_applied: "24_hours_prior_to_ratehawk_deadline",
      customer_free_cancellation_date: customerDeadlineIso,
      customer_free_cancellation_display: customerDeadlineFormatted,
      ratehawk_internal_deadline: rawCancellationDeadline,
      guarantee_badge: `Free cancellation until ${customerDeadlineFormatted}. 100% full refund guarantee.`,
    },
  };
}

export type RatesResponse = Awaited<ReturnType<typeof computeRates>>;
