/**
 * Shared Tailwind class lists for the landing page. Breakpoints are desktop-first:
 * `max-tab:` = <=1024px, `max-mob:` = <=680px (see app/globals.css).
 */

export const section = "py-[42px] max-mob:py-7";
export const sectionInner = "max-w-[1240px] mx-auto px-6 max-mob:px-4";
export const sectionHead = "text-center mb-6 max-mob:mb-4";
export const sectionKicker = "block font-hand text-[1.45rem] text-pp-teal font-bold mb-1";
export const sectionTitle =
  "font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-extrabold text-pp-ink leading-[1.08] tracking-[-0.02em] mb-1.5 max-mob:text-[1.7rem]";
export const sectionSub = "text-[0.98rem] text-pp-inksoft max-w-[52ch] mx-auto max-mob:text-[0.88rem]";

/** Horizontal swipe carousel behaviour shared by trips, steps and reviews on tablet/mobile. */
export const carouselTablet = "max-tab:flex max-tab:overflow-x-auto max-tab:snap-x max-tab:snap-mandatory max-tab:no-scrollbar";
export const carouselMobile = "max-mob:scroll-smooth max-mob:-mx-4";

export const swipePill =
  "hidden max-tab:inline-flex items-center justify-center gap-1.5 mt-[-2px] mx-auto mb-3.5 text-[0.76rem] font-bold text-pp-teal bg-[rgba(14,111,99,0.08)] px-3.5 py-[5px] rounded-full w-fit tracking-[0.04em]";

const btnPrimaryCore =
  "inline-flex items-center gap-2 bg-pp-orange text-white font-display font-extrabold rounded-full whitespace-nowrap border-none cursor-pointer transition-[translate,box-shadow] duration-[180ms] ease-[ease] hover:-translate-y-px";

/** `.btn-primary` with its default size and shadow. */
export const btnPrimary = `${btnPrimaryCore} text-[0.95rem] px-[26px] py-[13px] shadow-[0_8px_24px_-6px_rgba(255,77,18,0.5)] hover:shadow-[0_12px_28px_-6px_rgba(255,77,18,0.58)]`;

/** `.btn-primary` without size so callers can set their own (the original used inline styles). */
export const btnPrimaryUnsized = `${btnPrimaryCore} shadow-[0_8px_24px_-6px_rgba(255,77,18,0.5)] hover:shadow-[0_12px_28px_-6px_rgba(255,77,18,0.58)]`;

export const btnWaUnsized =
  "inline-flex items-center gap-2 bg-pp-wa text-white font-display font-extrabold rounded-full shadow-[0_4px_16px_-2px_rgba(23,136,88,0.35)] transition-[background-color,translate] duration-[180ms] ease-[ease] whitespace-nowrap border-none cursor-pointer hover:bg-pp-wahover hover:-translate-y-px";

export const btnOutlineUnsized =
  "inline-flex items-center gap-2 border-2 border-pp-orange text-pp-orange font-display font-extrabold rounded-full bg-transparent cursor-pointer transition-all duration-[180ms] ease-[ease] hover:bg-pp-orange hover:text-white";
