// Storage backend interface — both local and Netlify backends implement this
export interface StorageBackend {
  getJSON<T>(key: string): Promise<T | null>;
  setJSON<T>(key: string, value: T): Promise<void>;
}
