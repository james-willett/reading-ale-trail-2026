"use client";

interface MapSkeletonProps {
  height?: string; // Tailwind height class, e.g. "h-[60vh]"
}

// Dark themed loading skeleton shown while Leaflet map initialises
export default function MapSkeleton({ height = "h-[60vh] md:h-[55vh]" }: MapSkeletonProps) {
  return (
    <div
      className={`${height} min-h-[180px] w-full animate-pulse bg-card relative overflow-hidden flex items-center justify-center`}
    >
      {/* Subtle grid lines to hint at a map */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,160,52,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,52,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Spinner + label */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-[3px] border-amber/20 border-t-amber animate-spin" />
        <span className="text-[0.85rem] font-semibold text-muted">Loading map…</span>
      </div>
    </div>
  );
}
