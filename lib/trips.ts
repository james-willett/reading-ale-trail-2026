// Phase 3: Trip Planner — pre-defined pub clusters for group outings
// Groupings based on geographic proximity of the 24 Ale Trail pubs

import { pubs, Pub } from "./pubs";

// Haversine formula — distance between two lat/lng points in kilometres
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Total route distance for an ordered list of pubs (in km)
export function totalRouteDistance(orderedPubs: Pub[]): number {
  let total = 0;
  for (let i = 0; i < orderedPubs.length - 1; i++) {
    total += haversineDistance(
      orderedPubs[i].lat,
      orderedPubs[i].lng,
      orderedPubs[i + 1].lat,
      orderedPubs[i + 1].lng
    );
  }
  return total;
}

// Get the pubs for a trip, in suggested visit order
export function getTripPubs(trip: Trip): Pub[] {
  return trip.pubIds.map((id) => pubs.find((p) => p.id === id)!);
}

// Bus trip schedule info
export interface BusInfo {
  date: string; // ISO date "2026-04-18"
  displayDate: string;
  pickupStation: string;
  pickupTime: string;
  dropoffTime: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  pubIds: number[]; // ordered by suggested visit sequence
  isBusTrip?: boolean;
  busInfo?: BusInfo;
  isCustom?: boolean; // true for user-created trips
  plannedDate?: string; // ISO date (from custom trip or override)
}

// ──────────────────────────────────────────────────────────
// Trip clusters — pub IDs ordered by proximity for each route
// ──────────────────────────────────────────────────────────
//
// Central Reading (10 pubs, all walkable):
//   Foresters Arms → Nags Head → Castle Tap → Rising Sun →
//   Greyfriar → Railway Tavern → Alehouse → Lyndhurst →
//   Retreat → Park House
//   (west-to-east sweep through town centre, ~5 km walk)
//
// Tilehurst Two (2 pubs, ~1 km apart):
//   Royal Oak → Fox & Hounds
//
// Caversham (1 pub, short walk over Caversham Bridge):
//   Crown
//
// East Run (4 pubs, driving route east of Reading):
//   Bull Inn Sonning → Flowing Spring Playhatch →
//   Castle Inn Hurst → Bell Waltham St Lawrence
//
// West & South Run (4 pubs, driving route west/south):
//   Swan Pangbourne → Sun Whitchurch Hill →
//   Six Bells Burghfield → Elm Tree Beech Hill
//
// Southern Outliers (3 pubs, scattered south):
//   Fox & Hounds Sheffield Bottom → Farriers Arms →
//   Bull Inn Arborfield Cross
// ──────────────────────────────────────────────────────────

export const trips: Trip[] = [
  {
    id: "central",
    name: "Central Reading Big Day Out",
    description:
      "The ultimate pub crawl through Reading town centre. All 10 pubs are walkable — start at the Foresters Arms and work your way east to Park House on the Uni campus.",
    // West-to-east route through central Reading
    pubIds: [14, 1, 6, 7, 5, 9, 2, 12, 3, 13],
  },
  {
    id: "caversham",
    name: "Caversham Crossing",
    description:
      "Nip across the Thames to Caversham for a pint at the Crown. Pairs nicely with the central trail — just a short walk over Caversham Bridge.",
    pubIds: [4],
  },
  {
    id: "tilehurst",
    name: "Tilehurst Two",
    description:
      "Two cracking pubs in Tilehurst, close enough for a pleasant walk between them along the residential streets.",
    pubIds: [15, 10],
  },
  {
    id: "east",
    name: "East Run",
    description:
      "A driving tour through the villages east of Reading — from Sonning to Waltham St Lawrence. Beautiful countryside pubs worth the trip.",
    pubIds: [18, 23, 22, 21],
  },
  {
    id: "west-south",
    name: "West & South Run",
    description:
      "From Pangbourne on the Thames down through the hills to Beech Hill. Stunning rural pubs with proper character.",
    pubIds: [20, 24, 16, 17],
  },
  {
    id: "southern",
    name: "Southern Outliers",
    description:
      "Three pubs scattered south of Reading. You'll need a car (or a very keen cycling group) to reach these gems.",
    pubIds: [11, 8, 19],
  },
  // ── CAMRA Bus Trips ──────────────────────────────────────
  {
    id: "bus-west",
    name: "CAMRA Bus Trip — West",
    description:
      "Hop on the CAMRA coach from Pangbourne station for a guided tour of the western pubs. No designated driver needed!",
    pubIds: [20, 24, 16, 17],
    isBusTrip: true,
    busInfo: {
      date: "2026-04-18",
      displayDate: "Saturday 18 April 2026",
      pickupStation: "Pangbourne station",
      pickupTime: "11:15am",
      dropoffTime: "~17:45",
    },
  },
  {
    id: "bus-east",
    name: "CAMRA Bus Trip — East",
    description:
      "The CAMRA coach picks you up at Twyford station and takes you round the eastern village pubs. Sit back and enjoy!",
    pubIds: [18, 23, 22, 21],
    isBusTrip: true,
    busInfo: {
      date: "2026-04-26",
      displayDate: "Sunday 26 April 2026",
      pickupStation: "Twyford station",
      pickupTime: "10:30am",
      dropoffTime: "~18:40",
    },
  },
];
