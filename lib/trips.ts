export type TripCategory = "couple" | "family" | "friends";

export interface TripItem {
  label: string;
  basePrice: number;
  checked: boolean;
  /** Room/dining lines can be repriced by the live RateHawk response. */
  stayType?: "room" | "dining";
  isFlight?: boolean;
}

export interface Trip {
  id: TripCategory;
  category: TripCategory;
  forWho: string;
  location: string;
  duration: string;
  title: string;
  stay: string;
  flights: string;
  tours: string;
  travel: string;
  bonus: string;
  img: string;
  /** Ordered checklist sections shown in the customization modal. */
  categories: Record<string, TripItem[]>;
}

/** Resort stay lines are repriced by the date-yield multiplier. */
export const RESORT_STAY = "Resort Stay";

// ── 3 CURATED MAURITIUS TRIPS (DYNAMIC YIELD & RATEHAWK SYNCED) ──
export const TRIPS: Trip[] = [
  {
    id: "couple",
    category: "couple",
    forWho: "for couples",
    location: "Grand Baie & North Coast",
    duration: "5 Nights · 6 Days",
    title: "Romantic Lagoon & Sunset Catamaran Escape",
    stay: "Veranda Grand Baie 4★ Beach Resort · All meals & oceanfront dining",
    flights: "DEL (Delhi) ⇄ MRU (Sir Seewoosagur) · Fixed ₹61,382 return",
    tours: "Sunset Catamaran to Coin de Mire, turtle snorkeling & Chamarel rum tour",
    travel: "Private luxury SUV pickup & dedicated chauffeur for all tours",
    bonus: "Free PassPrivé VIP App (instant tables & 3% cashback on bills)",
    img: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
    categories: {
      "Resort Stay": [
        { label: "5 Nights at Veranda Grand Baie (Creole Chic Room)", basePrice: 86000, checked: true, stayType: "room" },
        { label: "All-Inclusive dining: daily breakfast, lunch & oceanfront dinners", basePrice: 16000, checked: true, stayType: "dining" },
        { label: "Sunset welcome cocktails & romantic arrival setup", basePrice: 0, checked: true },
      ],
      "Lagoon & Island Tours": [
        { label: "Sunset catamaran cruise to Coin de Mire with open bar", basePrice: 14000, checked: true },
        { label: "Snorkeling with sea turtles at Blue Bay marine lagoon", basePrice: 8000, checked: true },
        { label: "Chamarel 7 Coloured Earth & rum tasting experience", basePrice: 9000, checked: true },
        { label: "Optional: Beachside couples massage at the resort spa", basePrice: 6500, checked: false },
      ],
      "Private Rides & Flights": [
        { label: "Fixed Return Flights: DEL (Delhi) ⇄ MRU (Sir Seewoosagur)", basePrice: 61382, checked: true, isFlight: true },
        { label: "Private airport pickup & drop in luxury SUV", basePrice: 10500, checked: true },
        { label: "Dedicated island chauffeur for excursion days", basePrice: 9500, checked: true },
      ],
      "PassPrivé VIP Membership": [
        { label: "Free PassPrivé VIP App (worth ₹13,500) — instant tables & 3% cashback", basePrice: 0, checked: true },
      ],
    },
  },
  {
    id: "family",
    category: "family",
    forWho: "for family & kids",
    location: "Belle Mare · East Coast",
    duration: "5 Nights · 6 Days",
    title: "Family Beach, Casela Safari & Lagoon Cruise",
    stay: "Ambre 4★ Beach Resort · All-inclusive meals & free kids club",
    flights: "DEL (Delhi) ⇄ MRU (Sir Seewoosagur) · Fixed ₹61,382 return",
    tours: "Casela Nature Park safari + Ile aux Cerfs catamaran BBQ day",
    travel: "Private family minivan with child seats & dedicated chauffeur",
    bonus: "Free PassPrivé VIP App (family dining perks & 3% cashback)",
    img: "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800",
    categories: {
      "Resort Stay": [
        { label: "5 Nights at Ambre Beach Resort (Family Suite)", basePrice: 112000, checked: true, stayType: "room" },
        { label: "All-Inclusive dining: family buffets, snacks & all drinks", basePrice: 20000, checked: true, stayType: "dining" },
        { label: "Full access to supervised kids club & pool activities", basePrice: 0, checked: true },
      ],
      "Family Excursions": [
        { label: "Casela Nature Park: safari bus, giraffe & tortoise feeding", basePrice: 16000, checked: true },
        { label: "Full-day catamaran to Ile aux Cerfs with island BBQ lunch", basePrice: 15500, checked: true },
        { label: "Pamplemousses Botanical Garden giant water lilies tour", basePrice: 8000, checked: true },
        { label: "Optional: GRSE waterfall river speedboat adventure", basePrice: 7000, checked: false },
      ],
      "Private Family Travel": [
        { label: "Fixed Return Flights: DEL (Delhi) ⇄ MRU (Sir Seewoosagur)", basePrice: 61382, checked: true, isFlight: true },
        { label: "Private AC family minivan airport transfers with child seats", basePrice: 12000, checked: true },
        { label: "Dedicated family chauffeur for all island excursions", basePrice: 11000, checked: true },
      ],
      "PassPrivé VIP Membership": [
        { label: "Free PassPrivé VIP App (worth ₹13,500) — family dining perks", basePrice: 0, checked: true },
      ],
    },
  },
  {
    id: "friends",
    category: "friends",
    forWho: "for friends",
    location: "Bel Ombre · South Coast",
    duration: "5 Nights · 6 Days",
    title: "Friends Quad Adventure, Catamaran Party & Beach Clubs",
    stay: "Tamassa Bel Ombre 4★ Resort · 4 pools, night cinema & all meals",
    flights: "DEL (Delhi) ⇄ MRU (Sir Seewoosagur) · Fixed ₹61,382 return",
    tours: "Sugarcane quad biking trails, Gabriel Island catamaran party & beach clubs",
    travel: "Private group van for all airport & excursion rides",
    bonus: "Free PassPrivé VIP App (VIP club tables & 3% group cashback)",
    img: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800",
    categories: {
      "Resort Stay": [
        { label: "5 Nights at Tamassa Bel Ombre Resort (Beach Rooms)", basePrice: 98000, checked: true, stayType: "room" },
        { label: "All-Inclusive: unlimited meals, afternoon snacks & open bar", basePrice: 21000, checked: true, stayType: "dining" },
        { label: "Access to 4 resort pools, beach volleyball & night cinema", basePrice: 0, checked: true },
      ],
      "Group Adventures": [
        { label: "Quad biking across sugarcane fields and river trails", basePrice: 14000, checked: true },
        { label: "Gabriel Island catamaran party with BBQ & open bar", basePrice: 16000, checked: true },
        { label: "Beach club sunset lounge entry with reserved sunbeds", basePrice: 7000, checked: true },
        { label: "Optional: Speedboat tubing & lagoon wakeboarding", basePrice: 6500, checked: false },
      ],
      "Private Group Transport": [
        { label: "Fixed Return Flights: DEL (Delhi) ⇄ MRU (Sir Seewoosagur)", basePrice: 61382, checked: true, isFlight: true },
        { label: "Private group van airport pickup & return drop", basePrice: 11000, checked: true },
        { label: "Dedicated group chauffeur for south coast trails", basePrice: 10000, checked: true },
      ],
      "PassPrivé VIP Membership": [
        { label: "Free PassPrivé VIP App (worth ₹13,500) — VIP beach club tables", basePrice: 0, checked: true },
      ],
    },
  },
];

