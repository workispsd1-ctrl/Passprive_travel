"use client";

import { useEffect, useRef } from "react";

import type { TripCategory } from "@/lib/trips";

import { btnPrimary } from "./styles";
import { useTripPlanner } from "./trip-planner";

const CHIPS: { crew: TripCategory; label: string }[] = [
  { crew: "couple", label: "Couple Trip" },
  { crew: "family", label: "Family Trip" },
  { crew: "friends", label: "Friends Trip" },
];

const tabletTextShadow = "max-tab:[text-shadow:0_1px_2px_rgba(252,249,245,0.95)]";

const chipBase =
  "font-display text-[0.84rem] font-bold px-[18px] py-2 rounded-full border-[1.5px] cursor-pointer transition-all duration-[180ms] ease-[ease] max-tab:backdrop-blur-[8px] max-mob:shrink-0 max-mob:px-3.5 max-mob:py-[7px] max-mob:text-[0.8rem]";
// On tablet/mobile the original `.chips .chip` rule out-ranked `.chip:hover`, so hover colors are neutralized there.
const chipIdle =
  "bg-white text-pp-ink border-[rgba(26,20,14,0.18)] hover:border-pp-orange hover:text-pp-orange max-tab:bg-[rgba(255,255,255,0.94)] max-tab:border-[rgba(26,20,14,0.2)] max-tab:shadow-[0_2px_8px_rgba(26,20,14,0.06)] max-tab:hover:border-[rgba(26,20,14,0.2)] max-tab:hover:text-pp-ink";
const chipActive =
  "bg-pp-orange text-white border-pp-orange shadow-[0_4px_12px_rgba(255,77,18,0.35)] max-tab:shadow-[0_4px_12px_rgba(224,90,71,0.35)]";

export function Hero() {
  const { activeCrew, selectCrew } = useTripPlanner();
  const videoRef = useRef<HTMLVideoElement>(null);

  // React sets `muted` as a property, which is too late for autoplay policies; enforce it on mount.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  return (
    <section id="hero" className="max-tab:relative max-tab:overflow-hidden max-tab:bg-pp-sand">
      <div className="grid grid-cols-[1fr_1.05fr] gap-10 items-center pt-[88px] px-8 pb-9 max-w-[1240px] mx-auto max-tab:grid-cols-[1fr] max-tab:relative max-tab:pt-[92px] max-tab:px-6 max-tab:pb-[38px] max-tab:gap-0 max-mob:pt-[74px] max-mob:px-4 max-mob:pb-[26px]">
        <div className="max-tab:relative max-tab:z-[2] max-tab:max-w-[640px] max-tab:mx-auto max-mob:max-w-full">
          <div className="hidden max-tab:inline-flex max-tab:items-center max-tab:gap-1.5 max-tab:mb-3 max-tab:font-display max-tab:text-[0.8rem] max-tab:font-bold max-tab:bg-[rgba(255,255,255,0.94)] max-tab:border-[1.5px] max-tab:border-[rgba(224,90,71,0.28)] max-tab:text-pp-orange max-tab:rounded-full max-tab:px-3.5 max-tab:py-[5px] max-tab:shadow-[0_4px_12px_rgba(26,20,14,0.08)] max-tab:backdrop-blur-[10px] max-mob:text-[0.74rem] max-mob:px-3 max-mob:py-1 max-mob:mb-2">
            + Free PassPrivé App Included
          </div>
          <span className="block font-hand text-[1.55rem] text-pp-teal font-bold mb-2 max-tab:text-[1.45rem] max-tab:mb-1.5 max-tab:[text-shadow:0_1px_2px_rgba(252,249,245,0.95),0_0_12px_rgba(252,249,245,0.9)] max-mob:text-[1.35rem] max-mob:mb-1">
            your private mauritius escape
          </span>
          <h1 className="font-display text-[clamp(2.4rem,4.4vw,3.7rem)] font-extrabold leading-[1.06] text-pp-ink tracking-[-0.03em] mb-3.5 max-tab:text-[clamp(2.3rem,5.2vw,3.1rem)] max-tab:mb-3 max-tab:[text-shadow:0_1px_2px_rgba(252,249,245,0.95),0_0_16px_rgba(252,249,245,0.85)] max-mob:text-[2.2rem] max-mob:mb-2.5">
            Your <span className="text-pp-orange">Mauritius trip,</span>
            <br />
            sorted.
          </h1>
          {/* Tablet weight was 550 in the original CSS, which rendered as 600 with the static font files it loaded. */}
          <p
            className={`text-[1.02rem] text-pp-inksoft max-w-[44ch] mb-[22px] leading-[1.55] max-tab:mb-5 max-tab:text-[#2E251E] max-tab:font-semibold ${tabletTextShadow} max-mob:text-[0.94rem] max-mob:mb-4 max-mob:leading-[1.52]`}
          >
            Handpicked boutique stays, lagoon days, private chauffeur transfers — and free PassPrivé App access included.
          </p>

          <span
            className={`block font-display text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-pp-inksoft mb-2 max-tab:text-[#2E251E] ${tabletTextShadow} max-mob:text-[0.68rem] max-mob:mb-1.5`}
          >
            Choose your trip category:
          </span>
          <div className="flex gap-2 flex-wrap mb-[22px] max-mob:flex-nowrap max-mob:overflow-x-auto max-mob:pb-1 max-mob:no-scrollbar">
            {CHIPS.map(({ crew, label }) => (
              <button
                key={crew}
                type="button"
                data-crew={crew}
                onClick={() => selectCrew(crew)}
                className={`${chipBase} ${crew === activeCrew ? chipActive : chipIdle}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-4 max-mob:mb-3">
            <a
              href="#trips"
              className={`${btnPrimary} max-mob:w-full max-mob:justify-center max-mob:px-5 max-mob:shadow-[0_6px_18px_rgba(224,90,71,0.35)] max-mob:hover:shadow-[0_6px_18px_rgba(224,90,71,0.35)]`}
            >
              Explore Trips
            </a>
          </div>
          <p
            className={`font-hand text-[1.3rem] text-pp-inksoft font-semibold max-tab:text-[#2E251E] max-tab:font-bold ${tabletTextShadow} max-mob:text-[1.1rem] max-mob:text-center`}
          >
            Handcrafted itineraries · flexible payments · 100% transparent rates
          </p>
        </div>

        {/* Hero visual: clean island view with no overlaid buttons */}
        <div className="relative rounded-3xl overflow-hidden h-[460px] shadow-[0_16px_40px_-12px_rgba(26,20,14,0.18)] max-tab:absolute! max-tab:inset-0! max-tab:w-full! max-tab:h-full! max-tab:rounded-none! max-tab:shadow-none! max-tab:z-[1]! max-tab:pointer-events-none!">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=1200"
            className="w-full h-full object-cover max-tab:opacity-65 max-tab:saturate-[1.2] max-tab:brightness-[0.98]"
          >
            <source src="https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(160deg,rgba(6,41,35,0.35)_0%,rgba(8,59,50,0.15)_60%,rgba(0,0,0,0.12)_100%)] max-tab:bg-[linear-gradient(180deg,rgba(252,249,245,0.55)_0%,rgba(252,249,245,0.30)_25%,rgba(252,249,245,0.42)_65%,rgba(252,249,245,0.92)_100%)]" />
          <div className="absolute top-4 left-4 bg-[rgba(252,249,245,0.95)] backdrop-blur-[8px] px-3.5 py-2 rounded-xl text-pp-orange shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-tab:hidden!">
            + Free PassPrivé App Included
          </div>
        </div>
      </div>
    </section>
  );
}
