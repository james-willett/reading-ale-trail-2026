import { StorageBackend } from "./types";

// Pick the right backend based on environment:
// - Netlify sets NETLIFY_BLOBS_CONTEXT automatically at runtime
// - Locally we fall back to filesystem JSON
function getBackend(): StorageBackend {
  if (process.env.NETLIFY_BLOBS_CONTEXT) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { netlifyStorageBackend } = require("./netlify");
    return netlifyStorageBackend;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { localStorageBackend } = require("./local");
  return localStorageBackend;
}

// Singleton — initialised once per process
let _backend: StorageBackend | null = null;

export function getStorage(): StorageBackend {
  if (!_backend) {
    _backend = getBackend();
  }
  return _backend;
}
