"use client";

import type { ReactNode } from "react";

import { TRIPS, type Trip } from "@/lib/trips";

import { CompassIcon, HomeIcon, PhoneIcon, PlaneIcon, TruckIcon } from "./icons";
import { section, sectionHead, sectionInner, sectionKicker, sectionSub, sectionTitle, swipePill } from "./styles";
import { useTripPlanner } from "./trip-planner";

const SPEC_ROWS: { icon: ReactNode; label: string; key: keyof Pick<Trip, "stay" | "flights" | "tours" | "travel" | "bonus"> }[] = [
  { icon: <HomeIcon />, label: "Stay:", key: "stay" },
  { icon: <PlaneIcon />, label: "Flights:", key: "flights" },
  { icon: <CompassIcon />, label: "Tours:", key: "tours" },
  { icon: <TruckIcon />, label: "Travel:", key: "travel" },
  { icon: <PhoneIcon />, label: "Bonus:", key: "bonus" },
];

function TripCard({ trip, active, onOpen }: { trip: Trip; active: boolean; onOpen: () => void }) {
  return (
    <article
      id={`card-${trip.category}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      tabIndex={0}
      role="button"
      aria-label={`View plan for ${trip.title}`}
      className={`group bg-white rounded-[22px] overflow-hidden shadow-[0_6px_24px_-8px_rgba(26,20,14,0.12)] flex flex-col cursor-pointer border-2 border-transparent transition-[translate,box-shadow,border-color] duration-[220ms] ease-[ease] hover:-translate-y-[3px] hover:shadow-[0_14px_36px_-10px_rgba(26,20,14,0.18)] max-tab:flex-[0_0_380px] max-tab:snap-start max-mob:flex-[0_0_86vw] max-mob:max-w-[320px] max-mob:snap-center max-mob:rounded-[20px] ${
        active ? "border-pp-teal! shadow-[0_0_0_3px_rgba(14,111,99,0.22),0_14px_36px_-10px_rgba(26,20,14,0.2)]!" : ""
      }`}
    >
      <div className="relative h-[210px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Pexels images rendered exactly as before */}
        <img
          src={trip.img}
          alt={trip.title}
          loading="lazy"
          className="w-full h-full object-cover transition-[scale] duration-[400ms] ease-[ease] group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 bg-[rgba(255,255,255,0.96)] text-pp-ink backdrop-blur-[6px] font-display text-[0.72rem] font-extrabold px-3 py-[5px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          {trip.location}
        </span>
        <span className="absolute top-3 right-3 bg-[rgba(26,20,14,0.78)] text-white backdrop-blur-[6px] font-display text-[0.72rem] font-extrabold px-3 py-[5px] rounded-full tracking-[0.02em]">
          {trip.duration}
        </span>
      </div>
      <div className="px-[22px] py-5 flex-1 flex flex-col gap-2 max-mob:pt-4 max-mob:px-4 max-mob:pb-3">
        <p className="font-hand text-[1.55rem] text-pp-teal font-bold leading-[1.1] mb-0.5 max-mob:text-[1.35rem]">{trip.forWho}</p>
        <h3 className="font-display text-[1.25rem] font-extrabold text-pp-ink leading-[1.24] tracking-[-0.02em] mb-1.5 max-mob:text-[1.12rem] max-mob:mb-2">
          {trip.title}
        </h3>
        <div className="flex flex-col gap-[9px] mt-1 flex-1 max-mob:gap-[7px]">
          {SPEC_ROWS.map(({ icon, label, key }) => (
            <div key={key} className="flex items-start gap-2.5 text-[0.88rem] leading-[1.4] max-mob:gap-2 max-mob:text-[0.82rem]">
              <div className="w-6 h-6 rounded-md bg-pp-sandwarm flex items-center justify-center shrink-0 mt-px text-pp-teal">
                {icon}
              </div>
              <div className="flex-1 text-pp-inksoft">
                <strong className="text-pp-ink font-bold font-display text-[0.86rem]">{label}</strong> {trip[key]}
              </div>
            </div>
          ))}
        </div>

        {/* Relaxed handwritten note: all-inclusive & free cancel */}
        <div className="flex items-center justify-between pt-2 px-0.5 pb-0.5 mt-1.5">
          <span className="font-hand text-[1.35rem] text-pp-teal font-bold leading-[1.2]">all-inclusive &middot; free cancel ~</span>
          <span className="text-[0.74rem] text-pp-inksoft font-semibold">5 nights stay</span>
        </div>
      </div>
      <div className="px-[22px] pb-5 max-mob:px-4 max-mob:pb-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="w-full px-4 py-[11px] bg-pp-sand border-[1.5px] border-[rgba(26,20,14,0.14)] rounded-xl font-display text-[0.86rem] font-extrabold text-pp-ink cursor-pointer flex items-center justify-between transition-all duration-[180ms] ease-[ease] hover:border-pp-orange hover:text-pp-orange hover:bg-white max-mob:px-3.5 max-mob:py-2.5 max-mob:text-[0.82rem]"
        >
          <span>Customize plan &amp; view rates</span>
          <span>&rarr;</span>
        </button>
      </div>
    </article>
  );
}

export function TripsSection() {
  const { activeCrew, openModal } = useTripPlanner();

  return (
    <section id="trips" className={`${section} bg-pp-sandwarm`}>
      <div className={sectionInner}>
        <div className={sectionHead}>
          <span className={sectionKicker}>hotels, lagoon days, private travel &amp; island experiences</span>
          <h2 className={sectionTitle}>
            Curated <span className="text-pp-orange">Mauritius Trips</span>
          </h2>
          <p className={sectionSub}>
            One complete, handpicked package per category. Click any card to customize the exact inclusions.
          </p>
        </div>
        <div className={swipePill}>
          <span className="text-[0.95rem] text-pp-orange">&larr;</span> Swipe trips{" "}
          <span className="text-[0.95rem] text-pp-orange">&rarr;</span>
        </div>

        <div className="grid grid-cols-[repeat(3,1fr)] gap-[22px] max-tab:flex max-tab:overflow-x-auto max-tab:snap-x max-tab:snap-mandatory max-tab:scroll-smooth max-tab:gap-[18px] max-tab:pt-2 max-tab:px-4 max-tab:pb-6 max-tab:no-scrollbar max-mob:gap-3.5 max-mob:pt-1 max-mob:pb-5 max-mob:-mx-4">
          {TRIPS.map((trip) => (
            <TripCard key={trip.id} trip={trip} active={trip.category === activeCrew} onOpen={() => openModal(trip.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}
