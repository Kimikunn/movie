const CACHE_PREFIX = 'movie:offline-cache:'

const isStorageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const readOfflineCache = <T,>(key: string): T | null => {
  if (!isStorageAvailable()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const writeOfflineCache = <T,>(key: string, value: T) => {
  if (!isStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // Ignore quota and serialization failures. Cache should never block reads.
  }
}
