"use client";

import { Trip, getTripPubs, totalRouteDistance } from "@/lib/trips";
import { Pub } from "@/lib/pubs";

interface TripCardProps {
  trip: Trip;
  visitedPubIds: Set<number>;
  isSelected: boolean;
  onClick: () => void;
  plannedDate?: string; // from overrides or custom trip
  onDelete?: () => void; // only for custom trips
  // If the trip's pub order has been overridden, pass the reordered pubs
  overriddenPubs?: Pub[];
}

// Format an ISO date string nicely, e.g. "Sat 12 Apr"
function formatPlannedDate(iso: string): string {
  const d = new Date(iso + "T12:00:00"); // noon to avoid timezone shifts
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function TripCard({
  trip,
  visitedPubIds,
  isSelected,
  onClick,
  plannedDate,
  onDelete,
  overriddenPubs,
}: TripCardProps) {
  // Use overridden pub order if provided, otherwise default
  const tripPubs = overriddenPubs ?? getTripPubs(trip);
  const visitedInTrip = tripPubs.filter((p) => visitedPubIds.has(p.id)).length;
  const totalPubs = tripPubs.length;
  const distance = totalRouteDistance(tripPubs);

  // Status logic
  const isComplete = visitedInTrip === totalPubs;
  const inProgress = visitedInTrip > 0 && !isComplete;
  const statusLabel = isComplete
    ? "Complete!"
    : inProgress
      ? "In progress"
      : "Not started";
  const statusClass = isComplete
    ? "trip-badge-complete"
    : inProgress
      ? "trip-badge-progress"
      : "trip-badge-pending";

  const isCustom = "isCustom" in trip && trip.isCustom;

  return (
    <div
      className={`trip-card ${isComplete ? "complete" : ""} ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.05rem] font-bold text-primary leading-snug">
            {isCustom && "📝 "}
            {trip.name}
          </h3>
          {/* Planned date badge */}
          {plannedDate && (
            <span className="trip-date-badge mt-1 inline-block">
              📅 Planned: {formatPlannedDate(plannedDate)}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`trip-status-badge ${statusClass}`}>
            {statusLabel}
          </span>
          {/* Delete button for custom trips */}
          {isCustom && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="trip-delete-btn"
              aria-label="Delete trip"
              title="Delete custom trip"
            >
              🗑
            </button>
          )}
        </div>
      </div>

      <p className="mt-1.5 text-[0.82rem] text-secondary leading-relaxed">
        {trip.description}
      </p>

      {/* Stats row */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.78rem]">
        <span className="trip-stat">
          🍺 {totalPubs} pub{totalPubs !== 1 ? "s" : ""}
        </span>
        {totalPubs > 1 && (
          <span className="trip-stat">📏 {distance.toFixed(1)} km</span>
        )}
        <span
          className={`trip-stat font-semibold ${visitedInTrip > 0 ? "text-green-400" : ""}`}
        >
          ✅ {visitedInTrip}/{totalPubs} done
        </span>
      </div>

      {/* Pub pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tripPubs.map((pub) => (
          <span
            key={pub.id}
            className={`trip-pub-pill ${visitedPubIds.has(pub.id) ? "visited" : ""}`}
          >
            {visitedPubIds.has(pub.id) && "✓ "}
            {pub.name}
          </span>
        ))}
      </div>
    </div>
  );
}
