import Link from "next/link";

import { CheckIcon } from "./icons";
import { btnPrimary, section, sectionHead, sectionInner, sectionKicker, sectionTitle, swipePill } from "./styles";

const swipe = (label: string) => (
  <div className={swipePill}>
    <span className="text-[0.95rem] text-pp-orange">&larr;</span> {label}{" "}
    <span className="text-[0.95rem] text-pp-orange">&rarr;</span>
  </div>
);

const STEPS = [
  { title: "Pick your trip", body: "Click any trip card above to view all hotels, activities, and transfers included." },
  { title: "Customize on WhatsApp", body: "Send your dates and wishlist. We refine hotels, private rides, and tours in 15 minutes." },
  { title: "Confirm & fly", body: "Book with flexible milestone payments before departure. Everything on-ground is arranged." },
];

export function HowItWorks() {
  return (
    <section className={section}>
      <div className={sectionInner}>
        <div className={sectionHead}>
          <span className={sectionKicker}>simple process</span>
          <h2 className={sectionTitle}>How It Works</h2>
        </div>
        {swipe("Swipe steps")}
        <div className="grid grid-cols-[repeat(3,1fr)] gap-[18px] max-w-[960px] mx-auto max-tab:flex max-tab:overflow-x-auto max-tab:snap-x max-tab:snap-mandatory max-tab:gap-4 max-tab:pt-2 max-tab:px-4 max-tab:pb-5 max-tab:no-scrollbar max-mob:scroll-smooth max-mob:gap-3 max-mob:pt-1 max-mob:pb-[18px] max-mob:-mx-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-[18px] px-[18px] py-[22px] text-center shadow-[0_4px_18px_-6px_rgba(26,20,14,0.08)] border border-[rgba(26,20,14,0.06)] max-tab:flex-[0_0_280px] max-tab:snap-start max-mob:flex-[0_0_74vw] max-mob:max-w-[250px] max-mob:snap-center max-mob:px-4 max-mob:py-[18px]"
            >
              {/* In the original CSS `.step-card p` out-ranked `.step-num`, so the number renders small and ink-soft. */}
              <p className="font-hand text-[0.88rem] text-pp-inksoft font-bold leading-[1.45] mb-1">{i + 1}.</p>
              <h3 className="font-display font-extrabold text-[1.05rem] tracking-[-0.02em] mb-1 text-pp-ink">{step.title}</h3>
              <p className="text-[0.88rem] text-pp-inksoft leading-[1.45]">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const APP_PERKS = [
  ["1-Tap Table Bookings", "skip waitlists at beachfront restaurants & sunset beach clubs"],
  ["3% Instant Cashback", "credited automatically on every bill at partner spots"],
  ["Member Access", "private catamarans, rum tastings, and reserved sunbeds"],
];

const APP_CARD_ITEMS = [
  "Skip the 1,000-person public waitlist",
  "1-tap tables in Grand Baie & Le Morne",
  "3% instant cashback at partner spots",
];

export function AppPromo() {
  return (
    <section id="app" className={section}>
      <div className={sectionInner}>
        <div className="bg-pp-ink rounded-3xl px-11 py-[38px] grid grid-cols-[1fr_auto] gap-10 items-center shadow-[0_16px_40px_-12px_rgba(26,20,14,0.25)] max-tab:grid-cols-[1fr] max-tab:p-8 max-tab:gap-7 max-mob:px-4 max-mob:py-[22px] max-mob:rounded-[18px] max-mob:gap-5">
          <div>
            <span className="block font-hand text-[1.5rem] text-pp-goldbright font-bold mb-1.5 max-mob:text-[1.25rem]">
              free add-on with every trip · worth 7,000 MUR (~₹13,500)
            </span>
            <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.4rem)] font-extrabold text-white leading-[1.1] tracking-[-0.02em] mb-2.5 max-mob:text-[1.55rem]">
              Free <span className="text-pp-orange2">PassPrivé App</span> access, included.
            </h2>
            <p className="text-[rgba(245,237,226,0.8)] text-[0.95rem] mb-[22px] max-w-[44ch] max-mob:text-[0.88rem] max-mob:mb-4">
              We unlock your VIP app before you fly. Over 1,000 people are on the waitlist, but you get direct member access.
            </p>

            <div className="flex flex-col gap-2.5 mb-6">
              {APP_PERKS.map(([title, body]) => (
                <div key={title} className="flex gap-2.5 items-center max-mob:text-[0.85rem]">
                  <div className="w-5 h-5 rounded-full bg-[rgba(255,122,0,0.22)] shrink-0 flex items-center justify-center text-pp-orange2">
                    <CheckIcon />
                  </div>
                  <p className="text-[0.9rem] text-[rgba(245,237,226,0.9)] font-medium">
                    <strong className="text-white">{title}</strong> — {body}
                  </p>
                </div>
              ))}
            </div>

            <a href="#trips" className={`${btnPrimary} max-mob:w-full max-mob:justify-center`}>
              View Trips &amp; Claim Free App
            </a>
          </div>

          <div className="bg-[linear-gradient(145deg,#182622_0%,#0d1b18_100%)] border border-[rgba(232,184,114,0.3)] rounded-[18px] px-[22px] py-6 min-w-[270px] max-w-[290px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)] max-tab:max-w-full max-tab:min-w-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="font-display font-extrabold text-white text-[0.95rem]">PassPrivé App</span>
              <span className="font-display text-[0.65rem] font-extrabold uppercase tracking-[0.08em] bg-[rgba(255,122,0,0.25)] text-pp-orange2 px-2 py-[3px] rounded-full">
                VIP Add-On
              </span>
            </div>
            <div className="font-display text-[1.4rem] font-extrabold text-white mb-1">Traveler VIP Pass</div>
            <div className="flex items-center gap-2 mb-4">
              <s className="text-[rgba(255,255,255,0.45)] text-[0.85rem]">7,000 MUR (₹13,500)</s>
              <span className="bg-pp-orange text-white font-display text-[0.72rem] font-extrabold px-2 py-0.5 rounded-md">
                INCLUDED FREE
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {APP_CARD_ITEMS.map((item) => (
                <div key={item} className="flex gap-2 items-center text-[0.85rem] text-[rgba(255,255,255,0.85)]">
                  <div className="w-4 h-4 rounded-full bg-[rgba(14,111,99,0.4)] shrink-0 flex items-center justify-center text-[#5ecfb4]">
                    <CheckIcon size={10} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  {
    img: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300",
    name: "Couple Traveler",
    from: "Verified Couple · Mumbai",
    quote: "Our catamaran cruise and Veranda Grand Baie stay were booked within minutes. The free app got us sunset tables every night.",
    tag: "5 nights in Grand Baie",
  },
  {
    img: "https://images.pexels.com/photos/1683975/pexels-photo-1683975.jpeg?auto=compress&cs=tinysrgb&w=300",
    name: "Family Traveler",
    from: "Family of 4 · Bengaluru",
    quote: "The team replied in 10 minutes and booked Casela Nature Park plus a calm shallow lagoon hotel for the kids.",
    tag: "family week at Ambre Resort",
  },
  {
    img: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=300",
    name: "Friend Group",
    from: "5 Friends · Delhi",
    quote: "Flexible payments made quad biking and the catamaran party super easy to budget. The app saved us a ton at beach clubs.",
    tag: "Bel Ombre + flexible payments",
  },
];

export function Reviews() {
  return (
    <section className={`${section} bg-pp-sandwarm`}>
      <div className={sectionInner}>
        <div className={sectionHead}>
          <span className={sectionKicker}>happy travelers</span>
          <h2 className={sectionTitle}>Real Trips, Real People</h2>
        </div>
        {swipe("Swipe reviews")}
        <div className="grid grid-cols-[repeat(3,1fr)] gap-[18px] max-tab:flex max-tab:overflow-x-auto max-tab:snap-x max-tab:snap-mandatory max-tab:gap-4 max-tab:pt-2 max-tab:px-4 max-tab:pb-5 max-tab:no-scrollbar max-mob:scroll-smooth max-mob:gap-3 max-mob:pt-1 max-mob:pb-[18px] max-mob:-mx-4">
          {REVIEWS.map((r) => (
            <article
              key={r.name}
              className="bg-white rounded-[18px] p-5 shadow-[0_4px_18px_-6px_rgba(26,20,14,0.08)] border border-[rgba(26,20,14,0.06)] flex flex-col justify-between max-tab:flex-[0_0_340px] max-tab:snap-start max-mob:flex-[0_0_84vw] max-mob:max-w-[300px] max-mob:snap-center max-mob:px-[18px] max-mob:py-5"
            >
              <div>
                <div className="flex gap-2.5 items-center mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Pexels avatar rendered exactly as before */}
                  <img src={r.img} alt={r.name} className="w-[42px] h-[42px] rounded-full object-cover" />
                  <div>
                    <p className="font-display font-extrabold text-[0.95rem] text-pp-ink">{r.name}</p>
                    <p className="text-[0.78rem] text-pp-inksoft">{r.from}</p>
                  </div>
                </div>
                <p className="text-[0.9rem] text-pp-ink leading-[1.5] mb-3 max-mob:text-[0.88rem]">&quot;{r.quote}&quot;</p>
              </div>
              <span className="font-hand text-[1.15rem] text-pp-teal font-bold">{r.tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "How do I book or customize a trip?",
    a: "Pick any trip card above or message us on WhatsApp with your dates and group size. We share a handcrafted day-by-day itinerary with transparent pricing in 15 minutes.",
  },
  {
    q: "How do flexible payments work?",
    a: "We provide clear milestone payments scheduled before your departure. You review every hotel and activity confirmation with zero hidden fees.",
  },
  {
    q: "What do I get inside the free PassPrivé App?",
    a: "You get free VIP access (worth 7,000 MUR / ₹13,500) for 1-tap dining bookings in Grand Baie and Le Morne, up to 3% instant bill cashback, and members-only beach club perks.",
  },
  {
    q: "Can I customize the hotels and activities in any package?",
    a: "Yes. Click any trip card in the section above, tick or untick what you want, and send your exact checklist to WhatsApp. We tailor your plan from there.",
  },
];

export function Faq() {
  return (
    <section id="faq" className={section}>
      <div className={sectionInner}>
        <div className={sectionHead}>
          <span className={sectionKicker}>good to know</span>
          <h2 className={sectionTitle}>Quick Answers</h2>
        </div>
        <div className="max-w-[680px] mx-auto flex flex-col gap-2">
          {FAQS.map(({ q, a }, i) => (
            <details
              key={q}
              open={i === 0}
              className="group bg-white rounded-[14px] overflow-hidden shadow-[0_2px_10px_-3px_rgba(26,20,14,0.06)] border border-[rgba(26,20,14,0.07)]"
            >
              <summary className="px-5 py-[15px] cursor-pointer font-display font-extrabold text-[0.95rem] tracking-[-0.01em] list-none flex justify-between items-center text-pp-ink [&::-webkit-details-marker]:hidden after:content-['+'] after:text-[1.3rem] after:font-extrabold after:text-pp-orange after:transition-[transform] after:duration-200 after:ease-[ease] group-open:after:content-['−']">
                {q}
              </summary>
              <p className="px-5 pb-[15px] text-[0.91rem] text-pp-inksoft leading-[1.55]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const LEGAL_LINKS = [
  ["/legal/privacy", "Privacy Policy"],
  ["/legal/terms", "Terms of Service"],
  ["/legal/refund-policy", "Cancellation & Refunds"],
  ["/legal/disclaimer", "Disclaimer"],
];

export function SiteFooter() {
  return (
    <footer className="max-w-[1240px] mx-auto px-6 pt-6 pb-7 max-mob:px-4 max-mob:py-6">
      <div className="flex justify-between items-center flex-wrap gap-4 pt-5 border-t border-[rgba(26,20,14,0.1)] max-mob:flex-col max-mob:items-start max-mob:gap-4">
        <div>
          <span className="font-display font-extrabold text-[1rem] text-pp-ink tracking-[-0.01em]">
            PassPrivé Travel <span className="font-hand text-[1.25rem] text-pp-teal font-bold ml-2">Mauritius</span>
          </span>
          <p className="text-[0.8rem] text-pp-inksoft mt-1 font-semibold">Passprive Platforms Private Ltd</p>
        </div>
        <div className="flex gap-[18px] flex-wrap max-mob:gap-x-[18px] max-mob:gap-y-3">
          {LEGAL_LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="text-[0.84rem] text-pp-inksoft font-medium hover:text-pp-orange">
              {label}
            </Link>
          ))}
        </div>
        <p className="text-[0.8rem] text-pp-inksoft">
          &copy; 2026 Passprive Platforms Private Ltd. Handcrafted Mauritius journeys for travelers from India.
        </p>
      </div>
    </footer>
  );
}
