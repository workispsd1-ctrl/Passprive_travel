"use client";

import { useEffect, useState, type FormEvent } from "react";

import { BOOKING_STAGES, BOOKINGS_API, type Booking, type BookingsListResponse } from "@/lib/bookings";

import { BookingFormModal, SupplierStatusModal, type BookingFormValues } from "./admin-modals";

// ==========================================
// 1. ADMIN AUTHENTICATION GATE
// ==========================================
// NOTE: client-side gate carried over unchanged from admin.html; the credentials ship to the browser.
const ADMIN_CREDENTIALS = {
  username: "admin@passprive.travel",
  password: "PassPrive@2026#Admin",
};
const AUTH_KEY = "passprive_admin_auth";
const BACKUP_KEY = "passprive_bookings_backup";

type StageFilter = "ALL" | "NEW_LEAD" | "SUPPLIER_PENDING" | "TOKEN_LOCKED" | "VOUCHER_ISSUED";
type View = "bookings" | "team" | "synergy";

const formatINR = (amount: unknown) => "₹" + Number(amount || 0).toLocaleString("en-IN");

const putBooking = (body: Record<string, unknown>) =>
  fetch(BOOKINGS_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function AdminConsole() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session flag only exists in the browser
    setIsAuth(sessionStorage.getItem(AUTH_KEY) === "true");
  }, []);

  return isAuth ? (
    <Dashboard
      onLogout={() => {
        sessionStorage.removeItem(AUTH_KEY);
        setIsAuth(false);
      }}
    />
  ) : (
    <LoginGate
      onLogin={() => {
        sessionStorage.setItem(AUTH_KEY, "true");
        setIsAuth(true);
      }}
    />
  );
}

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState(false);

  const handleAdminLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const user = String(f.get("adminId") ?? "").trim();
    const pass = String(f.get("password") ?? "");
    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  const input =
    "w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white placeholder:text-neutral-600 focus:border-[#E05A47] focus:outline-hidden transition-colors";

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-[#000000]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] shadow-2xl space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#E05A47] to-[#EA580C] flex items-center justify-center font-black text-white text-lg mx-auto shadow-lg shadow-orange-500/20">
            PP
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">PassPrivé Operations Control</h2>
          <p className="text-xs text-neutral-400 font-medium">Administrator Login — Live Bookings &amp; Supplier Management</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 font-sans">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Admin ID / Email</label>
            <input type="text" name="adminId" required placeholder="admin@passprive.travel" className={input} />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Password</label>
            <input type="password" name="password" required placeholder="••••••••••••" className={input} />
          </div>

          {error && (
            <div className="text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-center">
              Invalid Admin ID or Password. Please try again.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-[#E05A47] to-[#EA580C] hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Log In to Operations Control</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#1A1A1A]">
          <p className="text-[10px] text-neutral-500 font-mono">Private administrative interface · Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}

// Stage filter pills. `initial` is the markup the page loads with; after the first click
// every inactive pill switches to the shared neutral style (as in the original script).
const FILTERS: { stage: StageFilter; label: string; initial: string }[] = [
  { stage: "ALL", label: "ALL", initial: "font-semibold bg-white text-black" },
  { stage: "NEW_LEAD", label: "NEW LEADS", initial: "font-medium text-neutral-400 hover:text-white bg-[#141414] border border-[#222222]" },
  {
    stage: "SUPPLIER_PENDING",
    label: "NOT BOOKED YET",
    initial: "font-medium text-rose-400 hover:text-white bg-[#141414] border border-rose-500/20",
  },
  { stage: "TOKEN_LOCKED", label: "TOKEN_LOCKED", initial: "font-medium text-neutral-400 hover:text-white bg-[#141414] border border-[#222222]" },
  {
    stage: "VOUCHER_ISSUED",
    label: "CONFIRMED / VOUCHER",
    initial: "font-medium text-neutral-400 hover:text-white bg-[#141414] border border-[#222222]",
  },
];
const FILTER_ACTIVE = "font-semibold bg-white text-black";
const FILTER_IDLE = "font-medium text-neutral-400 hover:text-white bg-[#141414] border border-[#222222]";

const TAB_ACTIVE = "px-3.5 py-1 rounded-lg text-xs font-semibold text-white bg-[#222222] transition-colors cursor-pointer";
const TAB_IDLE = "px-3.5 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  /** KPIs and the grid show their static placeholders until the first load completes. */
  const [loaded, setLoaded] = useState(false);
  const [stageFilter, setStageFilter] = useState<StageFilter>("ALL");
  const [filterTouched, setFilterTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("bookings");
  const [formModal, setFormModal] = useState<{ booking: Booking | null; defaultTravelDate: string } | null>(null);
  const [supplierRefId, setSupplierRefId] = useState<string | null>(null);

  const loadBookingsFromServer = async () => {
    try {
      const res = await fetch(`${BOOKINGS_API}?t=${Date.now()}`);
      if (res.ok) {
        const data = (await res.json()) as BookingsListResponse;
        if (data && data.success && Array.isArray(data.bookings)) {
          localStorage.setItem(BACKUP_KEY, JSON.stringify(data.bookings));
          setBookings(data.bookings);
          setLoaded(true);
          return;
        }
      }
    } catch (err) {
      console.warn("/api/bookings fetch offline, falling back to local storage:", err);
    }

    // Local fallback
    let local: Booking[] = [];
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(BACKUP_KEY) || "[]");
      local = Array.isArray(parsed) ? (parsed as Booking[]) : [];
    } catch {
      local = [];
    }
    setBookings(local);
    setLoaded(true);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void loadBookingsFromServer();
  }, []);

  const updateBooking = (refId: string, patch: Partial<Booking>) =>
    setBookings((prev) => prev.map((b) => (b.refId === refId ? { ...b, ...patch } : b)));

  // ── KPIs ──
  const total = bookings.length;
  const advances = bookings.reduce((sum, b) => sum + (Number(b.tokenPaid) || 0), 0);
  const gross = bookings.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  const balances = bookings.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  const notBooked = bookings.filter((b) => !b.isBookedWithSupplier).length;
  const counts: Record<StageFilter, number> = {
    ALL: total,
    NEW_LEAD: bookings.filter((b) => b.stage === "NEW_LEAD").length,
    SUPPLIER_PENDING: notBooked,
    TOKEN_LOCKED: bookings.filter((b) => b.stage === "TOKEN_LOCKED").length,
    VOUCHER_ISSUED: bookings.filter((b) => b.stage === "VOUCHER_ISSUED").length,
  };

  // ── Filtered grid ──
  const q = search.toLowerCase().trim();
  const filtered = bookings.filter((b) => {
    let matchesStage = true;
    if (stageFilter === "SUPPLIER_PENDING") matchesStage = !b.isBookedWithSupplier;
    else if (stageFilter !== "ALL") matchesStage = b.stage === stageFilter;

    const matchesSearch =
      !q ||
      (b.refId && b.refId.toLowerCase().includes(q)) ||
      (b.guest && b.guest.toLowerCase().includes(q)) ||
      (b.phone && b.phone.toLowerCase().includes(q)) ||
      (b.pkg && b.pkg.toLowerCase().includes(q)) ||
      (b.destination && b.destination.toLowerCase().includes(q));

    return matchesStage && matchesSearch;
  });

  // ── Actions ──
  const updateBookingStage = async (refId: string, newStage: string) => {
    updateBooking(refId, { stage: newStage });
    try {
      await putBooking({ refId, stage: newStage });
    } catch (e) {
      console.warn("/api/bookings update offline:", e);
    }
  };

  const saveSupplierStatus = async (isBooked: boolean, notes: string) => {
    const refId = supplierRefId;
    if (!refId) return;
    updateBooking(refId, { isBookedWithSupplier: isBooked, supplierNotes: notes, supplierBookingRef: notes });
    setSupplierRefId(null);
    try {
      await putBooking({ refId, isBookedWithSupplier: isBooked, supplierNotes: notes, supplierBookingRef: notes });
    } catch (e) {
      console.warn("/api/bookings update offline:", e);
    }
  };

  const handleSaveBooking = async (v: BookingFormValues) => {
    setFormModal(null);
    if (v.refId) {
      // Edit existing
      updateBooking(v.refId, {
        guest: v.guest,
        phone: v.phone,
        pkg: v.pkg,
        travelDate: v.travelDate,
        total: v.total,
        tokenPaid: v.tokenPaid,
        balance: Math.max(0, v.total - v.tokenPaid),
        stage: v.stage,
        isBookedWithSupplier: v.isBooked,
        supplierNotes: v.notes,
      });
      try {
        await putBooking({
          refId: v.refId,
          guest: v.guest,
          phone: v.phone,
          pkg: v.pkg,
          travelDate: v.travelDate,
          total: v.total,
          tokenPaid: v.tokenPaid,
          stage: v.stage,
          isBookedWithSupplier: v.isBooked,
          supplierNotes: v.notes,
        });
      } catch {}
    } else {
      // Create new
      const newRecord: Booking = {
        refId: "PPTRV-" + Date.now().toString().slice(-8),
        createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
        guest: v.guest,
        phone: v.phone,
        pkg: v.pkg,
        destination: "Mauritius",
        travelDate: v.travelDate,
        duration: "5 Nights · 6 Days",
        total: v.total,
        tokenPaid: v.tokenPaid,
        balance: Math.max(0, v.total - v.tokenPaid),
        stage: v.stage,
        isBookedWithSupplier: v.isBooked,
        supplierNotes: v.notes,
        source: "Manual Desk Entry",
      };
      setBookings((prev) => [newRecord, ...prev]);
      try {
        await fetch(BOOKINGS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRecord) });
      } catch {}
    }
  };

  const deleteBooking = async (refId: string) => {
    if (!confirm(`Are you sure you want to delete booking ${refId}?`)) return;
    setBookings((prev) => prev.filter((b) => b.refId !== refId));
    try {
      await fetch(`${BOOKINGS_API}?refId=${encodeURIComponent(refId)}`, { method: "DELETE" });
    } catch {}
  };

  const exportToCSV = () => {
    const headers = ["Ref ID", "Guest", "Phone", "Package", "Travel Date", "Total", "Token Paid", "Balance", "Supplier Booked", "Stage", "Notes"];
    const rows = bookings.map((b) => [
      `"${b.refId}"`,
      `"${b.guest}"`,
      `"${b.phone}"`,
      `"${b.pkg}"`,
      `"${b.travelDate}"`,
      b.total,
      b.tokenPaid,
      b.balance,
      b.isBookedWithSupplier ? "YES" : "NO",
      `"${b.stage}"`,
      `"${b.supplierNotes || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `PassPrive_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openNewBookingModal = () => setFormModal({ booking: null, defaultTravelDate: new Date().toISOString().split("T")[0] });
  const supplierBooking = supplierRefId ? bookings.find((b) => b.refId === supplierRefId) : undefined;

  const kpiCard = "p-4 rounded-xl bg-[#0A0A0A] border border-[#222222] hover:border-[#333333] transition-colors";
  const kpiLabel = "text-[11px] font-mono text-neutral-400 uppercase tracking-wider block";

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* TOP HEADER */}
      <header className="border-b border-[#222222] bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Left Logo */}
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-[#E05A47] to-[#EA580C] flex items-center justify-center font-black text-white text-xs shadow-md">
                PP
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-[#FBBF24] transition-colors">PassPrivé</span>
            </a>
            <span className="text-neutral-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-300">Operations Control</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#222222]">
            <button type="button" onClick={() => setView("bookings")} className={view === "bookings" ? TAB_ACTIVE : TAB_IDLE}>
              Bookings DataGrid
            </button>
            <button type="button" onClick={() => setView("team")} className={view === "team" ? TAB_ACTIVE : TAB_IDLE}>
              Team &amp; Roles
            </button>
            <button
              type="button"
              onClick={() => setView("synergy")}
              className={`${view === "synergy" ? TAB_ACTIVE : TAB_IDLE} flex items-center gap-1.5`}
            >
              <span>AI / Human Synergy</span>
              <span className="text-[9px] font-mono bg-orange-500/20 text-orange-400 px-1 rounded-sm">80/20</span>
            </button>
          </nav>

          {/* Right User & Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#262626] text-xs font-medium text-neutral-300 transition-colors"
            >
              <span>View Website</span>
              <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Log Out"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI METRIC CARDS (computed live from real bookings) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className={kpiCard}>
            <span className={kpiLabel}>Total Bookings</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{total}</span>
              <span className="text-[11px] text-emerald-400 font-semibold font-mono">Active</span>
            </div>
          </div>

          <div className={kpiCard}>
            <span className={kpiLabel}>Token Advances Collected</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{formatINR(advances)}</span>
              <span className="text-[11px] text-neutral-500 font-mono">{loaded ? `${total} bookings` : "0 tokens"}</span>
            </div>
          </div>

          <div className={kpiCard}>
            <span className={kpiLabel}>Gross Contract Value</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{formatINR(gross)}</span>
              <span className="text-[11px] text-neutral-500 font-mono">Live packages</span>
            </div>
          </div>

          <div className={kpiCard}>
            <span className={kpiLabel}>Outstanding Balances</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{formatINR(balances)}</span>
              <span className="text-[11px] text-amber-500/80 font-mono">To Collect</span>
            </div>
          </div>

          <div className={`col-span-2 lg:col-span-1 ${kpiCard}`}>
            <span className={kpiLabel}>Supplier Booking Pending</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-400">{notBooked}</span>
              <span className="text-[11px] text-rose-500 font-mono">Need Hotel Hold</span>
            </div>
          </div>
        </div>

        {/* VIEW 1: BOOKINGS DATAGRID */}
        {view === "bookings" && (
          <div className="space-y-4">
            {/* CONTROL BAR */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[#0A0A0A] p-3.5 rounded-2xl border border-[#222222]">
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Search Box */}
                <div className="relative min-w-[280px]">
                  <svg className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Guest, Phone, Trip, Ref..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white placeholder:text-neutral-500 focus:border-[#E05A47] focus:outline-hidden"
                  />
                </div>

                {/* Stage Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.stage}
                      type="button"
                      onClick={() => {
                        setStageFilter(f.stage);
                        setFilterTouched(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        f.stage === stageFilter ? FILTER_ACTIVE : filterTouched ? FILTER_IDLE : f.initial
                      }`}
                    >
                      {f.label} ({loaded ? counts[f.stage] : 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => void loadBookingsFromServer()}
                  className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Refresh bookings from server"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={exportToCSV}
                  className="px-3.5 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-xs font-mono font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={openNewBookingModal}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E05A47] hover:bg-[#C94836] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Add Manual Booking</span>
                </button>
              </div>
            </div>

            {/* DATAGRID TABLE */}
            <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto max-h-[660px]">
                <table className="w-full text-left text-xs border-collapse [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-[#0A0A0A]">
                  <thead>
                    <tr className="border-b border-[#222222] text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3.5 w-32">Reference ID</th>
                      <th className="py-3 px-3.5 min-w-[190px]">Guest &amp; WhatsApp</th>
                      <th className="py-3 px-3.5 min-w-[210px]">Trip &amp; Travel Date</th>
                      <th className="py-3 px-3.5 w-36 text-right">Price &amp; Balance</th>
                      <th className="py-3 px-3.5 w-44 text-center">
                        Supplier Booking Status
                        <br />
                        <span className="text-[9px] text-neutral-500 font-normal lowercase">(मैंने होटल/RateHawk बुक किया या नहीं)</span>
                      </th>
                      <th className="py-3 px-3.5 w-44 text-center">
                        Lifecycle Stage
                        <br />
                        <span className="text-[9px] text-neutral-500 font-normal lowercase">(मैनुअल स्टेज बदलें)</span>
                      </th>
                      <th className="py-3 px-3.5 min-w-[170px]">Internal Notes / PNR</th>
                      <th className="py-3 px-3.5 w-24 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-sans">
                    {loaded && filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            </div>
                            <div className="text-sm font-semibold text-neutral-300">No Bookings Found</div>
                            <p className="text-xs text-neutral-500 font-mono max-w-sm">
                              Customer inquiries made via the website WhatsApp buttons will automatically appear here in real time.
                            </p>
                            <button
                              type="button"
                              onClick={openNewBookingModal}
                              className="px-4 py-2 rounded-xl bg-[#E05A47] hover:bg-[#C94836] text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                            >
                              + Add Manual Booking
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {filtered.map((b) => (
                      <BookingRow
                        key={b.refId}
                        booking={b}
                        onStageChange={(stage) => void updateBookingStage(b.refId, stage)}
                        onSupplier={() => setSupplierRefId(b.refId)}
                        onEdit={() => setFormModal({ booking: b, defaultTravelDate: "" })}
                        onDelete={() => void deleteBooking(b.refId)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="py-3 px-4 bg-[#0F0F0F] border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-400">
                <div>{loaded ? `Showing ${filtered.length} of ${bookings.length} bookings` : "Showing 0 bookings"}</div>
                <div className="text-[10px] text-neutral-500">Auto-synced with server database &amp; WhatsApp clicks</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TEAM & ROLES */}
        {view === "team" && (
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#222222] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Operations Personnel &amp; Roles</h3>
                  <p className="text-xs text-neutral-400">Manage administrator privileges and operations roles.</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Primary Admin Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Master Operations Desk</span>
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">admin@passprive.travel</p>
                  <div className="pt-2 border-t border-[#222222] text-[11px] text-amber-300 font-semibold">Role: Super Admin (Full Control)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: AI / HUMAN SYNERGY */}
        {view === "synergy" && (
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#222222] space-y-4">
              <h3 className="text-base font-bold text-white">80% AI Automation • 20% Human Concierge Synergy</h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
                PassPrivé Travel operates on a high-leverage hybrid model: the frontend automatically captures custom travel requirements and routes
                them directly to your WhatsApp desk. You retain 100% manual discretion to review rates, negotiate, adjust supplier bookings in
                RateHawk, and issue vouchers.
              </p>
            </div>
          </div>
        )}
      </main>

      {formModal && (
        <BookingFormModal
          booking={formModal.booking}
          defaultTravelDate={formModal.defaultTravelDate}
          onClose={() => setFormModal(null)}
          onSave={(v) => void handleSaveBooking(v)}
        />
      )}
      {supplierBooking && (
        <SupplierStatusModal booking={supplierBooking} onClose={() => setSupplierRefId(null)} onSave={(isBooked, notes) => void saveSupplierStatus(isBooked, notes)} />
      )}
    </div>
  );
}

function BookingRow({
  booking: b,
  onStageChange,
  onSupplier,
  onEdit,
  onDelete,
}: {
  booking: Booking;
  onStageChange: (stage: string) => void;
  onSupplier: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isBooked = !!b.isBookedWithSupplier;
  const notes = b.supplierNotes || b.supplierBookingRef;

  return (
    <tr className="hover:bg-[#121212] transition-colors border-b border-[#1A1A1A] not-first:border-t not-first:border-b-0">
      {/* Ref ID */}
      <td className="py-3 px-3.5 font-mono text-xs text-white">
        <span className="font-bold text-neutral-200">{b.refId}</span>
        <div className="text-[10px] text-neutral-500 mt-0.5">{b.createdAt ? b.createdAt.substring(0, 10) : ""}</div>
      </td>

      {/* Guest & Phone */}
      <td className="py-3 px-3.5">
        <div className="font-bold text-white text-xs">{b.guest}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-mono text-[11px] text-emerald-400">{b.phone}</span>
          <a
            href={`https://wa.me/${(b.phone || "").replace(/[^0-9]/g, "")}`}
            target="_blank"
            className="text-neutral-500 hover:text-emerald-400 transition-colors"
            title="Chat on WhatsApp"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </a>
        </div>
      </td>

      {/* Trip & Travel Date */}
      <td className="py-3 px-3.5">
        <div className="text-xs font-semibold text-neutral-200">{b.pkg}</div>
        <div className="text-[11px] font-mono text-amber-300 mt-0.5">
          📅 {b.travelDate || "Flexible"} ({b.duration || "5 Nights"})
        </div>
      </td>

      {/* Price & Balance */}
      <td className="py-3 px-3.5 text-right font-mono">
        <div className="text-xs font-bold text-white">{formatINR(b.total)}</div>
        <div className={`text-[10px] ${b.balance === 0 ? "text-emerald-400" : "text-amber-400"}`}>
          {b.balance === 0 ? "PAID IN FULL" : "Due: " + formatINR(b.balance)}
        </div>
      </td>

      {/* Supplier Booking Status (मैंने बुक किया या नहीं) */}
      <td className="py-3 px-3.5 text-center">
        <button
          type="button"
          onClick={onSupplier}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto ${
            isBooked
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
          }`}
          title={isBooked ? "Click to view or edit supplier reference" : "Click to mark as booked in RateHawk / Hotel"}
        >
          <span>{isBooked ? "🟢" : "🔴"}</span>
          <span>{isBooked ? "Booked (Done)" : "Not Booked Yet"}</span>
        </button>
      </td>

      {/* Manual Lifecycle Stage Dropdown */}
      <td className="py-3 px-3.5 text-center">
        <select
          value={b.stage}
          onChange={(e) => onStageChange(e.target.value)}
          className="text-[11px] font-mono px-2 py-1 rounded-lg border border-[#2E2E2E] focus:outline-hidden focus:border-[#E05A47] cursor-pointer"
        >
          {BOOKING_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>

      {/* Internal Notes / PNR */}
      <td className="py-3 px-3.5 font-mono text-xs">
        <div className="text-neutral-300 truncate max-w-[200px]" title={notes || "None"}>
          {notes || <span className="text-neutral-600">None</span>}
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="p-1 rounded-sm bg-[#161616] hover:bg-[#222] text-neutral-400 hover:text-white border border-[#2A2A2A] transition-colors cursor-pointer"
            title="Edit Booking"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-sm bg-[#161616] hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-[#2A2A2A] transition-colors cursor-pointer"
            title="Delete Booking"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
