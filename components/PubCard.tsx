"use client";

import { Pub } from "@/lib/pubs";

interface PubCardProps {
  pub: Pub;
  isActive: boolean;
  onClick: () => void;
}

export default function PubCard({ pub, isActive, onClick }: PubCardProps) {
  return (
    <div
      className={`pub-card ${isActive ? "active" : ""}`}
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

      {/* Map pin action */}
      <div className="flex-shrink-0 text-[1.3rem] opacity-40 transition-opacity group-hover:opacity-100">
        <span title="Show on map">📍</span>
      </div>
    </div>
  );
}
