"use client";

import { useState } from "react";
import { Pub } from "@/lib/pubs";
import { Visit } from "@/lib/types";

interface PubCardProps {
  pub: Pub;
  isActive: boolean;
  visit: Visit | undefined; // The group visit for this pub, if any
  animateStamp: boolean; // True when this pub was just checked in
  onClick: () => void; // Fly to on map
  onCheckIn: () => void; // Open the visit modal
  onUndo: () => void; // Remove the visit
}

export default function PubCard({
  pub,
  isActive,
  visit,
  animateStamp,
  onClick,
  onCheckIn,
  onUndo,
}: PubCardProps) {
  const isVisited = !!visit;
  const [expanded, setExpanded] = useState(false);

  function handleCheckIn(e: React.MouseEvent) {
    e.stopPropagation();
    if (isVisited) {
      // Toggle detail expansion
      setExpanded((prev) => !prev);
    } else {
      onCheckIn();
    }
  }

  function handleUndo(e: React.MouseEvent) {
    e.stopPropagation();
    onUndo();
  }

  // Format date nicely
  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div
      className={`pub-card-v2 ${isActive ? "active" : ""} ${isVisited ? "visited" : ""}`}
      onClick={onClick}
    >
      {/* Main row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Pub number + name */}
          <div className="mb-1 flex items-center gap-2.5">
            <span className="whitespace-nowrap rounded-[0.3rem] bg-amber/[0.12] px-[0.45rem] py-[0.15rem] text-[0.72rem] font-bold text-amber">
              #{pub.id}
            </span>
            <h3 className="truncate text-[1.05rem] font-bold text-primary">
              {pub.name}
            </h3>
          </div>

          <p className="mb-0.5 text-[0.82rem] font-semibold text-amber">
            {pub.area}
          </p>
          <p className="text-[0.78rem] leading-snug text-muted">
            {pub.address}
          </p>

          {pub.isBookletSeller && (
            <span className="mt-1.5 inline-block rounded-full border border-amber/20 bg-amber/[0.15] px-2 py-0.5 text-[0.72rem] font-semibold text-amber-light">
              📖 Sells Booklets
            </span>
          )}

          {/* Visited summary — date + attendee pills */}
          {isVisited && visit && (
            <div className="mt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[0.72rem] text-muted">
                  {formatDate(visit.date)}
                </span>
                <span className="text-[0.5rem] text-muted">·</span>
                {visit.attendees.map((a) => (
                  <span key={a.name} className="attendee-pill">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stamp / expand button */}
        <div className="flex flex-shrink-0 flex-col items-center gap-1">
          <button
            onClick={handleCheckIn}
            className={`stamp-button ${isVisited ? "stamped" : ""} ${animateStamp ? "stamp-animate" : ""}`}
            title={isVisited ? "Show details" : "Check in!"}
          >
            {isVisited ? "✅" : "🍺"}
          </button>
          <span className="text-[0.65rem] font-semibold text-muted">
            {isVisited ? (expanded ? "Hide" : "Details") : "Tap me!"}
          </span>
        </div>
      </div>

      {/* Expanded detail — what each person drank */}
      {isVisited && expanded && visit && (
        <div className="visit-detail" onClick={(e) => e.stopPropagation()}>
          <div className="mb-2 text-[0.72rem] font-semibold uppercase tracking-wider text-muted">
            What we drank
          </div>
          <div className="space-y-1">
            {visit.attendees.map((a) => (
              <div key={a.name} className="flex items-center gap-2">
                <span className="text-[0.8rem] font-semibold text-secondary">
                  {a.name}
                </span>
                {a.drink && (
                  <>
                    <span className="text-[0.5rem] text-muted">—</span>
                    <span className="text-[0.78rem] italic text-amber/80">
                      {a.drink}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Undo button */}
          <button onClick={handleUndo} className="undo-visit-btn">
            Remove visit
          </button>
        </div>
      )}
    </div>
  );
}
