import { getStorage } from "./storage";
import { VisitData } from "./types";

const DEFAULT_VISITS: VisitData = { visits: [] };

// Get all visits from storage (local JSON or Netlify Blobs)
export async function getVisits(): Promise<VisitData> {
  const storage = getStorage();
  return (await storage.getJSON<VisitData>("visits")) ?? DEFAULT_VISITS;
}

// Save all visits to storage
export async function saveVisits(data: VisitData): Promise<void> {
  const storage = getStorage();
  await storage.setJSON("visits", data);
}
