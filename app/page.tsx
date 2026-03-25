"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import PubCard from "@/components/PubCard";
import PersonSelector from "@/components/PersonSelector";
import ProgressBar from "@/components/ProgressBar";
import Leaderboard from "@/components/Leaderboard";
import { pubs, Pub } from "@/lib/pubs";
import { Member, Visit } from "@/lib/types";

// Leaflet must be client-side only — no SSR
const AleTrailMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);

  // Members + visits state
  const [members, setMembers] = useState<Member[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>("james");
  const [loading, setLoading] = useState(true);

  // Fetch members and visits on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [membersRes, visitsRes] = await Promise.all([
          fetch("/api/members"),
          fetch("/api/visits"),
        ]);
        const membersData = await membersRes.json();
        const visitsData = await visitsRes.json();
        setMembers(membersData.members);
        setVisits(visitsData.visits);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Current person's visited pub IDs (as a Set for fast lookup)
  const visitedPubIds = useMemo(() => {
    const ids = visits
      .filter((v) => v.personId === selectedPersonId)
      .map((v) => v.pubId);
    return new Set(ids);
  }, [visits, selectedPersonId]);

  // Current person's visit count
  const visitedCount = visitedPubIds.size;

  // Selected member info
  const selectedMember = members.find((m) => m.id === selectedPersonId);

  // Toggle a pub visit
  const toggleVisit = useCallback(
    async (pubId: number) => {
      const isCurrentlyVisited = visits.some(
        (v) => v.personId === selectedPersonId && v.pubId === pubId
      );

      // Optimistic update
      if (isCurrentlyVisited) {
        setVisits((prev) =>
          prev.filter(
            (v) => !(v.personId === selectedPersonId && v.pubId === pubId)
          )
        );
      } else {
        setVisits((prev) => [
          ...prev,
          {
            personId: selectedPersonId,
            pubId,
            date: new Date().toISOString(),
          },
        ]);
      }

      // Persist to API
      try {
        const res = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personId: selectedPersonId,
            pubId,
            visited: !isCurrentlyVisited,
          }),
        });
        const data = await res.json();
        setVisits(data.visits);
      } catch (err) {
        console.error("Failed to toggle visit:", err);
      }
    },
    [selectedPersonId, visits]
  );

  // Add a guest member
  const addGuest = useCallback(async (name: string) => {
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members);
    } catch (err) {
      console.error("Failed to add guest:", err);
    }
  }, []);

  // Remove a guest member
  const removeGuest = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
        if (!res.ok) return;
        const data = await res.json();
        setMembers(data.members);
        // Clean up visits locally too
        setVisits((prev) => prev.filter((v) => v.personId !== id));
        // If we just removed the selected person, switch to James
        if (selectedPersonId === id) {
          setSelectedPersonId("james");
        }
      } catch (err) {
        console.error("Failed to remove guest:", err);
      }
    },
    [selectedPersonId]
  );

  function handlePubClick(pub: Pub) {
    setSelectedPub(pub);
  }

  return (
    <>
      <Header />

      {/* Person Selector + Progress — sticky on mobile for quick access */}
      <section className="mx-auto max-w-[1200px] px-4 pt-4 space-y-3">
        {!loading && (
          <>
            <PersonSelector
              members={members}
              selectedId={selectedPersonId}
              onSelect={setSelectedPersonId}
              onAddGuest={addGuest}
              onRemoveGuest={removeGuest}
            />

            {selectedMember && (
              <ProgressBar
                visitedCount={visitedCount}
                memberName={selectedMember.name}
                memberEmoji={selectedMember.emoji}
              />
            )}
          </>
        )}
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
            Tap the beer to stamp your visit!
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {pubs.map((pub) => (
            <PubCard
              key={pub.id}
              pub={pub}
              isActive={selectedPub?.id === pub.id}
              isVisited={visitedPubIds.has(pub.id)}
              onClick={() => handlePubClick(pub)}
              onToggleVisit={() => toggleVisit(pub.id)}
            />
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      {!loading && members.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 pb-8">
          <Leaderboard members={members} visits={visits} />
        </section>
      )}

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
    </>
  );
}
