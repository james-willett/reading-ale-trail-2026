// Phase 2: Shared group visit tracking types

// A single attendee in a visit — who was there and what they drank
export interface Attendee {
  name: string;
  drink: string; // What they had (beer/cider name)
}

// A group visit to a pub
export interface Visit {
  pubId: number;
  date: string; // ISO date string
  attendees: Attendee[];
}

export interface VisitData {
  visits: Visit[];
}

// Core group members — always shown as checkbox options
export const CORE_MEMBERS = ["James", "Stan", "Bernard", "Colonel"] as const;

// ── Phase 5: Custom Trips & Trip Overrides ──────────────────

// A user-created custom trip
export interface CustomTrip {
  id: string; // e.g. "custom-1679xxx"
  name: string;
  description: string;
  pubIds: number[]; // ordered by user preference
  plannedDate?: string; // ISO date, e.g. "2026-04-12"
  isCustom: true; // discriminator — always true for custom trips
}

// Overrides for pre-defined trips (date, reordered pubs)
export interface TripOverride {
  pubOrder?: number[]; // reordered pub IDs (if user changed the order)
  plannedDate?: string; // ISO date
}

// What gets stored in the data store under "trips" key
export interface TripStore {
  customTrips: CustomTrip[];
  overrides: Record<string, TripOverride>; // keyed by pre-defined trip ID
}
