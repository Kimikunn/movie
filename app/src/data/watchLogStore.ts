export type WatchLog = {
  id: string
  movieId: string
  watchedAt: string
  place: string
  mode: string
  score: string
  note?: string
  createdAt: number
}

export type NewWatchLog = Omit<WatchLog, 'id' | 'createdAt'>

const STORAGE_KEY = 'movie.watchLogs.v1'

const isWatchLog = (value: unknown): value is WatchLog => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.movieId === 'string' &&
    typeof record.watchedAt === 'string' &&
    typeof record.place === 'string' &&
    typeof record.mode === 'string' &&
    typeof record.score === 'string' &&
    typeof record.createdAt === 'number'
  )
}

export const readWatchLogs = (): WatchLog[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isWatchLog)
  } catch {
    return []
  }
}

const writeWatchLogs = (logs: WatchLog[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

export const addWatchLog = (payload: NewWatchLog): WatchLog => {
  const next: WatchLog = {
    ...payload,
    id: `${payload.movieId}-${Date.now()}`,
    createdAt: Date.now(),
  }
  const logs = readWatchLogs()
  logs.unshift(next)
  writeWatchLogs(logs)
  return next
}

export const getWatchLogsByMovie = (movieId: string): WatchLog[] => {
  return readWatchLogs().filter((item) => item.movieId === movieId)
}

type UpdateWatchLogPayload = Partial<Pick<WatchLog, 'watchedAt' | 'place' | 'mode' | 'score' | 'note'>>

export const updateWatchLog = (id: string, payload: UpdateWatchLogPayload): WatchLog | null => {
  const logs = readWatchLogs()
  const targetIndex = logs.findIndex((item) => item.id === id)
  if (targetIndex < 0) {
    return null
  }

  const next = {
    ...logs[targetIndex],
    ...payload,
  }
  logs[targetIndex] = next
  writeWatchLogs(logs)
  return next
}
