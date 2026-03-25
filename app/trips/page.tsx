"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { trips, Trip, getTripPubs, totalRouteDistance } from "@/lib/trips";
import { Visit } from "@/lib/types";
import TripCard from "@/components/TripCard";

// Leaflet needs client-side only — no SSR
const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

export default function TripsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Fetch group visits on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/visits");
        const data = await res.json();
        setVisits(data.visits);
      } catch (err) {
        console.error("Failed to load visits:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const visitedPubIds = useMemo(() => {
    return new Set(visits.map((v) => v.pubId));
  }, [visits]);

  // Split bus trips from regular trips
  const regularTrips = trips.filter((t) => !t.isBusTrip);
  const busTrips = trips.filter((t) => t.isBusTrip);

  // Currently selected trip for the detail panel
  const selectedTrip = selectedTripId
    ? trips.find((t) => t.id === selectedTripId) ?? null
    : null;

  function handleTripClick(trip: Trip) {
    // Toggle: click again to close
    setSelectedTripId((prev) => (prev === trip.id ? null : trip.id));
  }

  // Data for the detail panel
  const selectedPubs = selectedTrip ? getTripPubs(selectedTrip) : [];
  const selectedDistance = selectedTrip
    ? totalRouteDistance(selectedPubs)
    : 0;

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

          <div className="flex items-center gap-3">
            <span className="text-[2.5rem] leading-none">🗺️</span>
            <div>
              <h1 className="bg-gradient-to-br from-amber-light via-gold to-amber bg-clip-text text-[1.8rem] font-extrabold tracking-tight text-transparent">
                Trip Planner
              </h1>
              <p className="mt-0.5 text-[0.9rem] text-secondary">
                Suggested pub clusters for group outings
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-4 pb-8">
        {loading && (
          <p className="py-8 text-center text-secondary">Loading trips…</p>
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
            {busTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                visitedPubIds={visitedPubIds}
                isSelected={selectedTripId === trip.id}
                onClick={() => handleTripClick(trip)}
              />
            ))}
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
            {regularTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                visitedPubIds={visitedPubIds}
                isSelected={selectedTripId === trip.id}
                onClick={() => handleTripClick(trip)}
              />
            ))}
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

            {/* Ordered pub list */}
            <div className="mt-5">
              <h3 className="mb-3 text-[0.9rem] font-bold text-amber-light">
                Suggested visit order
              </h3>
              <div className="space-y-2">
                {selectedPubs.map((pub, idx) => {
                  const visited = visitedPubIds.has(pub.id);
                  return (
                    <div
                      key={pub.id}
                      className={`trip-pub-row ${visited ? "visited" : ""}`}
                    >
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
