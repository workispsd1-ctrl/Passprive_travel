"use client";

import Link from "next/link";
import { useState } from "react";

import { applyCatalogOverrides, INITIAL_CATALOG, type Catalog, type CatalogOverride, type TourPackage } from "@/lib/catalog";

import { BookingDrawer, type BookingDrawerState } from "./booking-drawer";
import { AdjustmentsIcon, ChevronDownIcon, CubeIcon, MenuIcon, TicketIcon, UserIcon, WhatsAppIcon } from "./icons";
import { PassDrawer, type PassBookingData } from "./pass-drawer";
import { ByopSection, CuratedBundles, PackagesList } from "./sections";

export type PrimaryMode = "holiday_pass" | "classic_packages";
export type PassSubMode = "bundles" | "byop";
export type ByopCategory = "all" | "adventure" | "cultural" | "dining" | "hotel_upgrade";
export type MobileCategory = "couples" | "family" | "friends";

const CONCIERGE_WA = "https://wa.me/917838215147?text=Hello%20PassPrive%20Travel";

export function MobileApp() {
  const [catalog, setCatalog] = useState<Catalog>(INITIAL_CATALOG);
  const [currentDest, setCurrentDest] = useState("mauritius");
  const [currentCategory, setCurrentCategory] = useState<MobileCategory>("couples");
  const [primaryMode, setPrimaryMode] = useState<PrimaryMode>("holiday_pass");
  const [passSubMode, setPassSubMode] = useState<PassSubMode>("bundles");
  // The mode toggles load with richer markup than the classes the original script applied
  // after the first switch; keep that exact look until they're touched.
  const [modeTouched, setModeTouched] = useState(false);
  const [subTouched, setSubTouched] = useState(false);
  const [byopCategory, setByopCategory] = useState<ByopCategory>("all");
  const [selectedByopItems, setSelectedByopItems] = useState<string[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [destSheetOpen, setDestSheetOpen] = useState(false);
  const [passBooking, setPassBooking] = useState<PassBookingData | null>(null);
  const [passDrawerOpen, setPassDrawerOpen] = useState(false);

  // Booking checkout drawer
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [drawer, setDrawer] = useState<BookingDrawerState>(() => ({
    regions: baseRegions(INITIAL_CATALOG, "mauritius"),
    flightsEnabled: false,
    departureCity: "BOM",
    upsells: [],
    upsellCategory: "all",
    renderId: 0,
  }));
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);

  const d = catalog.destinations[currentDest];

  /** Any change to the checkout drawer re-renders it from scratch, as the original did. */
  const rerenderDrawer = (patch: Partial<BookingDrawerState>) =>
    setDrawer((prev) => ({ ...prev, ...patch, renderId: prev.renderId + 1 }));

  const setMobilePassSubMode = (subMode: PassSubMode) => {
    setPassSubMode(subMode);
    setSubTouched(true);
  };

  const setMobilePrimaryMode = (mode: PrimaryMode, fromDeeplink = false) => {
    setPrimaryMode(mode);
    setModeTouched(true);
    if (mode !== "holiday_pass") return;

    // Load live catalog overrides
    fetch("/api/catalog")
      .then((r) => r.json() as Promise<{ success?: boolean; overrides?: Record<string, CatalogOverride> }>)
      .then((res) => {
        if (res.success && res.overrides) setCatalog((c) => applyCatalogOverrides(c, res.overrides));
      })
      .catch((err) => console.warn("Catalog API offline", err));

    // Ad campaign deeplink check: ?mode=byop (runs once per switch; the original re-triggered itself every 400ms)
    if (fromDeeplink) return;
    const adMode = new URLSearchParams(window.location.search).get("mode");
    if (adMode === "byop" || adMode === "bundles") {
      setTimeout(() => openMobileHeroPass(adMode, true), 400);
    }
  };

  const openMobileHeroPass = (mode: PassSubMode, fromDeeplink = false) => {
    setMobilePrimaryMode("holiday_pass", fromDeeplink);
    setMobilePassSubMode(mode);
    document.getElementById("mobileMainExperienceSection")?.scrollIntoView({ behavior: "smooth" });
  };

  const applyDestination = (k: string) => {
    if (!catalog.destinations[k]) return;
    setCurrentDest(k);
    // Reset checkout selections for the new destination
    setDrawer((prev) => ({ ...prev, regions: baseRegions(catalog, k), upsells: [], flightsEnabled: false }));
  };

  const toggleByopItem = (id: string) =>
    setSelectedByopItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const openPassDrawer = (data: PassBookingData) => {
    setPassBooking(data);
    setPassDrawerOpen(true);
  };

  const openBookingDrawer = (pkg: TourPackage | null = selectedPackage) => {
    setSelectedPackage(pkg ?? d.packages[0]);
    setDrawer((prev) => ({
      ...prev,
      regions: prev.regions.length === 0 ? baseRegions(catalog, currentDest) : prev.regions,
      renderId: prev.renderId + 1,
    }));
    setBookingDrawerOpen(true);
  };

  const modeActive =
    "flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] text-white text-center flex items-center justify-center gap-1.5 cursor-pointer";
  const modeIdle = modeTouched
    ? "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all text-neutral-600 hover:text-neutral-900 text-center cursor-pointer"
    : "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all text-neutral-600 hover:text-neutral-900 text-center flex items-center justify-center gap-1.5 cursor-pointer";

  const bundlesBtn =
    passSubMode === "bundles"
      ? "flex-1 py-1.5 rounded-xl text-xs font-bold bg-[#2D1E18] text-white transition-all cursor-pointer"
      : "flex-1 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer";
  const byopBtn =
    passSubMode === "byop"
      ? "flex-1 py-1.5 rounded-xl text-xs font-bold bg-[#2D1E18] text-white transition-all cursor-pointer flex items-center justify-center gap-1"
      : subTouched
        ? "flex-1 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer flex items-center justify-center gap-1"
        : "flex-1 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer flex items-center justify-center gap-1.5";

  const navLinkClick = () => setNavOpen((o) => !o);

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 transition-all duration-300 px-4 py-3 bg-[rgba(253,251,247,0.92)] backdrop-blur-[20px] border-b-[0.5px] border-[rgba(45,30,24,0.08)]">
        <div className="flex items-center justify-between">
          {/* Brand & Compact Destination Pill */}
          <div className="flex items-center gap-2">
            <a href="/mobile" className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-linear-to-tr/srgb from-[#E05A47] to-[#EA580C] flex items-center justify-center font-black text-white text-xs">
                PP
              </div>
              <span className="font-black text-sm tracking-tight text-[#2D1E18]">PassPrivé</span>
            </a>

            {/* Compact Destination Pill: [MU v] */}
            <button
              type="button"
              onClick={() => setDestSheetOpen((o) => !o)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#2D1E18]/5 hover:bg-[#2D1E18]/10 border border-[#2D1E18]/10 text-xs font-bold text-[#2D1E18] transition-all cursor-pointer"
            >
              <span className="text-[10px] font-mono font-bold bg-[#2D1E18]/10 px-1.5 py-0.5 rounded-sm">{d.flag}</span>
              <span>{d.code}</span>
              <ChevronDownIcon className="w-2.5 h-2.5 text-neutral-500" />
            </button>
          </div>

          {/* Right Action & Menu */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openBookingDrawer()}
              className="px-2.5 py-1 rounded-xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] text-white font-extrabold text-[11px] shadow-xs cursor-pointer"
            >
              ₹1,999 Pass
            </button>
            <button type="button" onClick={() => setNavOpen((o) => !o)} className="p-1.5 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer">
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT MENU DRAWER */}
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end" onClick={() => setNavOpen(false)}>
          <div className="w-4/5 max-w-xs bg-[#FFFDF9] h-full p-6 stack-y-6 shadow-2xl flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            <div className="stack-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-[#2D1E18]">PassPrivé Travel</span>
                  <span className="text-[10px] font-bold px-1.5 rounded-sm bg-amber-100 text-amber-800">Mobile</span>
                </div>
                <button type="button" onClick={() => setNavOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-800 font-bold">
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-2.5 text-sm font-semibold text-neutral-800">
                <a href="#packagesSection" onClick={navLinkClick} className="p-2 rounded-xl hover:bg-orange-50 flex items-center justify-between">
                  <span>Curated Packages</span>
                  <span className="text-xs text-[#E05A47]">→</span>
                </a>
                <a href="#howItWorks" onClick={navLinkClick} className="p-2 rounded-xl hover:bg-orange-50 flex items-center justify-between">
                  <span>How ₹1,999 Works</span>
                  <span className="text-xs text-[#E05A47]">→</span>
                </a>
                {currentDest === "mauritius" && (
                  <div id="drawerPassLink">
                    <a href="#lifestylePass" onClick={navLinkClick} className="p-2 rounded-xl hover:bg-orange-50 flex items-center justify-between">
                      <span>Lifestyle Pass Perks</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-bold">Included</span>
                    </a>
                  </div>
                )}
                <Link href="/#admin" onClick={navLinkClick} className="p-2 rounded-xl hover:bg-orange-50 text-neutral-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-[#E05A47]" />
                    <span>Sign In / Booking Tracker</span>
                  </span>
                  <span className="text-xs text-[#E05A47]">→</span>
                </Link>
                <a href="/admin" target="_blank" className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 flex items-center justify-between">
                  <span>Admin Operations Portal</span>
                  <span className="text-xs">↗</span>
                </a>
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-200 stack-y-2">
              <a
                href={CONCIERGE_WA}
                target="_blank"
                className="w-full py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp Concierge</span>
              </a>
              <div className="text-[11px] text-center text-neutral-400">100% Refundable in 48 Hours</div>
            </div>
          </div>
        </div>
      )}

      {/* DESTINATION SELECTION BOTTOM SHEET */}
      {destSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end" onClick={() => setDestSheetOpen(false)}>
          <div className="w-full bg-[#FFFDF9] rounded-t-3xl p-6 stack-y-4 shadow-2xl max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-neutral-300 mx-auto mb-2" />
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="font-extrabold text-base text-[#2D1E18]">Choose Your Destination</h3>
              <button type="button" onClick={() => setDestSheetOpen(false)} className="text-neutral-400 font-bold p-1">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.keys(catalog.destinations).map((k) => {
                const dest = catalog.destinations[k];
                const isAct = k === currentDest;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setDestSheetOpen(false);
                      applyDestination(k);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isAct ? "border-[#E05A47] bg-orange-50 font-bold" : "border-neutral-200 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                          isAct ? "bg-[#E05A47] text-white" : "bg-orange-50 text-[#E05A47] border border-orange-200"
                        }`}
                      >
                        {dest.code}
                      </span>
                      <span className="text-xs text-[#2D1E18] font-semibold">{dest.name}</span>
                    </span>
                    {isAct && <span className="text-xs text-[#E05A47] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative px-4 pt-6 pb-8 bg-[#2D1E18] text-white overflow-hidden transition-colors duration-500" id="mobileHero">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote catalog image, swapped per destination */}
          <img src={d.heroImage} className="w-full h-full object-cover opacity-30 scale-105" alt="Hero" />
          <div className="absolute inset-0 bg-linear-to-b/srgb from-[#2D1E18]/80 via-[#2D1E18]/60 to-[#2D1E18]" />
        </div>

        <div className="relative z-10 text-center stack-y-4">
          {/* Stamp */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-amber-300/30 text-amber-200 text-xs font-semibold">
            <span className="font-handwriting text-lg font-bold text-[#FDE68A]">{d.name} Holiday Pass</span>
            <span>•</span>
            <span>₹1,999 Entry Token</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Your Dream <span className="font-handwriting text-4xl text-[#FDE68A]">{d.name}</span> Holiday.
            <br />
            <span className="font-handwriting text-4xl text-transparent bg-clip-text bg-linear-to-r/srgb from-[#FDE68A] to-[#FF8A65]">
              Locked In for ₹1,999!
            </span>
          </h1>

          <p className="text-xs text-amber-100/80 max-w-sm mx-auto leading-relaxed">{d.description || d.tagline}</p>

          {/* Category Filter Buttons */}
          <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-xs mx-auto">
            {(
              [
                ["couples", "Couples"],
                ["family", "Families"],
                ["friends", "Friends"],
              ] as const
            ).map(([cat, label]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCurrentCategory(cat)}
                className={
                  cat === currentCategory
                    ? "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all bg-white text-[#2D1E18]"
                    : "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-white/80 hover:text-white"
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Guarantees */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-amber-200/90 pt-1">
            <span>✓ 100% Refund within 48h</span>
            <span>•</span>
            <span>✓ Direct 5-Star Hotel Holds</span>
          </div>

          {/* Dual Conversion Funnel Buttons (Ad Campaign Ready) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => openMobileHeroPass("bundles")}
              className="py-3 px-2 rounded-2xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <TicketIcon className="w-4 h-4 text-white" />
              <span>Curated Passes</span>
            </button>
            <button
              type="button"
              onClick={() => openMobileHeroPass("byop")}
              className="py-3 px-2 rounded-2xl bg-white text-[#2D1E18] font-black text-xs border-2 border-amber-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <AdjustmentsIcon className="w-4 h-4 text-[#2D1E18]" />
              <span>Build Own Pass</span>
              <span className="text-[9px] bg-amber-400 text-black px-1.5 rounded-sm font-black">35%</span>
            </button>
          </div>
        </div>
      </section>

      {/* DUAL-MODE EXPERIENCE: HOLIDAY PASS & TOUR PACKAGES */}
      <section id="mobileMainExperienceSection" className="px-4 py-6 stack-y-6">
        {/* PRIMARY MODE TOGGLE (Holiday Pass vs Classic Packages) */}
        <div className="flex items-center p-1 rounded-2xl bg-[#FAF5EE] border border-orange-200/80">
          <button type="button" onClick={() => setMobilePrimaryMode("holiday_pass")} className={primaryMode === "holiday_pass" ? modeActive : modeIdle}>
            {/* Spaces matter once the original script strips this button's flex layout. */}
            <TicketIcon className="w-3.5 h-3.5 text-white" /> <span>Holiday Pass</span>{" "}
            <span className="text-[9px] font-extrabold bg-amber-300 text-[#2D1E18] px-1.5 rounded-full">Save 35%</span>
          </button>
          <button
            type="button"
            onClick={() => setMobilePrimaryMode("classic_packages")}
            className={primaryMode === "classic_packages" ? modeActive : modeIdle}
          >
            <CubeIcon className="w-3.5 h-3.5 text-neutral-600" /> <span>Tour Packages</span>
          </button>
        </div>

        {/* VIEW 1: MOBILE HOLIDAY PASS (PASSPRIVÉ) */}
        {primaryMode === "holiday_pass" && (
          <div className="stack-y-5">
            {/* Pass Header & Sub-Toggle */}
            <div className="p-4 rounded-3xl bg-white border border-orange-100 stack-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#E05A47] tracking-wider">Digital Attraction Pass</span>
                  <h2 className="text-base font-black text-[#2D1E18]">
                    <span>{d.name}</span> Holiday Pass
                  </h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">60-Day Validity</span>
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">
                Skip the gate ticket lines and save up to 35% on top experiences. Lock any pass for ₹1,999 today!
              </p>

              {/* Sub-Toggle: Curated vs BYOP */}
              <div className="flex items-center gap-1 bg-[#FAF5EE] p-1 rounded-2xl">
                <button type="button" onClick={() => setMobilePassSubMode("bundles")} className={bundlesBtn}>
                  Curated Passes (4)
                </button>
                <button type="button" onClick={() => setMobilePassSubMode("byop")} className={byopBtn}>
                  <span>Build Your Own</span>
                  <span className="text-[9px] font-bold bg-amber-400 text-neutral-950 px-1.5 rounded-full">Save 35%</span>
                </button>
              </div>
            </div>

            {passSubMode === "bundles" ? (
              <CuratedBundles
                destination={d}
                bundles={catalog.passBundles[currentDest] || []}
                onLock={(bundle) =>
                  openPassDrawer({
                    title: bundle.name,
                    destinationName: d.name,
                    items: bundle.includedItems || [],
                    gatePrice: bundle.gatePrice,
                    passPrice: bundle.passPrice,
                    savings: bundle.savingsAmount,
                    savingsPct: bundle.savingsPercent,
                  })
                }
              />
            ) : (
              <ByopSection
                destination={d}
                category={byopCategory}
                onCategory={setByopCategory}
                selected={selectedByopItems}
                onToggle={toggleByopItem}
                onLock={openPassDrawer}
              />
            )}
          </div>
        )}

        {/* VIEW 2: CLASSIC TOUR PACKAGES (5N/6D) */}
        {primaryMode === "classic_packages" && (
          <PackagesList
            destination={d}
            category={currentCategory}
            onSelect={(pkg) => openBookingDrawer(pkg)}
          />
        )}
      </section>

      {/* MOBILE PASS BOOKING DRAWER MODAL */}
      {passDrawerOpen && passBooking && (
        <PassDrawer data={passBooking} destinationKey={currentDest} onClose={() => setPassDrawerOpen(false)} />
      )}

      {/* HOW IT WORKS */}
      <section id="howItWorks" className="px-4 py-8 bg-[#FAF5EE] rounded-3xl mx-3 stack-y-5">
        <div className="text-center stack-y-1">
          <span className="text-[11px] font-mono uppercase font-bold text-[#E05A47]">Hassle-Free Booking</span>
          <h2 className="text-xl font-black text-[#2D1E18]">How the ₹1,999 Pass Works</h2>
        </div>

        <div className="stack-y-3 text-xs">
          {(
            [
              ["bg-[#E05A47]", "1", "Lock In with ₹1,999", "Pay just ₹1,999 entry token. Direct wholesale rates are locked for your room."],
              [
                "bg-amber-500",
                "2",
                "Pick Your Comfort Date",
                "Our AI concierge reaches out to agree on a flexible date you are comfortable paying the balance.",
              ],
              [
                "bg-emerald-600",
                "3",
                "Clear Balance & Fly",
                "Settle the pending amount before the hotel penalty cutoff buffer. Your official hotel vouchers are instantly delivered.",
              ],
            ] as const
          ).map(([bg, n, title, body]) => (
            <div key={n} className="p-3.5 rounded-2xl bg-white border border-orange-100 stack-y-1">
              <div className="flex items-center gap-2 font-bold text-[#2D1E18]">
                <span className={`w-5 h-5 rounded-full ${bg} text-white flex items-center justify-center text-[10px]`}>{n}</span>
                <span>{title}</span>
              </div>
              <p className="text-neutral-600 pl-7">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIFESTYLE PASS (SHOWN ONLY ON MAURITIUS) */}
      {currentDest === "mauritius" && (
        <section id="lifestylePass" className="px-4 py-8 stack-y-4">
          <div className="p-5 rounded-3xl bg-linear-to-tr/srgb from-[#2D1E18] to-[#42281D] text-white stack-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-400/30">Mauritius Exclusive</span>
              <span className="text-xs text-emerald-400 font-bold">100% Included</span>
            </div>
            <h3 className="text-lg font-black">PassPrivé Lifestyle Pass</h3>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              Enjoy up to 20% privilege cashback across 80+ fine-dining waterfront restaurants, catamarans, and wellness spas throughout Grand Baie,
              Pereybere, and Flic-en-Flac.
            </p>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="px-4 py-8 bg-[#2D1E18] text-white rounded-t-3xl stack-y-6 text-xs mt-8">
        <div className="stack-y-2">
          <div className="font-extrabold text-base">PassPrivé Travel</div>
          <p className="text-amber-100/70 text-[11px] leading-relaxed">
            Curated luxury vacations across 10 international destinations. Powered by verified B2B wholesaler rates &amp; AI-human concierge synergy.
          </p>
        </div>

        <div className="pt-3 border-t border-white/10 stack-y-2 text-[11px] text-amber-100/80">
          <div>WhatsApp Hotline: +91 78382 15147</div>
          <div>Email: concierge@passprive.travel</div>
          <div>Express Towers, Nariman Point, Mumbai</div>
        </div>

        <div className="pt-3 border-t border-white/10 text-[10px] text-amber-100/80 flex flex-col gap-1">
          <div>© 2026 PassPrivé Travel (Subsidiary of Fos Enterprises).</div>
          <div className="flex gap-3">
            <a href="#" className="underline">
              Terms of Service
            </a>
            <a href="#" className="underline">
              48h Refund Guarantee
            </a>
            <a href="#" className="underline">
              Privacy (DPDP Act)
            </a>
          </div>
        </div>
      </footer>

      {/* FIXED BOTTOM ACTION BAR (iOS Native Style) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-neutral-500 font-medium block">Starting advance</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-[#E05A47]">₹1,999</span>
            <span className="text-[10px] text-neutral-400 font-semibold">/ booking</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={CONCIERGE_WA} target="_blank" className="p-2.5 rounded-xl bg-[#25D366] text-white shadow-xs flex items-center justify-center">
            <WhatsAppIcon className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => openBookingDrawer()}
            className="px-5 py-2.5 rounded-xl bg-linear-to-r/srgb from-[#E05A47] to-[#EA580C] text-white font-extrabold text-xs shadow-md shadow-[#E05A47]/30 active:scale-95 transition-transform"
          >
            Lock in for ₹1,999
          </button>
        </div>
      </div>

      {/* BOOKING CHECKOUT DRAWER (DYNAMIC REGIONS, FLIGHTS & UPSELLS) */}
      {bookingDrawerOpen && selectedPackage && (
        <BookingDrawer
          destination={d}
          pkg={selectedPackage}
          state={drawer}
          onChange={rerenderDrawer}
          onClose={() => setBookingDrawerOpen(false)}
        />
      )}
    </>
  );
}

function baseRegions(catalog: Catalog, destKey: string): string[] {
  const d = catalog.destinations[destKey];
  const base = d?.regions?.find((r) => r.included) || d?.regions?.[0];
  return base ? [base.id] : [];
}
