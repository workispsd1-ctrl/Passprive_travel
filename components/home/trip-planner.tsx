"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { findTrip, formatFriendlyDate, getDefaultDateStr, TRIPS, type Trip, type TripCategory } from "@/lib/trips";
import { waLink } from "@/lib/whatsapp";

interface TripPlanner {
  activeCrew: TripCategory;
  activeTrip: Trip;
  /** YYYY-MM-DD; null until the page has mounted (it depends on the current date). */
  selectedTravelDate: string | null;
  setSelectedTravelDate: (date: string) => void;
  /** Shared WhatsApp link for the floating and final CTA buttons; null until first sync. */
  syncedWaHref: string | null;
  modalOpen: boolean;
  /** Increments on every open so the modal rebuilds its checklist from defaults. */
  modalSession: number;
  selectCrew: (crew: TripCategory) => void;
  openModal: (tripId: string) => void;
  closeModal: () => void;
}

const TripPlannerContext = createContext<TripPlanner | null>(null);

export function useTripPlanner(): TripPlanner {
  const ctx = useContext(TripPlannerContext);
  if (!ctx) throw new Error("useTripPlanner must be used inside <TripPlannerProvider>");
  return ctx;
}

const syncWaHref = (trip: Trip, travelDate: string) =>
  waLink(
    `Hi! I want to plan the "${trip.title}" (${trip.forWho}) with PassPrivé Travel for around ${formatFriendlyDate(travelDate)}. Please share availability & customized rates.`,
  );

export function TripPlannerProvider({ children }: { children: ReactNode }) {
  const [activeCrew, setActiveCrew] = useState<TripCategory>("couple");
  const [activeTrip, setActiveTrip] = useState<Trip>(TRIPS[0]);
  const [selectedTravelDate, setSelectedTravelDate] = useState<string | null>(null);
  const [syncedWaHref, setSyncedWaHref] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSession, setModalSession] = useState(0);

  // Page init: default travel date (30 days out) and the initial WhatsApp sync.
  useEffect(() => {
    const date = getDefaultDateStr(30);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on the browser's current date
    setSelectedTravelDate(date);
    setSyncedWaHref(syncWaHref(TRIPS[0], date));
  }, []);

  // Lock page scroll while the modal is open; Escape closes it.
  useEffect(() => {
    if (!modalOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const selectCrew = (crew: TripCategory) => {
    setActiveCrew(crew);
    const trip = TRIPS.find((t) => t.category === crew) ?? activeTrip;
    setActiveTrip(trip);
    document.getElementById("trips")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSyncedWaHref(syncWaHref(trip, selectedTravelDate ?? getDefaultDateStr(30)));
  };

  const openModal = (tripId: string) => {
    const trip = findTrip(tripId);
    if (!trip) return;
    setActiveTrip(trip);
    setModalSession((n) => n + 1);
    setModalOpen(true);
  };

  const value: TripPlanner = {
    activeCrew,
    activeTrip,
    selectedTravelDate,
    setSelectedTravelDate,
    syncedWaHref,
    modalOpen,
    modalSession,
    selectCrew,
    openModal,
    closeModal: () => setModalOpen(false),
  };

  return <TripPlannerContext value={value}>{children}</TripPlannerContext>;
}
