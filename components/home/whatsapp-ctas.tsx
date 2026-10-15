"use client";

import { useEffect, useState } from "react";

import { ChatIcon } from "./icons";
import { btnOutlineUnsized, btnWaUnsized, section, sectionInner } from "./styles";
import { useTripPlanner } from "./trip-planner";

// Static links shown until the planner syncs them with the selected trip and date.
const FINAL_WA_DEFAULT = "https://wa.me/917838215147?text=Hi!%20I%20want%20to%20plan%20a%20Mauritius%20trip%20with%20PassPrive.";
const FLOAT_WA_DEFAULT = "https://wa.me/917838215147?text=Hi!%20I%20want%20to%20plan%20a%20Mauritius%20trip.";

export function FinalCta() {
  const { syncedWaHref } = useTripPlanner();

  return (
    <section id="final-cta" className={`${section} pt-2.5!`}>
      <div className={sectionInner}>
        <div className="bg-[linear-gradient(135deg,#241A12_0%,#150F0B_100%)] border border-[rgba(232,184,114,0.25)] rounded-3xl px-7 py-[42px] text-center shadow-[0_16px_40px_-12px_rgba(26,20,14,0.25)] max-w-[860px] mx-auto max-mob:px-4 max-mob:py-7 max-mob:rounded-[18px]">
          <span className="block font-hand text-[1.6rem] text-pp-goldbright font-bold mb-1.5 max-mob:text-[1.3rem]">
            ready for turquoise lagoons &amp; warm sunsets?
          </span>
          <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.5rem)] font-extrabold text-white tracking-[-0.02em] mb-2 leading-[1.12] max-mob:text-[1.6rem]">
            Leave the planning to us.
            <br />
            Just pack your sunglasses.
          </h2>
          <p className="text-[rgba(245,237,226,0.85)] text-[0.97rem] mb-6 font-medium max-mob:text-[0.88rem]">
            Talk directly with us on WhatsApp. We will share your custom day-by-day itinerary, hotel options, and free VIP app access in 15 minutes.
          </p>
          <div className="flex gap-3 justify-center flex-wrap max-mob:flex-col max-mob:w-full max-mob:gap-2.5">
            <a
              id="final-wa"
              href={syncedWaHref ?? FINAL_WA_DEFAULT}
              target="_blank"
              rel="noopener"
              className={`${btnWaUnsized} text-[1rem] px-[30px] py-[15px] max-mob:w-full max-mob:justify-center`}
            >
              <ChatIcon />
              Plan My Trip on WhatsApp
            </a>
            <a href="#trips" className={`${btnOutlineUnsized} text-[1rem] px-7 py-[15px] max-mob:w-full max-mob:justify-center`}>
              Explore Trips
            </a>
          </div>
          <p className="mt-4 text-[0.84rem] text-[rgba(245,237,226,0.68)] font-medium">
            Direct on WhatsApp · 15-minute reply · 100% free consultation
          </p>
        </div>
      </div>
    </section>
  );
}

/** Floating WhatsApp button: hidden over the hero, glides in after 300px of scroll. */
export function FloatingWhatsApp() {
  const { syncedWaHref } = useTripPlanner();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      id="float-wa"
      href={syncedWaHref ?? FLOAT_WA_DEFAULT}
      target="_blank"
      rel="noopener"
      className={`fixed bottom-5 right-5 z-[200] flex items-center gap-2 bg-pp-wa text-white font-display font-extrabold text-[0.88rem] px-[18px] py-[11px] rounded-full shadow-[0_6px_20px_-3px_rgba(23,136,88,0.45)] transition-[opacity,translate,background-color] duration-[250ms,250ms,180ms] ease-[ease] hover:bg-pp-wahover hover:-translate-y-0.5 ${
        show ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
      }`}
    >
      <ChatIcon />
      WhatsApp Us
    </a>
  );
}
