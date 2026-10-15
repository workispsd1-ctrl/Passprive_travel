/**
 * Multi-destination travel catalog used by /mobile (formerly destinationsCatalog.js).
 * The JSON files are generated data; edit them rather than this module.
 */
import destinations from "./destinations.json";
import dmcConfig from "./dmc-config.json";
import passBundles from "./pass-bundles.json";

export type PackageCategory = "couples" | "family" | "friends";
export type UpsellCategory = "hotel" | "activity" | "transfer" | "dining";
export type UpsellPriceType = "per_night" | "per_person" | "per_booking";

export interface Hotel {
  name: string;
  stars: number;
  location: string;
  mealPlan: string;
  desc: string;
}

export interface Activity {
  name: string;
  duration: string;
  image: string;
}

export interface TourPackage {
  id: string;
  category: PackageCategory | string;
  tier: string;
  tierLabel: string;
  name: string;
  fullName: string;
  tagline: string;
  duration: string;
  nights: number;
  groupLabel: string;
  hotel: Hotel;
  activities: Activity[];
  inclusions: string[];
  exclusions: string[];
  itinerary: unknown[];
  price: number;
  originalPrice: number;
  advance: number;
  extensionCost: number;
  image: string;
  priceLabel: string;
  baseGroup: number;
  minTravelers: number;
  maxTravelers: number;
  childMultiplier: number;
  isPopular?: boolean;
  groupDiscountThreshold?: number;
  groupDiscountPercent?: number;
}

export interface Region {
  id: string;
  name: string;
  tagline: string;
  image: string;
  included: boolean;
  extraCostPerNight: number;
  extraNights: number;
  highlights: string[];
}

export interface Upsell {
  id: string;
  category: UpsellCategory | string;
  supplier: string;
  wholesaleRoomCode?: string;
  name: string;
  price: number;
  priceType: UpsellPriceType | string;
  duration: string;
  badge: string;
  image: string;
  desc: string;
  passPrice: number;
  gatePrice: number;
  passEligible: boolean;
  supplierCode: string;
  bundleTags: string[];
}

export interface CityFare {
  name: string;
  code: string;
  direct: boolean;
  avgFare: number;
  airline: string;
}

export interface FlightMatrix {
  destinationAirport: string;
  destinationAirportName: string;
  cityAverages: Record<string, CityFare>;
}

export interface Destination {
  id: string;
  name: string;
  flag: string;
  code: string;
  tagline: string;
  description: string;
  heroImage: string;
  packages: TourPackage[];
  theme: Record<string, string>;
  personas: Record<string, unknown>;
  regions: Region[];
  flightMatrix: FlightMatrix;
  upsells: Upsell[];
  passBundles: unknown[];
  hotels?: unknown;
  activities?: unknown;
  pricing?: unknown;
}

export interface BundleItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  image: string;
  gatePrice: number;
  passPrice: number;
}

export interface PassBundle {
  id: string;
  name: string;
  emoji: string;
  theme: string;
  tagline: string;
  badge: string;
  includedItemIds: string[];
  validity: string;
  tokenDeposit: number;
  gatePrice: number;
  passPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  includedItems: BundleItem[];
  itemCount: number;
  image: string;
}

export interface DmcPartner {
  id: string | null;
  name: string;
  email: string | null;
  whatsapp: string | null;
  active: boolean;
}

export interface Catalog {
  destinations: Record<string, Destination>;
  passBundles: Record<string, PassBundle[]>;
}

export const DESTINATIONS_DATA = destinations as unknown as Record<string, Destination>;
export const PASS_BUNDLES = passBundles as unknown as Record<string, PassBundle[]>;
export const DMC_CONFIG = dmcConfig as Record<string, DmcPartner>;

export const INITIAL_CATALOG: Catalog = { destinations: DESTINATIONS_DATA, passBundles: PASS_BUNDLES };

export interface CatalogOverride {
  name?: string;
  tagline?: string;
  desc?: string;
  image?: string;
  badge?: string;
  gatePrice?: string | number;
  passPrice?: string | number;
}

/**
 * Dynamic catalog overrides merger (lets admins update prices, photos, and offers in real time).
 * Returns a new catalog instead of mutating the shared data.
 */
export function applyCatalogOverrides(catalog: Catalog, overrides: Record<string, CatalogOverride> | null | undefined): Catalog {
  if (!overrides || typeof overrides !== "object") return catalog;
  const int = (v: string | number) => parseInt(String(v));

  const passBundles = Object.fromEntries(
    Object.entries(catalog.passBundles).map(([dest, bundles]) => [
      dest,
      bundles.map((bundle) => {
        const o = overrides[bundle.id];
        if (!o) return bundle;
        const b = { ...bundle };
        if (o.name) b.name = o.name;
        if (o.tagline) b.tagline = o.tagline;
        if (o.image) b.image = o.image;
        if (o.badge) b.badge = o.badge;
        if (o.gatePrice) b.gatePrice = int(o.gatePrice);
        if (o.passPrice) {
          b.passPrice = int(o.passPrice);
          b.savingsAmount = b.gatePrice - b.passPrice;
          b.savingsPercent = Math.round((b.savingsAmount / b.gatePrice) * 100);
        }
        return b;
      }),
    ]),
  );

  const destinations = Object.fromEntries(
    Object.entries(catalog.destinations).map(([key, dest]) => [
      key,
      {
        ...dest,
        upsells: dest.upsells?.map((upsell) => {
          const o = overrides[upsell.id];
          if (!o) return upsell;
          const u = { ...upsell };
          if (o.name) u.name = o.name;
          if (o.desc) u.desc = o.desc;
          if (o.image) u.image = o.image;
          if (o.badge) u.badge = o.badge;
          if (o.gatePrice) u.gatePrice = int(o.gatePrice);
          if (o.passPrice) {
            u.passPrice = int(o.passPrice);
            u.price = u.passPrice;
          }
          return u;
        }),
      },
    ]),
  );

  return { destinations, passBundles };
}
