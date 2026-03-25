import { getStore } from "@netlify/blobs";
import { StorageBackend } from "./types";

// Production backend — reads/writes to Netlify Blobs
function getAppStore() {
  return getStore({ name: "ale-trail-visits", consistency: "strong" });
}

export const netlifyStorageBackend: StorageBackend = {
  async getJSON<T>(key: string): Promise<T | null> {
    const store = getAppStore();
    const data = await store.get(key, { type: "json" });
    return (data as T) ?? null;
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    const store = getAppStore();
    await store.setJSON(key, value);
  },
};
