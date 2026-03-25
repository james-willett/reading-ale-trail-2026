"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { trips as predefinedTrips, Trip, getTripPubs, totalRouteDistance } from "@/lib/trips";
import { pubs, Pub } from "@/lib/pubs";
import { Visit, TripStore, CustomTrip, TripOverride } from "@/lib/types";
import TripCard from "@/components/TripCard";
import CreateTripModal from "@/components/CreateTripModal";

// Leaflet needs client-side only — no SSR
const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

// Format an ISO date string for display, e.g. "Sat 12 Apr"
function formatPlannedDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Convert a CustomTrip to a Trip so we can render it uniformly
function customTripToTrip(ct: CustomTrip): Trip {
  return {
    id: ct.id,
    name: ct.name,
    description: ct.description,
    pubIds: ct.pubIds,
    isCustom: true,
    plannedDate: ct.plannedDate,
  };
}

// Resolve pub objects from IDs, filtering out any invalid IDs
function resolvePubs(pubIds: number[]): Pub[] {
  return pubIds.map((id) => pubs.find((p) => p.id === id)).filter(Boolean) as Pub[];
}

export default function TripsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [tripStore, setTripStore] = useState<TripStore>({
    customTrips: [],
    overrides: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch visits + trip store on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [visitsRes, tripsRes] = await Promise.all([
          fetch("/api/visits"),
          fetch("/api/trips"),
        ]);
        const visitsData = await visitsRes.json();
        const tripsData = await tripsRes.json();
        setVisits(visitsData.visits);
        setTripStore(tripsData);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const visitedPubIds = useMemo(() => {
    return new Set(visits.map((v) => v.pubId));
  }, [visits]);

  // ── Merge pre-defined trips with overrides ────────────────
  // Apply any saved overrides (pub order, date) to pre-defined trips
  const allTrips: Trip[] = useMemo(() => {
    const merged: Trip[] = predefinedTrips.map((trip) => {
      const override = tripStore.overrides[trip.id];
      if (!override) return trip;
      return {
        ...trip,
        pubIds: override.pubOrder ?? trip.pubIds,
        plannedDate: override.plannedDate ?? trip.plannedDate,
      };
    });

    // Add custom trips
    const customTrips = tripStore.customTrips.map(customTripToTrip);
    return [...merged, ...customTrips];
  }, [tripStore]);

  // Split by type
  const busTrips = allTrips.filter((t) => t.isBusTrip);
  const regularTrips = allTrips.filter((t) => !t.isBusTrip && !t.isCustom);
  const customTrips = allTrips.filter((t) => t.isCustom);

  // Sort each section: trips with dates first (sorted by date), then undated
  function sortByDate(a: Trip, b: Trip): number {
    if (a.plannedDate && b.plannedDate) return a.plannedDate.localeCompare(b.plannedDate);
    if (a.plannedDate) return -1;
    if (b.plannedDate) return 1;
    return 0;
  }
  const sortedRegular = [...regularTrips].sort(sortByDate);
  const sortedCustom = [...customTrips].sort(sortByDate);

  // Currently selected trip for the detail panel
  const selectedTrip = selectedTripId
    ? allTrips.find((t) => t.id === selectedTripId) ?? null
    : null;

  function handleTripClick(trip: Trip) {
    setSelectedTripId((prev) => (prev === trip.id ? null : trip.id));
  }

  // ── Get the effective pub list for a trip (respecting overrides) ──
  const getEffectivePubs = useCallback(
    (trip: Trip): Pub[] => {
      return resolvePubs(trip.pubIds);
    },
    []
  );

  // Data for the detail panel
  const selectedPubs = selectedTrip ? getEffectivePubs(selectedTrip) : [];
  const selectedDistance = selectedTrip ? totalRouteDistance(selectedPubs) : 0;

  // ── Create custom trip ────────────────────────────────────
  async function handleCreateTrip(tripData: {
    name: string;
    description: string;
    pubIds: number[];
    plannedDate?: string;
  }) {
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });
      const data = await res.json();
      setTripStore(data);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create trip:", err);
    }
  }

  // ── Delete custom trip ────────────────────────────────────
  async function handleDeleteTrip(tripId: string) {
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      const data = await res.json();
      setTripStore(data);
      if (selectedTripId === tripId) setSelectedTripId(null);
    } catch (err) {
      console.error("Failed to delete trip:", err);
    }
  }

  // ── Reorder pubs in the detail view ───────────────────────
  async function handleMovePub(tripId: string, fromIdx: number, toIdx: number) {
    const trip = allTrips.find((t) => t.id === tripId);
    if (!trip) return;

    const newPubIds = [...trip.pubIds];
    const [moved] = newPubIds.splice(fromIdx, 1);
    newPubIds.splice(toIdx, 0, moved);

    // Optimistic update
    if (trip.isCustom) {
      setTripStore((prev) => ({
        ...prev,
        customTrips: prev.customTrips.map((ct) =>
          ct.id === tripId ? { ...ct, pubIds: newPubIds } : ct
        ),
      }));
      // Persist
      await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubIds: newPubIds }),
      });
    } else {
      // Pre-defined trip — save as override
      setTripStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [tripId]: { ...prev.overrides[tripId], pubOrder: newPubIds },
        },
      }));
      await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubOrder: newPubIds }),
      });
    }
  }

  // ── Set planned date ──────────────────────────────────────
  async function handleSetDate(tripId: string, date: string) {
    const trip = allTrips.find((t) => t.id === tripId);
    if (!trip) return;

    if (trip.isCustom) {
      setTripStore((prev) => ({
        ...prev,
        customTrips: prev.customTrips.map((ct) =>
          ct.id === tripId ? { ...ct, plannedDate: date || undefined } : ct
        ),
      }));
    } else {
      setTripStore((prev) => ({
        ...prev,
        overrides: {
          ...prev.overrides,
          [tripId]: { ...prev.overrides[tripId], plannedDate: date || undefined },
        },
      }));
    }

    await fetch(`/api/trips/${tripId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plannedDate: date }),
    });
  }

  // Helper to get the planned date for a trip (from overrides or trip data)
  function getPlannedDate(trip: Trip): string | undefined {
    if (trip.isCustom) {
      const ct = tripStore.customTrips.find((c) => c.id === trip.id);
      return ct?.plannedDate;
    }
    return tripStore.overrides[trip.id]?.plannedDate ?? trip.plannedDate;
  }

  // Helper to get overridden pubs for a trip card
  function getOverriddenPubs(trip: Trip): Pub[] | undefined {
    if (trip.isCustom) return resolvePubs(trip.pubIds);
    const override = tripStore.overrides[trip.id];
    if (override?.pubOrder) return resolvePubs(override.pubOrder);
    return undefined;
  }

  // ── Render a section of trip cards ────────────────────────
  function renderTripCards(tripList: Trip[]) {
    return tripList.map((trip) => (
      <TripCard
        key={trip.id}
        trip={trip}
        visitedPubIds={visitedPubIds}
        isSelected={selectedTripId === trip.id}
        onClick={() => handleTripClick(trip)}
        plannedDate={getPlannedDate(trip)}
        onDelete={trip.isCustom ? () => handleDeleteTrip(trip.id) : undefined}
        overriddenPubs={getOverriddenPubs(trip)}
      />
    ));
  }

  return (
    <>
      {/* ── Page header ──────────────────────────────────── */}
      <header className="header relative overflow-hidden border-b-2 border-amber px-4 py-6">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,160,52,0.3)_0%,transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-[1200px]">
          {/* Navigation */}
          <nav className="mb-4 flex items-center gap-4 text-[0.85rem]">
            <Link
              href="/"
              className="text-secondary hover:text-amber transition-colors"
            >
              ← Back to Trail
            </Link>
          </nav>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[2.5rem] leading-none">🗺️</span>
              <div>
                <h1 className="bg-gradient-to-br from-amber-light via-gold to-amber bg-clip-text text-[1.8rem] font-extrabold tracking-tight text-transparent">
                  Trip Planner
                </h1>
                <p className="mt-0.5 text-[0.9rem] text-secondary">
                  Suggested pub clusters &amp; custom trips
                </p>
              </div>
            </div>

            {/* Create Trip button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="create-trip-btn"
            >
              + Create Trip
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-4 pb-8">
        {loading && (
          <p className="py-8 text-center text-secondary">Loading trips…</p>
        )}

        {/* ── Custom trips section (only if there are custom trips) ── */}
        {sortedCustom.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-[1.2rem] font-bold text-amber-light">
              📝 Your Custom Trips
            </h2>
            <p className="mb-4 text-[0.85rem] text-secondary">
              Trips you&apos;ve created — pick your own pubs and order.
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
              {renderTripCards(sortedCustom)}
            </div>
          </section>
        )}

        {/* ── Bus trips section ──────────────────────────── */}
        <section className="mt-6">
          <h2 className="mb-2 text-[1.2rem] font-bold text-amber-light">
            🚌 CAMRA Bus Trips
          </h2>
          <p className="mb-4 text-[0.85rem] text-secondary">
            Book a seat on the CAMRA coach — no driving needed! Guided tours
            taking you round the countryside pubs.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
            {renderTripCards(busTrips)}
          </div>
        </section>

        {/* ── Self-guided trips ──────────────────────────── */}
        <section className="mt-8">
          <h2 className="mb-2 text-[1.2rem] font-bold text-amber-light">
            🍺 Self-Guided Trips
          </h2>
          <p className="mb-4 text-[0.85rem] text-secondary">
            Plan your own adventure — we&apos;ve grouped the 24 pubs into
            sensible trips based on location.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
            {renderTripCards(sortedRegular)}
          </div>
        </section>

        {/* ── Trip detail panel (when a card is selected) ── */}
        {selectedTrip && (
          <section className="trip-detail-panel mt-6">
            {/* Detail header */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[1.3rem] font-bold text-primary">
                  {selectedTrip.isBusTrip && "🚌 "}
                  {selectedTrip.isCustom && "📝 "}
                  {selectedTrip.name}
                </h2>
                <p className="mt-1 text-[0.85rem] text-secondary">
                  {selectedTrip.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTripId(null)}
                className="text-xl text-muted transition-colors hover:text-primary"
                aria-label="Close detail panel"
              >
                ✕
              </button>
            </div>

            {/* Date picker */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="text-[0.82rem] font-semibold text-muted uppercase tracking-wider">
                Planned Date:
              </label>
              <input
                type="date"
                value={getPlannedDate(selectedTrip) ?? ""}
                onChange={(e) => handleSetDate(selectedTrip.id, e.target.value)}
                className="modal-input h-8 text-[0.82rem]"
              />
              {getPlannedDate(selectedTrip) && (
                <span className="trip-date-badge">
                  📅 {formatPlannedDate(getPlannedDate(selectedTrip)!)}
                </span>
              )}
            </div>

            {/* Bus schedule in detail view */}
            {selectedTrip.busInfo && (
              <div className="bus-info-box mb-4">
                <div className="flex items-center gap-2 text-[0.88rem]">
                  <span>📅</span>
                  <span className="font-bold text-primary">
                    {selectedTrip.busInfo.displayDate}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.82rem] text-secondary">
                  <span>📍 Pickup: {selectedTrip.busInfo.pickupStation}</span>
                  <span>🕐 Departs: {selectedTrip.busInfo.pickupTime}</span>
                  <span>🏠 Returns: {selectedTrip.busInfo.dropoffTime}</span>
                </div>
              </div>
            )}

            {/* Large route map */}
            <div className="overflow-hidden rounded-xl border border-amber/20">
              <TripMap
                pubs={selectedPubs}
                visitedPubIds={visitedPubIds}
                large={true}
              />
            </div>

            {/* Route stats */}
            <div className="mt-4 flex flex-wrap gap-4 text-[0.85rem]">
              <span className="trip-stat-lg">
                🍺 {selectedPubs.length} pub
                {selectedPubs.length !== 1 ? "s" : ""}
              </span>
              {selectedPubs.length > 1 && (
                <span className="trip-stat-lg">
                  📏 {selectedDistance.toFixed(1)} km total
                </span>
              )}
              <span className="trip-stat-lg">
                ✅{" "}
                {selectedPubs.filter((p) => visitedPubIds.has(p.id)).length}/
                {selectedPubs.length} visited
              </span>
            </div>

            {/* Ordered pub list with reorder controls */}
            <div className="mt-5">
              <h3 className="mb-3 text-[0.9rem] font-bold text-amber-light">
                Visit order
                <span className="ml-2 text-[0.75rem] font-normal text-muted">
                  (use arrows to reorder)
                </span>
              </h3>
              <div className="space-y-2">
                {selectedPubs.map((pub, idx) => {
                  const visited = visitedPubIds.has(pub.id);
                  return (
                    <div
                      key={pub.id}
                      className={`trip-pub-row ${visited ? "visited" : ""}`}
                    >
                      {/* Reorder arrows */}
                      <div className="reorder-arrows">
                        <button
                          onClick={() =>
                            handleMovePub(selectedTrip.id, idx, idx - 1)
                          }
                          disabled={idx === 0}
                          className="reorder-arrow-btn"
                          aria-label="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() =>
                            handleMovePub(selectedTrip.id, idx, idx + 1)
                          }
                          disabled={idx === selectedPubs.length - 1}
                          className="reorder-arrow-btn"
                          aria-label="Move down"
                        >
                          ▼
                        </button>
                      </div>

                      <span className="trip-pub-number">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-primary">
                          {pub.name}
                        </span>
                        <span className="ml-2 text-[0.78rem] text-muted">
                          {pub.area}
                        </span>
                        <p className="text-[0.75rem] text-muted truncate">
                          {pub.address}
                        </p>
                      </div>
                      {visited && (
                        <span className="text-[0.85rem] text-green-400">
                          ✅
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Create Trip Modal ──────────────────────────────── */}
      {showCreateModal && (
        <CreateTripModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTrip}
        />
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-amber/20 px-4 py-6 text-center text-[0.78rem] text-muted">
        <p>
          Reading Ale Trail 2026 &mdash; Organised by{" "}
          <a
            href="https://www.readingcamra.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber hover:underline"
          >
            Reading &amp; Mid-Berkshire CAMRA
          </a>
        </p>
        <p className="mt-1.5">
          Map data &copy;{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber hover:underline"
          >
            OpenStreetMap
          </a>{" "}
          contributors
        </p>
      </footer>
    </>
  );
}
