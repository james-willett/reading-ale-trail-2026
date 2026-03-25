"use client";

import { useState } from "react";
import { Pub } from "@/lib/pubs";

interface PubCardProps {
  pub: Pub;
  isActive: boolean;
  isVisited: boolean;
  onClick: () => void;
  onToggleVisit: () => void;
}

export default function PubCard({
  pub,
  isActive,
  isVisited,
  onClick,
  onToggleVisit,
}: PubCardProps) {
  // Track whether we just stamped (for triggering animation)
  const [justStamped, setJustStamped] = useState(false);

  function handleStamp(e: React.MouseEvent) {
    e.stopPropagation(); // Don't trigger card click
    if (!isVisited) {
      setJustStamped(true);
      // Reset animation flag after it plays
      setTimeout(() => setJustStamped(false), 800);
    }
    onToggleVisit();
  }

  return (
    <div
      className={`pub-card ${isActive ? "active" : ""} ${isVisited ? "visited" : ""}`}
      onClick={onClick}
    >
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
        <p className="text-[0.78rem] leading-snug text-muted">{pub.address}</p>

        {pub.isBookletSeller && (
          <span className="mt-1.5 inline-block rounded-full border border-amber/20 bg-amber/[0.15] px-2 py-0.5 text-[0.72rem] font-semibold text-amber-light">
            📖 Sells Booklets
          </span>
        )}
      </div>

      {/* Visit stamp button */}
      <div className="flex flex-shrink-0 flex-col items-center gap-1">
        <button
          onClick={handleStamp}
          className={`stamp-button ${isVisited ? "stamped" : ""} ${justStamped ? "stamp-animate" : ""}`}
          title={isVisited ? "Unmark visit" : "Mark as visited!"}
        >
          {isVisited ? "✅" : "🍺"}
        </button>
        <span className="text-[0.65rem] font-semibold text-muted">
          {isVisited ? "Visited!" : "Tap me!"}
        </span>
      </div>
    </div>
  );
}
