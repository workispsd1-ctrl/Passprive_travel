export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-8 py-3 bg-[rgba(252,249,245,0.92)] backdrop-blur-[12px] border-b border-[rgba(26,20,14,0.08)] max-mob:px-4 max-mob:py-2 max-mob:h-14">
      <a href="#hero" className="flex items-center gap-2 max-mob:gap-1.5">
        <span className="font-display font-extrabold text-[1.05rem] text-pp-ink tracking-[-0.02em] max-mob:text-[0.95rem]">
          Pass<em>Privé</em> Travel
        </span>
        <span className="font-hand text-[1.25rem] text-pp-teal font-bold max-mob:text-[1.15rem]">Mauritius</span>
      </a>
      <nav className="flex gap-6 max-mob:hidden">
        {[
          ["#trips", "Mauritius Trips"],
          ["#app", "Free App Access"],
          ["#faq", "FAQ"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="text-[0.9rem] font-semibold text-pp-inksoft hover:text-pp-orange">
            {label}
          </a>
        ))}
      </nav>
      <a
        href="#trips"
        className="bg-pp-orange text-white font-display font-extrabold text-[0.88rem] px-[18px] py-2 rounded-full shadow-[0_4px_14px_-3px_rgba(255,77,18,0.45)] whitespace-nowrap max-mob:px-3.5 max-mob:py-[7px] max-mob:text-[0.8rem]"
      >
        Explore Trips
      </a>
    </header>
  );
}