export const findTrip = (id: string) => TRIPS.find((t) => t.id === id);

// ── Date helpers (browser-side; these read the current date) ──

/** Default travel date: `offsetDays` from now, as YYYY-MM-DD (UTC, like the original). */
export function getDefaultDateStr(offsetDays = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const parseLocalDate = (dateStr: string) => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const GB_DATE: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

export function formatFriendlyDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d ? d.toLocaleDateString("en-GB", GB_DATE) : dateStr;
}

/** Customer free-cancellation deadline: check-in minus 8 days (1-day buffer before the supplier's 7-day window). */
export function cancellationDeadline(dateStr: string): string | null {
  const d = parseLocalDate(dateStr);
  if (!d) return null;
  d.setDate(d.getDate() - 8);
  return d.toLocaleDateString("en-GB", GB_DATE);
}

export interface DateFactors {
  combined: number;
  diffDays: number;
  rateBadge: string;
}

// ── Dynamic Date Yield & Seasonality Algorithm ──
// Near dates surge (+22%), far dates cheaper (-10% to -15%), festive peak (+30%)
export function computeDateFactors(checkinDateStr: string): DateFactors {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkin = parseLocalDate(checkinDateStr || "");
  if (!checkin) {
    return { combined: 1.0, diffDays: 30, rateBadge: "Best Available Rate" };
  }
  const diffDays = Math.max(0, Math.round((checkin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const month = checkin.getMonth() + 1;
  const day = checkin.getDate();

  // 1. Lead Time Multiplier (near dates higher, far dates cheaper)
  let leadMultiplier: number;
  let rateBadge: string;
  if (diffDays <= 7) {
    leadMultiplier = 1.22;
    rateBadge = "⚡ Last-Minute Demand (+22%)";
  } else if (diffDays <= 14) {
    leadMultiplier = 1.12;
    rateBadge = "High Demand Window (+12%)";
  } else if (diffDays <= 35) {
    leadMultiplier = 1.0;
    rateBadge = "Standard Best Rate";
  } else if (diffDays <= 75) {
    leadMultiplier = 0.9;
    rateBadge = "🌿 Early Bird Savings (-10%)";
  } else {
    leadMultiplier = 0.85;
    rateBadge = "✨ Advance Saver (-15%)";
  }

  // 2. Mauritius Seasonality Multiplier
  let seasonMultiplier = 1.0;
  const isFestivePeak = (month === 12 && day >= 18) || (month === 1 && day <= 10);
  const isLowSeason = month >= 5 && month <= 8;

  if (isFestivePeak) {
    seasonMultiplier = 1.3;
    rateBadge = "✨ Festive Peak Season (+30%)";
  } else if (isLowSeason) {
    seasonMultiplier = 0.88;
    rateBadge = "☀️ Island Season Saver (-12%)";
  }

  let combined = Math.round(leadMultiplier * seasonMultiplier * 1000) / 1000;
  combined = Math.max(0.75, Math.min(1.55, combined));

  return { combined, diffDays, rateBadge };
}

/** Resort Stay lines with a base price are repriced by the date multiplier, rounded to ₹100. */
export function datePricedItem(category: string, item: TripItem, factors: DateFactors): number {
  if (category === RESORT_STAY && item.basePrice > 0) {
    return Math.round((item.basePrice * factors.combined) / 100) * 100;
  }
  return item.basePrice;
}

export const inr = (n: number) => n.toLocaleString("en-IN");
