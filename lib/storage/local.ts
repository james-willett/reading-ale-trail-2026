import fs from "fs";
import path from "path";
import { StorageBackend } from "./types";

// Local dev backend — reads/writes JSON files from the data/ directory
const dataDir = path.join(process.cwd(), "data");

export const localStorageBackend: StorageBackend = {
  async getJSON<T>(key: string): Promise<T | null> {
    const filePath = path.join(dataDir, `${key}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    const filePath = path.join(dataDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
  },
};
