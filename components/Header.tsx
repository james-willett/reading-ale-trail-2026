"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [daysRemaining, setDaysRemaining] = useState<string>("--");

  useEffect(() => {
    function updateCountdown() {
      const deadline = new Date("2026-05-17T23:59:59");
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setDaysRemaining("Trail has ended!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(`${days} days remaining`);
    }

    updateCountdown();
    // Update countdown every hour
    const interval = setInterval(updateCountdown, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header relative overflow-hidden border-b-2 border-amber px-4 py-6 text-center">
      {/* Ambient glow overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,160,52,0.3)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        {/* Navigation */}
        <nav className="mb-3 flex items-center justify-end gap-4 text-[0.85rem]">
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 rounded-full border border-amber/20 bg-amber/[0.1] px-3 py-1 font-semibold text-amber-light transition-colors hover:bg-amber/[0.2]"
          >
            🗺️ Trip Planner
          </Link>
        </nav>

        {/* Title row */}
        <div className="mb-2 flex items-center justify-center gap-3">
          <span className="text-[2.5rem] leading-none">🍺</span>
          <h1 className="bg-gradient-to-br from-amber-light via-gold to-amber bg-clip-text text-[2rem] font-extrabold tracking-tight text-transparent">
            Reading Ale Trail 2026
          </h1>
          <span className="text-[2.5rem] leading-none">🍺</span>
        </div>

        <p className="mb-3 text-base text-secondary">
          Reading &amp; Mid-Berkshire CAMRA &mdash; Explore 24 great real ale
          pubs
        </p>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[0.85rem] sm:gap-6">
          <span className="badge-pubs">🍻 24 Pubs to Visit</span>
          <span className="badge-deadline">📅 Deadline: 17 May 2026</span>
          <span className="badge-countdown">⏳ {daysRemaining}</span>
          <span className="badge-camra">🏷️ CAMRA</span>
        </div>
      </div>
    </header>
  );
}
