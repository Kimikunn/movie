type WishlistOverrideMap = Record<string, boolean>

const STORAGE_KEY = 'movie.wishlistOverrides.v1'

const isWishlistOverrideMap = (value: unknown): value is WishlistOverrideMap => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  return Object.values(value).every((item) => typeof item === 'boolean')
}

const readWishlistOverrideMap = (): WishlistOverrideMap => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed: unknown = JSON.parse(raw)
    return isWishlistOverrideMap(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

const writeWishlistOverrideMap = (payload: WishlistOverrideMap) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const isMediaWishlisted = (mediaId: string, defaultValue = false) => {
  const overrides = readWishlistOverrideMap()
  return Object.prototype.hasOwnProperty.call(overrides, mediaId) ? overrides[mediaId] : defaultValue
}

export const setMediaWishlisted = (mediaId: string, nextValue: boolean, defaultValue = false) => {
  const overrides = readWishlistOverrideMap()

  if (nextValue === defaultValue) {
    delete overrides[mediaId]
  } else {
    overrides[mediaId] = nextValue
  }

  writeWishlistOverrideMap(overrides)
}
