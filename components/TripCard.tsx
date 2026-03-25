"use client";

import { Trip, getTripPubs, totalRouteDistance } from "@/lib/trips";

interface TripCardProps {
  trip: Trip;
  visitedPubIds: Set<number>;
  isSelected: boolean;
  onClick: () => void;
}

export default function TripCard({
  trip,
  visitedPubIds,
  isSelected,
  onClick,
}: TripCardProps) {
  const tripPubs = getTripPubs(trip);
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

  return (
    <div
      className={`trip-card ${trip.isBusTrip ? "bus-trip" : ""} ${isComplete ? "complete" : ""} ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[1.05rem] font-bold text-primary leading-snug">
          {trip.isBusTrip && "🚌 "}
          {trip.name}
        </h3>
        <span className={`trip-status-badge ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <p className="mt-1.5 text-[0.82rem] text-secondary leading-relaxed">
        {trip.description}
      </p>

      {/* Bus trip schedule info */}
      {trip.busInfo && (
        <div className="bus-info-box mt-3">
          <div className="flex items-center gap-2 text-[0.82rem]">
            <span>📅</span>
            <span className="font-semibold text-primary">
              {trip.busInfo.displayDate}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-secondary">
            <span>📍 {trip.busInfo.pickupStation}</span>
            <span>🕐 Pickup: {trip.busInfo.pickupTime}</span>
            <span>🏠 Return: {trip.busInfo.dropoffTime}</span>
          </div>
        </div>
      )}

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
