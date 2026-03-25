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
