export type WatchLog = {
  id: string
  movieId: string
  watchedAt: string
  watchMethod: string
  score: number
  note?: string
  overrideKey?: string
  createdAt: number
  updatedAt: number
}

export type NewWatchLog = Omit<WatchLog, 'id' | 'createdAt' | 'updatedAt'>

const STORAGE_KEY = 'movie.watchLogs.v1'
const DELETED_SEED_STORAGE_KEY = 'movie.deletedSeedWatchLogs.v1'
const WATCH_METHOD_MAP: Record<string, string> = {
  '': '\u5176\u4ed6',
  '\u5f71\u9662': '\u5f71\u9662',
  IMAX: '\u5f71\u9662',
  imax: '\u5f71\u9662',
  '\u675c\u6bd4': '\u5f71\u9662',
  '\u675c\u6bd4\u5f71\u9662': '\u5f71\u9662',
  dolby: '\u5f71\u9662',
  cinema: '\u5f71\u9662',
  '\u6d41\u5a92\u4f53': '\u6d41\u5a92\u4f53',
  streaming: '\u6d41\u5a92\u4f53',
  stream: '\u6d41\u5a92\u4f53',
  '\u84dd\u5149': '\u84dd\u5149/\u789f\u7247',
  '\u84dd\u5149\u789f': '\u84dd\u5149/\u789f\u7247',
  '\u84dd\u5149/\u789f\u7247': '\u84dd\u5149/\u789f\u7247',
  bluRay: '\u84dd\u5149/\u789f\u7247',
  bluray: '\u84dd\u5149/\u789f\u7247',
  '\u789f\u7247': '\u84dd\u5149/\u789f\u7247',
  other: '\u5176\u4ed6',
  '\u5176\u4ed6': '\u5176\u4ed6',
}

const normalizeScore = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const normalizeWatchMethod = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = WATCH_METHOD_MAP[value.trim()]
  return normalized ?? '\u5176\u4ed6'
}

const normalizeWatchLog = (value: unknown): WatchLog | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>

  if (
    typeof record.id !== 'string' ||
    typeof record.movieId !== 'string' ||
    typeof record.watchedAt !== 'string' ||
    typeof record.createdAt !== 'number'
  ) {
    return null
  }

  const watchMethod = normalizeWatchMethod(record.watchMethod ?? record.mode)
  const score = normalizeScore(record.score)

  if (!watchMethod || score === null) {
    return null
  }

  return {
    id: record.id,
    movieId: record.movieId,
    watchedAt: record.watchedAt,
    watchMethod,
    score,
    note: typeof record.note === 'string' ? record.note : undefined,
    overrideKey: typeof record.overrideKey === 'string' ? record.overrideKey : undefined,
    createdAt: record.createdAt,
    updatedAt: typeof record.updatedAt === 'number' ? record.updatedAt : record.createdAt,
  }
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

    const normalizedLogs = parsed
      .map((item) => normalizeWatchLog(item))
      .filter((item): item is WatchLog => item !== null)

    if (normalizedLogs.length !== parsed.length || JSON.stringify(parsed) !== JSON.stringify(normalizedLogs)) {
      writeWatchLogs(normalizedLogs)
    }

    return normalizedLogs
  } catch {
    return []
  }
}

const writeWatchLogs = (logs: WatchLog[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

const readDeletedSeedWatchLogs = (): string[] => {
  try {
    const raw = window.localStorage.getItem(DELETED_SEED_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

const writeDeletedSeedWatchLogs = (keys: string[]) => {
  window.localStorage.setItem(DELETED_SEED_STORAGE_KEY, JSON.stringify(keys))
}

const createDeletedSeedKey = (movieId: string, overrideKey: string) => `${movieId}:${overrideKey}`

export const addWatchLog = (payload: NewWatchLog): WatchLog => {
  const now = Date.now()
  const next: WatchLog = {
    ...payload,
    id: `${payload.movieId}-${now}`,
    createdAt: now,
    updatedAt: now,
  }
  const logs = readWatchLogs()
  logs.unshift(next)
  writeWatchLogs(logs)
  return next
}

export const getWatchLogsByMovie = (movieId: string): WatchLog[] => readWatchLogs().filter((item) => item.movieId === movieId)

export const getDeletedSeedWatchLogKeysByMovie = (movieId: string): string[] =>
  readDeletedSeedWatchLogs()
    .filter((item) => item.startsWith(`${movieId}:`))
    .map((item) => item.slice(movieId.length + 1))

type UpdateWatchLogPayload = Partial<Pick<WatchLog, 'watchedAt' | 'watchMethod' | 'score' | 'note' | 'overrideKey'>>

export const updateWatchLog = (id: string, payload: UpdateWatchLogPayload): WatchLog | null => {
  const logs = readWatchLogs()
  const targetIndex = logs.findIndex((item) => item.id === id)
  if (targetIndex < 0) {
    return null
  }

  const next = {
    ...logs[targetIndex],
    ...payload,
    updatedAt: Date.now(),
  }
  logs[targetIndex] = next
  writeWatchLogs(logs)
  return next
}

export const deleteWatchLog = (id: string): boolean => {
  const logs = readWatchLogs()
  const nextLogs = logs.filter((item) => item.id !== id)
  if (nextLogs.length === logs.length) {
    return false
  }

  writeWatchLogs(nextLogs)
  return true
}

export const markSeedWatchLogDeleted = (movieId: string, overrideKey: string) => {
  const keys = readDeletedSeedWatchLogs()
  const nextKey = createDeletedSeedKey(movieId, overrideKey)
  if (keys.includes(nextKey)) {
    return
  }

  keys.push(nextKey)
  writeDeletedSeedWatchLogs(keys)
}
