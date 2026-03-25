"use client";

import { pubs } from "@/lib/pubs";

interface ProgressBarProps {
  visitedCount: number;
}

// Fun tier messages based on progress
function getTierMessage(count: number): string {
  if (count === 0) return "Time to hit the trail! 🚶";
  if (count <= 4) return "Just getting warmed up! 🍺";
  if (count <= 8) return "Nice start, keep going! 🍻";
  if (count <= 12) return "Halfway heroes! 🏆";
  if (count <= 16) return "On a proper crawl now! 💪";
  if (count <= 20) return "The finish line is in sight! 🔥";
  if (count <= 23) return "SO close! One more push! 🚀";
  return "🎉 ALE TRAIL LEGENDS! 🎉";
}

// Progress bar colour: red (0-8), amber (9-16), green (17-24)
function getBarColor(count: number): string {
  if (count <= 8) return "bg-red-500";
  if (count <= 16) return "bg-amber";
  return "bg-green-500";
}

function getGlowColor(count: number): string {
  if (count <= 8) return "shadow-red-500/30";
  if (count <= 16) return "shadow-amber/30";
  return "shadow-green-500/30";
}

export default function ProgressBar({ visitedCount }: ProgressBarProps) {
  const total = pubs.length;
  const percentage = Math.round((visitedCount / total) * 100);
  const barColor = getBarColor(visitedCount);
  const glowColor = getGlowColor(visitedCount);
  const tierMessage = getTierMessage(visitedCount);

  return (
    <div className="progress-section">
      {/* Header row */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🍺</span>
          <span className="text-[0.9rem] font-bold text-primary">
            Group Progress
          </span>
        </div>
        <span className="text-[0.85rem] font-bold text-amber-light">
          {visitedCount}/{total} pubs visited
        </span>
      </div>

      {/* The bar */}
      <div className="relative h-4 overflow-hidden rounded-full border border-amber/10 bg-card">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} shadow-lg ${glowColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Tier message + percentage */}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[0.78rem] font-semibold text-secondary">
          {tierMessage}
        </span>
        <span className="text-[0.75rem] text-muted">{percentage}%</span>
      </div>
    </div>
  );
}
