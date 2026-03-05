type ShortReviewMap = Record<string, string>

const STORAGE_KEY = 'movie.shortReviews.v1'

const isShortReviewMap = (value: unknown): value is ShortReviewMap => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  return Object.values(value).every((item) => typeof item === 'string')
}

const readShortReviewMap = (): ShortReviewMap => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed: unknown = JSON.parse(raw)
    if (!isShortReviewMap(parsed)) {
      return {}
    }
    return parsed
  } catch {
    return {}
  }
}

const writeShortReviewMap = (payload: ShortReviewMap) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const getShortReviewByMovie = (movieId: string): string => {
  return readShortReviewMap()[movieId] ?? ''
}

export const setShortReviewByMovie = (movieId: string, review: string) => {
  const next = readShortReviewMap()
  next[movieId] = review
  writeShortReviewMap(next)
}
