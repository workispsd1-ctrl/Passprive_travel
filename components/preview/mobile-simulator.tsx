"use client";

import { useEffect, useRef, useState } from "react";

const DEVICES = {
  iphone16pro: { width: 393, height: 852, radius: "44px", chassisRadius: "54px" },
  iphone15: { width: 390, height: 844, radius: "42px", chassisRadius: "52px" },
  iphonese: { width: 375, height: 667, radius: "32px", chassisRadius: "42px" },
  pixel8: { width: 412, height: 915, radius: "38px", chassisRadius: "48px" },
  samsung: { width: 360, height: 800, radius: "36px", chassisRadius: "46px" },
} as const;
type DeviceKey = keyof typeof DEVICES;

// Studio backdrop colours toggled on <body> (the rest of its classes come from the layout).
const DARK_BODY = ["bg-[#15110E]", "text-neutral-100"];
const LIGHT_BODY = ["bg-[#F2ECE4]", "text-neutral-900"];

const control = "flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5";
const selectCls = "bg-transparent text-neutral-200 font-semibold focus:outline-hidden cursor-pointer";
const iconBtn = "p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors";

export function MobileSimulator() {
  const [device, setDevice] = useState<DeviceKey>("iphone15");
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState("1");
  const [isLightStudio, setIsLightStudio] = useState(false);
  const [clock, setClock] = useState("9:41");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const deviceRef = useRef<DeviceKey>(device);

  useEffect(() => {
    deviceRef.current = device;
  }, [device]);

  // Live clock in the status bar
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      setClock(`${now.getHours()}:${minutes < 10 ? "0" + minutes : minutes}`);
    };
    updateClock();
    const id = setInterval(updateClock, 10000);
    return () => clearInterval(id);
  }, []);

  // Auto-fit scale on load (and on resize) when the window is shorter than the device
  useEffect(() => {
    const autoScaleForScreen = () => {
      const availableHeight = window.innerHeight - 180;
      const targetHeight = DEVICES[deviceRef.current].height + 30;
      if (availableHeight < targetHeight) {
        const ratio = Math.max(0.65, Math.min(1, availableHeight / targetHeight));
        if (ratio < 0.85) setScale("0.82");
      }
    };
    autoScaleForScreen();
    window.addEventListener("resize", autoScaleForScreen);
    return () => window.removeEventListener("resize", autoScaleForScreen);
  }, []);

  // Studio backdrop lives on <body>
  useEffect(() => {
    document.body.classList.remove(...(isLightStudio ? DARK_BODY : LIGHT_BODY));
    document.body.classList.add(...(isLightStudio ? LIGHT_BODY : DARK_BODY));
  }, [isLightStudio]);

  const dev = DEVICES[device] || DEVICES.iphone15;
  const w = isLandscape ? dev.height : dev.width;
  const h = isLandscape ? dev.width : dev.height;

  const reloadFrame = () => {
    const iframe = iframeRef.current;
    if (iframe) iframe.src = iframe.src;
  };

  // Open a dedicated mobile-sized popup window
  const openMobilePopup = () => {
    const left = Math.max(0, (window.screen.width - dev.width) / 2);
    const top = Math.max(0, (window.screen.height - dev.height) / 2);
    window.open("/", "PassPriveMobile", `width=${dev.width},height=${dev.height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no`);
  };

  // Quick jump into the embedded page's hash
  const jumpTo = (hash: string) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      iframe.contentWindow!.location.hash = hash;
    } catch {
      iframe.src = "/" + hash;
    }
  };

  /** Calls a global function exposed by the embedded page, if it has one. */
  const callInFrame = (fnName: string, arg?: string) => {
    try {
      const fn = (iframeRef.current?.contentWindow as unknown as Record<string, unknown> | null)?.[fnName];
      if (typeof fn === "function") (fn as (a?: string) => void)(arg);
    } catch (e) {
      console.error("Error triggering action in iframe:", e);
    }
  };

  return (
    <>
      {/* Top Studio Control Bar */}
      <header className="w-full bg-[#1C1713]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr/srgb from-[#E05A47] to-[#F59E0B] flex items-center justify-center font-black text-white text-base shadow-md shadow-[#E05A47]/30">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">PassPrivé Travel</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                Mobile Simulator
              </span>
            </div>
            <p className="text-xs text-neutral-400">Live preview of responsive mobile experience</p>
          </div>
        </div>

        {/* Controls: Device Preset, Scale, Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Device Selector */}
          <div className={control}>
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <label htmlFor="deviceSelect" className="text-neutral-400 text-[11px] font-medium hidden sm:inline">
              Device:
            </label>
            <select id="deviceSelect" value={device} onChange={(e) => setDevice(e.target.value as DeviceKey)} className={selectCls}>
              <option value="iphone16pro" className="bg-[#2D1E18]">iPhone 16 Pro (393 × 852)</option>
              <option value="iphone15" className="bg-[#2D1E18]">iPhone 15 / 14 (390 × 844)</option>
              <option value="iphonese" className="bg-[#2D1E18]">iPhone SE (375 × 667)</option>
              <option value="pixel8" className="bg-[#2D1E18]">Google Pixel 8 (412 × 915)</option>
              <option value="samsung" className="bg-[#2D1E18]">Samsung S24 (360 × 800)</option>
            </select>
          </div>

          {/* Destination Switcher */}
          <div className={control}>
            <span className="text-neutral-400 text-[11px] font-medium hidden sm:inline">Destination:</span>
            <select defaultValue="mauritius" onChange={(e) => callInFrame("switchDestination", e.target.value)} className={selectCls}>
              <option value="mauritius" className="bg-[#2D1E18]">🇲🇺 Mauritius</option>
              <option value="dubai" className="bg-[#2D1E18]">🇦🇪 Dubai</option>
              <option value="paris" className="bg-[#2D1E18]">🇫🇷 Paris</option>
              <option value="switzerland" className="bg-[#2D1E18]">🇨🇭 Switzerland</option>
              <option value="bali" className="bg-[#2D1E18]">🇮🇩 Bali</option>
              <option value="maldives" className="bg-[#2D1E18]">🇲🇻 Maldives</option>
              <option value="thailand" className="bg-[#2D1E18]">🇹🇭 Thailand</option>
              <option value="singapore" className="bg-[#2D1E18]">🇸🇬 Singapore</option>
              <option value="vietnam" className="bg-[#2D1E18]">🇻🇳 Vietnam</option>
              <option value="australia" className="bg-[#2D1E18]">🇦🇺 Australia</option>
            </select>
          </div>

          {/* Scale Selector */}
          <div className={control}>
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
            <label htmlFor="scaleSelect" className="text-neutral-400 text-[11px] font-medium hidden sm:inline">
              Scale:
            </label>
            <select id="scaleSelect" value={scale} onChange={(e) => setScale(e.target.value)} className={selectCls}>
              <option value="1" className="bg-[#2D1E18]">100% (Actual)</option>
              <option value="0.9" className="bg-[#2D1E18]">90%</option>
              <option value="0.82" className="bg-[#2D1E18]">82% (Fit Laptop)</option>
              <option value="0.75" className="bg-[#2D1E18]">75%</option>
            </select>
          </div>

          {/* Rotate Orientation */}
          <button type="button" onClick={() => setIsLandscape((l) => !l)} className={iconBtn} title="Rotate Orientation">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Refresh Iframe */}
          <button type="button" onClick={reloadFrame} className={iconBtn} title="Refresh Live Site">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Studio Backdrop Switcher */}
          <button type="button" onClick={() => setIsLightStudio((l) => !l)} className={iconBtn} title="Toggle Light/Dark Studio Backdrop">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>

          {/* Launch Standalone Window Button */}
          <button
            type="button"
            onClick={openMobilePopup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r/srgb from-[#E05A47] to-[#F59E0B] text-white font-bold hover:brightness-110 shadow-xs transition-all cursor-pointer"
            title="Open in separate mobile-sized desktop window"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Open as App Window</span>
          </button>
        </div>
      </header>

      {/* Main Simulator Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative">
        {/* Phone Chassis Frame */}
        <div
          className="transition-transform duration-300 ease-out origin-top flex items-center justify-center my-auto"
          style={{ transform: scale === "1" ? undefined : `scale(${parseFloat(scale)})` }}
        >
          <div
            className="relative select-none p-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[linear-gradient(135deg,#2B2A2E_0%,#19181B_45%,#252428_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_0_0_4px_#0C0B0D,0_24px_64px_-12px_rgba(0,0,0,0.65),0_12px_28px_-8px_rgba(0,0,0,0.45)]"
            style={{ borderRadius: dev.chassisRadius }}
          >
            {/* Hardware buttons */}
            <div className="absolute -left-1.5 top-[115px] w-1 h-7 bg-[#3A393E] rounded-l-[2px]" />
            <div className="absolute -left-1.5 top-[160px] w-1 h-[52px] bg-[#3A393E] rounded-l-[2px]" />
            <div className="absolute -left-1.5 top-[225px] w-1 h-[52px] bg-[#3A393E] rounded-l-[2px]" />
            <div className="absolute -right-1.5 top-[175px] w-1 h-[76px] bg-[#3A393E] rounded-r-[2px]" />

            {/* Phone Screen */}
            <div
              className="overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.8)_inset] relative flex flex-col bg-[#1C120C]"
              style={{ width: `${w}px`, height: `${h}px`, borderRadius: dev.radius }}
            >
              {/* iOS Status Bar & Safe Area */}
              <div className="h-11 w-full px-7 flex items-center justify-between text-white text-[12px] font-semibold tracking-tight shrink-0 bg-[#1C120C] select-none z-40 relative">
                <span className="font-bold text-white">{clock}</span>

                {/* Dynamic Island */}
                <div
                  className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[120px] h-8 bg-black rounded-[20px] z-50 pointer-events-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] items-center justify-between px-2.5"
                  style={{ display: isLandscape ? "none" : "flex" }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-neutral-800" />
                  <div className="w-2 h-2 rounded-full bg-[#0a1829] border border-blue-900/60" />
                </div>

                {/* Right Status Icons (Cellular, WiFi, Battery) */}
                <div className="flex items-center gap-1.5 text-white/90">
                  {/* Cellular Signal (4 bars) */}
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M2 17h3v4H2v-4zm5-4h3v8H7v-8zm5-5h3v13h-3V8zm5-5h3v18h-3V3z" />
                  </svg>
                  {/* 5G Badge */}
                  <span className="text-[10px] font-black tracking-tighter text-white/80">5G</span>
                  {/* Battery (100%) */}
                  <div className="flex items-center gap-0.5">
                    <div className="w-5 h-2.5 rounded-xs border border-white/80 p-0.5 flex items-center">
                      <div className="w-full h-full bg-white" />
                    </div>
                    <div className="w-0.5 h-1 bg-white/80" />
                  </div>
                </div>
              </div>

              {/* Embedded Website iFrame Container */}
              <div className="flex-1 w-full relative overflow-hidden">
                <iframe ref={iframeRef} src="/mobile" className="w-full h-full border-0 bg-[#2D1E18] block" title="PassPrivé Travel Mobile View" />
              </div>

              {/* Home Indicator Safe Area */}
              <div className="h-5 w-full shrink-0 bg-[#2D1E18] flex items-center justify-center relative z-40">
                <div className="w-32 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Jump & Actions Sub-bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400">
          <span className="font-semibold text-neutral-300">Quick Actions:</span>
          <button type="button" onClick={() => jumpTo("#navbar")} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
            Hero
          </button>
          <button
            type="button"
            onClick={() => jumpTo("#packages-section")}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            Packages
          </button>
          <button
            type="button"
            onClick={() => callInFrame("openBlogModal")}
            className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-400/30 hover:bg-orange-500/30 transition-colors font-bold cursor-pointer"
          >
            📰 Travel Journal
          </button>
          <button
            type="button"
            onClick={() => callInFrame("openWriterStudio")}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition-colors font-bold cursor-pointer"
          >
            ✍️ Writer Studio
          </button>
          <button
            type="button"
            onClick={() => callInFrame("openAuthModal", "guest")}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            Guest Tracker
          </button>
          <button type="button" onClick={() => jumpTo("#faq-section")} className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
            FAQ
          </button>
        </div>
      </main>

      <footer className="w-full py-3 text-center text-[11px] text-neutral-500 border-t border-white/5">
        PassPrivé Travel • Mobile Viewport Simulator • Pixel-accurate iPhone 14/15/16 Pro container
      </footer>
    </>
  );
}
