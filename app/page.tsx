"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import PubCard from "@/components/PubCard";
import ProgressBar from "@/components/ProgressBar";
import VisitModal from "@/components/VisitModal";
import { pubs, Pub } from "@/lib/pubs";
import { Visit, Attendee } from "@/lib/types";

// Leaflet must be client-side only — no SSR
const AleTrailMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);

  // Group visits state
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state — which pub are we checking into?
  const [modalPub, setModalPub] = useState<Pub | null>(null);

  // Track which pub just got stamped (for bounce animation)
  const [stampedPubId, setStampedPubId] = useState<number | null>(null);

  // How It Works collapsible
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  // Fetch visits on mount
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

  // Set of visited pub IDs (for fast lookup — map markers, etc.)
  const visitedPubIds = useMemo(() => {
    return new Set(visits.map((v) => v.pubId));
  }, [visits]);

  // Quick lookup: pubId → Visit
  const visitMap = useMemo(() => {
    const map = new Map<number, Visit>();
    visits.forEach((v) => map.set(v.pubId, v));
    return map;
  }, [visits]);

  const visitedCount = visitedPubIds.size;

  // Submit a visit from the modal
  const submitVisit = useCallback(
    async (pubId: number, date: string, attendees: Attendee[]) => {
      // Optimistic update
      const newVisit: Visit = { pubId, date, attendees };
      setVisits((prev) => [...prev.filter((v) => v.pubId !== pubId), newVisit]);
      setModalPub(null);

      // Trigger the stamp bounce animation
      setStampedPubId(pubId);
      setTimeout(() => setStampedPubId(null), 800);

      // Persist
      try {
        const res = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pubId, date, attendees }),
        });
        const data = await res.json();
        setVisits(data.visits);
      } catch (err) {
        console.error("Failed to save visit:", err);
      }
    },
    []
  );

  // Undo / remove a visit
  const removeVisit = useCallback(async (pubId: number) => {
    // Optimistic update
    setVisits((prev) => prev.filter((v) => v.pubId !== pubId));

    try {
      const res = await fetch(`/api/visits/${pubId}`, { method: "DELETE" });
      const data = await res.json();
      setVisits(data.visits);
    } catch (err) {
      console.error("Failed to remove visit:", err);
    }
  }, []);

  function handlePubClick(pub: Pub) {
    setSelectedPub(pub);
  }

  return (
    <>
      <Header />

      {/* How It Works — collapsible info box */}
      <section className="mx-auto max-w-[1200px] px-4 pt-4">
        <div className="how-it-works">
          <button
            className="how-it-works-toggle"
            onClick={() => setHowItWorksOpen((prev) => !prev)}
            aria-expanded={howItWorksOpen}
          >
            <span className="flex items-center gap-2">
              <span className="how-it-works-icon">?</span>
              <span className="text-[0.95rem] font-bold text-amber-light">
                How It Works
              </span>
            </span>
            <span
              className={`how-it-works-chevron ${howItWorksOpen ? "open" : ""}`}
            >
              ▾
            </span>
          </button>

          <div
            ref={howItWorksRef}
            className="how-it-works-body"
            style={{
              maxHeight: howItWorksOpen
                ? howItWorksRef.current?.scrollHeight
                  ? `${howItWorksRef.current.scrollHeight}px`
                  : "500px"
                : "0px",
            }}
          >
            <ul className="how-it-works-list">
              <li>
                <strong>Log a visit</strong> — tap a pub card below and hit the
                🍺 button to check in your group.
              </li>
              <li>
                <strong>Record the details</strong> — add who was there and what
                everyone drank. Great for settling &ldquo;what was that
                beer?&rdquo; debates later.
              </li>
              <li>
                <strong>Plan your routes</strong> — head to the Trip Planner for
                suggested routes or create your own custom trips.
              </li>
              <li>
                <strong>Track your progress</strong> — the progress bar shows
                how your group is doing across all 24 pubs.
              </li>
              <li>
                <strong>Deadline: 17 May 2026</strong> — that&apos;s your
                cut-off to complete the trail. Plenty of time!
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Progress bar — one shared bar for the group */}
      <section className="mx-auto max-w-[1200px] px-4 pt-4">
        {!loading && <ProgressBar visitedCount={visitedCount} />}
      </section>

      {/* Map */}
      <div className="mt-4">
        <AleTrailMap
          pubs={pubs}
          selectedPub={selectedPub}
          visitedPubIds={visitedPubIds}
        />
      </div>

      {/* Pub list */}
      <section className="mx-auto max-w-[1200px] px-4 pb-6 pt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[1.4rem] font-bold text-amber-light">
            All 24 Pubs
          </h2>
          <p className="text-[0.85rem] text-muted">
            Tap a pub to check in your group!
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {pubs.map((pub) => (
            <PubCard
              key={pub.id}
              pub={pub}
              isActive={selectedPub?.id === pub.id}
              visit={visitMap.get(pub.id)}
              animateStamp={stampedPubId === pub.id}
              onClick={() => handlePubClick(pub)}
              onCheckIn={() => setModalPub(pub)}
              onUndo={() => removeVisit(pub.id)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
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

      {/* Visit check-in modal */}
      {modalPub && (
        <VisitModal
          pub={modalPub}
          onSubmit={submitVisit}
          onClose={() => setModalPub(null)}
        />
      )}
    </>
  );
}
