// Phase 5: Trip storage layer — custom trips + overrides for pre-defined trips
// Same abstraction as visits: local JSON in dev, Netlify Blobs in production

import { getStorage } from "./storage";
import { TripStore } from "./types";

const DEFAULT_TRIP_STORE: TripStore = {
  customTrips: [],
  overrides: {},
};

// Get all trip data from storage (custom trips + overrides)
export async function getTripStore(): Promise<TripStore> {
  const storage = getStorage();
  return (await storage.getJSON<TripStore>("trips")) ?? DEFAULT_TRIP_STORE;
}

// Save trip data to storage
export async function saveTripStore(data: TripStore): Promise<void> {
  const storage = getStorage();
  await storage.setJSON("trips", data);
}
