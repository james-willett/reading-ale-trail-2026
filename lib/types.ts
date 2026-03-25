// Phase 2: Member and visit tracking types

export interface Member {
  id: string;
  name: string;
  emoji: string;
  isCore: boolean; // Core members can't be removed
}

export interface Visit {
  personId: string;
  pubId: number;
  date: string; // ISO date string
}

export interface VisitData {
  visits: Visit[];
}

export interface MemberData {
  members: Member[];
}

// Core 4 members — always visible, can't be removed
export const CORE_MEMBERS: Member[] = [
  { id: "james", name: "James", emoji: "🎸", isCore: true },
  { id: "stan", name: "Stan", emoji: "🎩", isCore: true },
  { id: "bernard", name: "Bernard", emoji: "🧔", isCore: true },
  { id: "colonel", name: "Colonel", emoji: "🎖️", isCore: true },
];

// Pre-seeded guests
export const DEFAULT_GUESTS: Member[] = [
  { id: "sarah", name: "Sarah", emoji: "🌟", isCore: false },
  { id: "noga", name: "Noga", emoji: "🌸", isCore: false },
  { id: "aidan", name: "Aidan", emoji: "⚡", isCore: false },
];
