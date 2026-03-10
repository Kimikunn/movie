import { getShortReviewByMovie } from './shortReviewStore'
import { getWatchLogsByMovie } from './watchLogStore'
import { isMediaWishlisted } from './wishlistStore'
import { readOfflineCache, writeOfflineCache } from './offlineCache'

export type ApiResponse<T> = {
  data?: T
  error?: {
    code?: string
    message: string
    details?: Record<string, string[] | string>
  }
}

export type MediaItem = {
  id: string
  contentType: 'movie' | 'season'
  title: string
  originalTitle?: string
  year: number
  runtimeMinutes: number
  genres: string[]
  countries: string[]
  directors: string[]
  cast: string[]
  synopsis: string
  posterUrl?: string
}

export type MediaCardItem = {
  mediaId: string
  contentType: 'movie' | 'season'
  title: string
  originalTitle?: string
  year?: number
  countries?: string[]
  primaryGenre?: string
  runtimeMinutes?: number
  userScore?: number
  posterUrl?: string
}

export type SearchMediaItem = MediaCardItem & {
  matchedBy: Array<'title' | 'originalTitle' | 'director' | 'cast'>
}

export type SearchMediaResponse = {
  query: string
  items: SearchMediaItem[]
  suggestions?: string[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type MediaRatings = {
  mediaId: string
  platformAverageScore?: number
  douban?: { score: number; count?: number; stars?: number }
  metacritic?: { score: number; summary?: string }
  tmdb?: { score: number }
  imdb?: { score: number; count?: number }
  rottenTomatoes?: { criticsScore?: number; audienceScore?: number }
}

export type ShortReview = {
  id: string
  mediaId: string
  content: string
  updatedAt: string
}

export type WatchLogContract = {
  id: string
  mediaId: string
  watchedOn: string
  watchMethod: string
  userScore: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type MediaUserState = {
  libraryStatus: 'none' | 'wishlist' | 'watched'
}

export type MediaDetailResponse = {
  media: MediaItem
  ratings?: MediaRatings
  userState: MediaUserState
  watchLogs: WatchLogContract[]
  shortReview?: ShortReview | null
}

export type RankedMediaItem = MediaCardItem & {
  rank: number
}

export type TrendSeries = {
  periodType: 'month' | 'week' | 'day'
  unit: 'movies' | 'hours'
  points: Array<{
    key: string
    label: string
    value: number
  }>
}

export type GenrePreferenceItem = {
  genre: string
  watchedMoviesCount: number
}

export type RecordsOverview = {
  periodType: 'year' | 'month' | 'week'
  periodStart: string
  periodEnd: string
  watchedMoviesCount: number
  watchDurationHours: number
  watchedDaysCount: number
  averageMonthlyHours?: number
}

export type WeekRhythmPreview = {
  periodStart: string
  periodEnd: string
  watchedDates: string[]
}

export type DailyWatchRecord = {
  date: string
  watchedMoviesCount: number
  watchDurationHours: number
  items: MediaCardItem[]
}

export type YearRecordsResponse = {
  overview: RecordsOverview
  topMovies: RankedMediaItem[]
  trend: TrendSeries
  genrePreferences: GenrePreferenceItem[]
}

export type MonthRecordsResponse = {
  overview: RecordsOverview
  topMovies: RankedMediaItem[]
  weekRhythm: WeekRhythmPreview
  genrePreferences: GenrePreferenceItem[]
}

export type WeekRecordsResponse = {
  overview: RecordsOverview
  dailyRecords: DailyWatchRecord[]
}

export type HomeResponse = {
  heroMedia?: MediaCardItem | null
  watchlist: MediaCardItem[]
  recentWatched: Array<{
    media: MediaCardItem
    watchedOn: string
  }>
  favoriteMedia: MediaCardItem[]
}

export type MockScenario = 'default' | 'empty' | 'error' | 'offline'

type SeedWatchLog = {
  watchedOn: string
  watchMethod: string
  userScore: number
  note?: string
}

const mediaLibrary: Record<string, MediaItem> = {
  'dune-2': {
    id: 'dune-2',
    contentType: 'movie',
    title: '沙丘 2',
    originalTitle: 'Dune: Part Two',
    year: 2024,
    runtimeMinutes: 166,
    genres: ['科幻', '冒险'],
    countries: ['中国大陆', '美国'],
    directors: ['丹尼斯·维伦纽瓦'],
    cast: ['提莫西·查拉梅', '赞达亚'],
    synopsis: '保罗接受命运，与弗雷曼并肩作战。',
  },
  'anatomy-of-a-fall': {
    id: 'anatomy-of-a-fall',
    contentType: 'movie',
    title: '坠落的审判',
    originalTitle: 'Anatomy of a Fall',
    year: 2023,
    runtimeMinutes: 151,
    genres: ['剧情', '悬疑'],
    countries: ['法国'],
    directors: ['茹斯汀·特里耶'],
    cast: ['桑德拉·惠勒', '斯万·阿劳德'],
    synopsis: '一场坠楼案引发审判，婚姻与真相在法庭中被层层剥开。',
  },
  'robot-dreams': {
    id: 'robot-dreams',
    contentType: 'movie',
    title: '机器人之梦',
    originalTitle: 'Robot Dreams',
    year: 2023,
    runtimeMinutes: 102,
    genres: ['动画', '剧情'],
    countries: ['西班牙', '法国'],
    directors: ['巴勃罗·贝赫尔'],
    cast: ['动画角色'],
    synopsis: '在无对白的城市寓言里，友情与离别被温柔讲述。',
  },
  furiosa: {
    id: 'furiosa',
    contentType: 'movie',
    title: '芙莉欧莎',
    originalTitle: 'Furiosa: A Mad Max Saga',
    year: 2024,
    runtimeMinutes: 148,
    genres: ['动作', '冒险'],
    countries: ['澳大利亚', '美国'],
    directors: ['乔治·米勒'],
    cast: ['安雅·泰勒-乔伊', '克里斯·海姆斯沃斯'],
    synopsis: '一段在废土世界中求生与复仇的成长旅程。',
  },
  'poor-things': {
    id: 'poor-things',
    contentType: 'movie',
    title: '可怜的东西',
    originalTitle: 'Poor Things',
    year: 2023,
    runtimeMinutes: 141,
    genres: ['奇幻', '喜剧'],
    countries: ['英国', '爱尔兰', '美国'],
    directors: ['欧格斯·兰斯莫斯'],
    cast: ['艾玛·斯通', '马克·鲁法洛'],
    synopsis: '用荒诞与黑色幽默，讨论女性成长、自由与自我建构。',
  },
  'blade-runner-2049': {
    id: 'blade-runner-2049',
    contentType: 'movie',
    title: '银翼杀手 2049',
    originalTitle: 'Blade Runner 2049',
    year: 2017,
    runtimeMinutes: 164,
    genres: ['科幻'],
    countries: ['美国'],
    directors: ['丹尼斯·维伦纽瓦'],
    cast: ['瑞恩·高斯林', '哈里森·福特'],
    synopsis: '复制人猎人追查一段足以改写秩序的隐秘历史。',
  },
  'in-the-mood-for-love': {
    id: 'in-the-mood-for-love',
    contentType: 'movie',
    title: '花样年华',
    originalTitle: 'In the Mood for Love',
    year: 2000,
    runtimeMinutes: 98,
    genres: ['爱情', '剧情'],
    countries: ['中国香港'],
    directors: ['王家卫'],
    cast: ['梁朝伟', '张曼玉'],
    synopsis: '克制的情感在狭窄空间和时间缝隙中慢慢发酵。',
  },
  tenet: {
    id: 'tenet',
    contentType: 'movie',
    title: '信条',
    originalTitle: 'Tenet',
    year: 2020,
    runtimeMinutes: 150,
    genres: ['科幻', '动作'],
    countries: ['美国'],
    directors: ['克里斯托弗·诺兰'],
    cast: ['约翰·大卫·华盛顿', '罗伯特·帕丁森'],
    synopsis: '时间逆转的设定把谍战故事推向极端复杂的维度。',
  },
}

const mediaRatingsById: Record<string, MediaRatings> = {
  'dune-2': {
    mediaId: 'dune-2',
    platformAverageScore: 8.5,
    douban: { score: 8.3, count: 262791, stars: 4 },
    metacritic: { score: 79, summary: 'Generally Favorable' },
    tmdb: { score: 84 },
    imdb: { score: 8.5, count: 3200000 },
    rottenTomatoes: { criticsScore: 92, audienceScore: 88 },
  },
  'anatomy-of-a-fall': {
    mediaId: 'anatomy-of-a-fall',
    platformAverageScore: 8.9,
    douban: { score: 8.6, count: 181402, stars: 4 },
    metacritic: { score: 89, summary: 'Universal Acclaim' },
    tmdb: { score: 77 },
    imdb: { score: 7.7, count: 200000 },
    rottenTomatoes: { criticsScore: 96, audienceScore: 79 },
  },
  'robot-dreams': {
    mediaId: 'robot-dreams',
    platformAverageScore: 8.3,
    douban: { score: 9.1, count: 154220, stars: 4 },
    metacritic: { score: 86, summary: 'Universal Acclaim' },
    tmdb: { score: 79 },
    imdb: { score: 7.8, count: 80000 },
    rottenTomatoes: { criticsScore: 98, audienceScore: 90 },
  },
  furiosa: {
    mediaId: 'furiosa',
    platformAverageScore: 7.9,
    douban: { score: 7.5, count: 112304, stars: 3 },
    metacritic: { score: 79, summary: 'Generally Favorable' },
    tmdb: { score: 76 },
    imdb: { score: 7.5, count: 200000 },
    rottenTomatoes: { criticsScore: 90, audienceScore: 88 },
  },
  'poor-things': {
    mediaId: 'poor-things',
    platformAverageScore: 8.1,
    douban: { score: 8.0, count: 248136, stars: 4 },
    metacritic: { score: 88, summary: 'Universal Acclaim' },
    tmdb: { score: 78 },
    imdb: { score: 7.8, count: 400000 },
    rottenTomatoes: { criticsScore: 92, audienceScore: 79 },
  },
}

export const defaultSeedWatchLogsByMediaId: Record<string, SeedWatchLog[]> = {
  'dune-2': [
    { watchedOn: '2026-02-25', watchMethod: '影院', userScore: 9.2 },
    { watchedOn: '2026-03-03', watchMethod: '影院', userScore: 9.0 },
  ],
  'anatomy-of-a-fall': [{ watchedOn: '2026-02-19', watchMethod: '影院', userScore: 9.0 }],
}

export const defaultShortReviewByMediaId: Record<string, string> = {
  'dune-2': '视听震撼，节奏流畅，第二部真正立住世界观。',
  'anatomy-of-a-fall': '表演极其克制，法庭戏张力很足。',
  'robot-dreams': '无对白却很有共鸣，后劲很强。',
  furiosa: '动作设计凌厉，节奏推进非常硬核。',
  'poor-things': '设定大胆，视觉风格统一且鲜明。',
}

const defaultWishlistMediaIds = ['dune-2', 'anatomy-of-a-fall', 'robot-dreams']
const favoriteMediaIds = ['dune-2', 'blade-runner-2049', 'in-the-mood-for-love', 'robot-dreams', 'anatomy-of-a-fall', 'tenet']

const toCardItem = (mediaId: string, userScore?: number): MediaCardItem => {
  const media = mediaLibrary[mediaId]
  return {
    mediaId: media.id,
    contentType: media.contentType,
    title: media.title,
    originalTitle: media.originalTitle,
    year: media.year,
    countries: media.countries,
    primaryGenre: media.genres[0],
    runtimeMinutes: media.runtimeMinutes,
    userScore,
  }
}

const getSeedLatestScore = (mediaId: string) =>
  [...(defaultSeedWatchLogsByMediaId[mediaId] ?? [])].sort((left, right) => right.watchedOn.localeCompare(left.watchedOn))[0]?.userScore

const getLatestUserScore = (mediaId: string) =>
  [...getWatchLogsByMovie(mediaId)].sort((left, right) => right.createdAt - left.createdAt)[0]?.score

const hasWatchHistory = (mediaId: string) =>
  getWatchLogsByMovie(mediaId).length > 0 || (defaultSeedWatchLogsByMediaId[mediaId]?.length ?? 0) > 0

const getWishlistMediaIds = () =>
  Object.keys(mediaLibrary).filter(
    (mediaId) => isMediaWishlisted(mediaId, defaultWishlistMediaIds.includes(mediaId)) && !hasWatchHistory(mediaId),
  )

export const getPosterTone = (mediaId: string) =>
  ({
    'dune-2': 'dark',
    'anatomy-of-a-fall': 'charcoal',
    'robot-dreams': 'silver',
    furiosa: 'dark',
    'poor-things': 'charcoal',
    'blade-runner-2049': 'dark',
    'in-the-mood-for-love': 'charcoal',
    tenet: 'mid',
  })[mediaId] ?? 'dark'

export const getFavoriteWallClass = (mediaId: string) =>
  ({
    'dune-2': 'hero fav-1 border-soft',
    'blade-runner-2049': 'tall fav-2',
    'in-the-mood-for-love': 'tall fav-3',
    'robot-dreams': 'mid fav-4',
    'anatomy-of-a-fall': 'wide fav-5 border-soft',
    tenet: 'mid fav-6',
  })[mediaId] ?? 'mid'

export const getMediaById = (mediaId: string) => mediaLibrary[mediaId] ?? mediaLibrary['dune-2']
export const getMediaRatingsById = (mediaId: string) => mediaRatingsById[mediaId]

export const getHomeResponse = (): HomeResponse => ({
  heroMedia: toCardItem('dune-2', getLatestUserScore('dune-2') ?? getSeedLatestScore('dune-2')),
  watchlist: getWishlistMediaIds().map((mediaId) => toCardItem(mediaId, getLatestUserScore(mediaId) ?? getSeedLatestScore(mediaId))),
  recentWatched: [
    { media: toCardItem('dune-2', 9.2), watchedOn: '2026-02-25' },
    { media: toCardItem('anatomy-of-a-fall', 9.0), watchedOn: '2026-02-19' },
  ],
  favoriteMedia: favoriteMediaIds.map((mediaId) => toCardItem(mediaId, getLatestUserScore(mediaId) ?? getSeedLatestScore(mediaId))),
})

export const searchMedia = (query: string): SearchMediaResponse => {
  const keyword = query.trim()
  const items = Object.values(mediaLibrary)
    .map((media): SearchMediaItem | null => {
      const matchedBy: SearchMediaItem['matchedBy'] = []
      if (!keyword) {
        matchedBy.push('title')
      } else {
        if (media.title.includes(keyword)) matchedBy.push('title')
        if (media.originalTitle?.toLowerCase().includes(keyword.toLowerCase())) matchedBy.push('originalTitle')
        if (media.directors.some((item) => item.includes(keyword))) matchedBy.push('director')
        if (media.cast.some((item) => item.includes(keyword))) matchedBy.push('cast')
      }

      if (!matchedBy.length) {
        return null
      }

      return {
        ...toCardItem(media.id, getLatestUserScore(media.id) ?? getSeedLatestScore(media.id)),
        matchedBy,
      }
    })
    .filter((item): item is SearchMediaItem => item !== null)

  const suggestions =
    items.length > 0 || !keyword
      ? undefined
      : Object.values(mediaLibrary)
          .filter((media) => media.title.startsWith(keyword.slice(0, 1)))
          .slice(0, 3)
          .map((media) => media.title)

  return {
    query: keyword,
    items,
    suggestions,
    pagination: {
      page: 1,
      pageSize: 20,
      total: items.length,
      totalPages: 1,
    },
  }
}

export const getMediaDetailResponse = (mediaId: string): MediaDetailResponse => {
  const media = getMediaById(mediaId)
  const storedReview = getShortReviewByMovie(mediaId)
  const watchLogs = getWatchLogsByMovie(mediaId).map((item) => ({
    id: item.id,
    mediaId: item.movieId,
    watchedOn: item.watchedAt,
    watchMethod: item.watchMethod,
    userScore: item.score,
    note: item.note,
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
  }))
  const hasWatched = hasWatchHistory(mediaId)

  return {
    media,
    ratings: getMediaRatingsById(mediaId),
    userState: {
      libraryStatus: hasWatched ? 'watched' : isMediaWishlisted(mediaId, defaultWishlistMediaIds.includes(mediaId)) ? 'wishlist' : 'none',
    },
    watchLogs,
    shortReview:
      storedReview !== undefined
        ? {
            id: `review_${mediaId}`,
            mediaId,
            content: storedReview,
            updatedAt: new Date().toISOString(),
          }
        : defaultShortReviewByMediaId[mediaId]
          ? {
              id: `review_${mediaId}`,
              mediaId,
              content: defaultShortReviewByMediaId[mediaId],
              updatedAt: new Date().toISOString(),
            }
          : null,
  }
}

export const getYearRecordsResponse = (): YearRecordsResponse => ({
  overview: {
    periodType: 'year',
    periodStart: '2026-01-01T00:00:00.000Z',
    periodEnd: '2026-12-31T23:59:59.999Z',
    watchedMoviesCount: 128,
    watchDurationHours: 286,
    watchedDaysCount: 64,
    averageMonthlyHours: 23.8,
  },
  topMovies: ['dune-2', 'anatomy-of-a-fall', 'robot-dreams', 'furiosa', 'poor-things'].map((mediaId, index) => ({
    ...toCardItem(mediaId, getLatestUserScore(mediaId) ?? getSeedLatestScore(mediaId)),
    rank: index + 1,
  })),
  trend: {
    periodType: 'month',
    unit: 'hours',
    points: [
      { key: '1', label: '1月', value: 16 },
      { key: '2', label: '2月', value: 13 },
      { key: '3', label: '3月', value: 21 },
      { key: '4', label: '4月', value: 15 },
      { key: '5', label: '5月', value: 29 },
      { key: '6', label: '6月', value: 26 },
      { key: '7', label: '7月', value: 12 },
      { key: '8', label: '8月', value: 11 },
      { key: '9', label: '9月', value: 13 },
      { key: '10', label: '10月', value: 10 },
      { key: '11', label: '11月', value: 12 },
      { key: '12', label: '12月', value: 9 },
    ],
  },
  genrePreferences: [
    { genre: '剧情', watchedMoviesCount: 32 },
    { genre: '科幻', watchedMoviesCount: 24 },
    { genre: '动画', watchedMoviesCount: 17 },
    { genre: '悬疑', watchedMoviesCount: 14 },
    { genre: '纪录', watchedMoviesCount: 11 },
  ],
})

export const getMonthRecordsResponse = (): MonthRecordsResponse => ({
  overview: {
    periodType: 'month',
    periodStart: '2026-02-01T00:00:00.000Z',
    periodEnd: '2026-02-28T23:59:59.999Z',
    watchedMoviesCount: 11,
    watchDurationHours: 24,
    watchedDaysCount: 8,
  },
  topMovies: ['dune-2', 'anatomy-of-a-fall', 'robot-dreams'].map((mediaId, index) => ({
    ...toCardItem(mediaId, getLatestUserScore(mediaId) ?? getSeedLatestScore(mediaId)),
    rank: index + 1,
  })),
  weekRhythm: {
    periodStart: '2026-02-24',
    periodEnd: '2026-03-02',
    watchedDates: ['2026-02-25', '2026-03-02'],
  },
  genrePreferences: [
    { genre: '剧情', watchedMoviesCount: 32 },
    { genre: '科幻', watchedMoviesCount: 26 },
    { genre: '动画', watchedMoviesCount: 17 },
  ],
})

export const getWeekRecordsResponse = (): WeekRecordsResponse => ({
  overview: {
    periodType: 'week',
    periodStart: '2026-02-24T00:00:00.000Z',
    periodEnd: '2026-03-02T23:59:59.999Z',
    watchedMoviesCount: 2,
    watchDurationHours: 5.3,
    watchedDaysCount: 1,
  },
  dailyRecords: [
    { date: '2026-02-24', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
    {
      date: '2026-02-25',
      watchedMoviesCount: 2,
      watchDurationHours: 1.8,
      items: [toCardItem('dune-2', 9.2), toCardItem('anatomy-of-a-fall', 9.0)],
    },
    { date: '2026-02-26', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
    { date: '2026-02-27', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
    { date: '2026-02-28', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
    { date: '2026-03-01', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
    { date: '2026-03-02', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
  ],
})

const createMockError = (message: string, code = 'MOCK_ERROR') => Object.assign(new Error(message), { code })

const delay = (ms = 280) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const resolveMockScenario = (value: string | null | undefined): MockScenario => {
  if (value === 'empty') {
    return 'empty'
  }
  if (value === 'error') {
    return 'error'
  }
  if (value === 'offline') {
    return 'offline'
  }
  return 'default'
}

const runMockRequest = async <T>(loader: () => T, scenario: MockScenario): Promise<T> => {
  await delay()
  if (scenario === 'error') {
    throw createMockError('模拟请求失败，请稍后重试。')
  }
  return loader()
}

const isOfflineMode = (scenario: MockScenario) => scenario === 'offline' || (typeof navigator !== 'undefined' && navigator.onLine === false)

const runCachedMockRequest = async <T>(cacheKey: string, loader: () => T, scenario: MockScenario): Promise<T> => {
  if (isOfflineMode(scenario)) {
    const cachedData = readOfflineCache<T>(cacheKey)
    if (cachedData !== null) {
      return cachedData
    }

    throw createMockError('当前处于离线状态，且没有可用缓存。', 'OFFLINE_CACHE_MISS')
  }

  const data = await runMockRequest(loader, scenario)
  if (scenario === 'default') {
    writeOfflineCache(cacheKey, data)
  }
  return data
}

export const fetchHomeResponse = async (scenario: MockScenario = 'default'): Promise<HomeResponse> =>
  runCachedMockRequest(
    'home',
    () =>
      scenario === 'empty'
        ? {
            heroMedia: null,
            watchlist: [],
            recentWatched: [],
            favoriteMedia: [],
          }
        : getHomeResponse(),
    scenario,
  )

export const fetchSearchMedia = async (query: string, scenario: MockScenario = 'default'): Promise<SearchMediaResponse> =>
  runCachedMockRequest(
    `search:${query.trim().toLowerCase()}`,
    () =>
      scenario === 'empty'
        ? {
            query: query.trim(),
            items: [],
            suggestions: query.trim() ? ['沙丘', 'Dune', '沙丘 2'] : undefined,
            pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
          }
        : searchMedia(query),
    scenario,
  )

export const fetchMediaDetailResponse = async (mediaId: string, scenario: MockScenario = 'default'): Promise<MediaDetailResponse> =>
  runCachedMockRequest(`media-detail:${mediaId}`, () => {
    if (!mediaLibrary[mediaId]) {
      throw createMockError('未找到对应的影视条目。', 'NOT_FOUND')
    }

    if (scenario === 'empty') {
      const media = getMediaById(mediaId)
      return {
        media,
        ratings: undefined,
        userState: { libraryStatus: 'none' },
        watchLogs: [],
        shortReview: null,
      }
    }

    return getMediaDetailResponse(mediaId)
  }, scenario)

export const fetchYearRecordsResponse = async (scenario: MockScenario = 'default'): Promise<YearRecordsResponse> =>
  runCachedMockRequest(
    'records:year',
    () =>
      scenario === 'empty'
        ? {
            overview: {
              periodType: 'year',
              periodStart: '2026-01-01T00:00:00.000Z',
              periodEnd: '2026-12-31T23:59:59.999Z',
              watchedMoviesCount: 0,
              watchDurationHours: 0,
              watchedDaysCount: 0,
              averageMonthlyHours: 0,
            },
            topMovies: [],
            trend: {
              periodType: 'month',
              unit: 'hours',
              points: [],
            },
            genrePreferences: [],
          }
        : getYearRecordsResponse(),
    scenario,
  )

export const fetchMonthRecordsResponse = async (scenario: MockScenario = 'default'): Promise<MonthRecordsResponse> =>
  runCachedMockRequest(
    'records:month',
    () =>
      scenario === 'empty'
        ? {
            overview: {
              periodType: 'month',
              periodStart: '2026-02-01T00:00:00.000Z',
              periodEnd: '2026-02-28T23:59:59.999Z',
              watchedMoviesCount: 0,
              watchDurationHours: 0,
              watchedDaysCount: 0,
            },
            topMovies: [],
            weekRhythm: {
              periodStart: '2026-02-24',
              periodEnd: '2026-03-02',
              watchedDates: [],
            },
            genrePreferences: [],
          }
        : getMonthRecordsResponse(),
    scenario,
  )

export const fetchWeekRecordsResponse = async (scenario: MockScenario = 'default'): Promise<WeekRecordsResponse> =>
  runCachedMockRequest(
    'records:week',
    () =>
      scenario === 'empty'
        ? {
            overview: {
              periodType: 'week',
              periodStart: '2026-02-24T00:00:00.000Z',
              periodEnd: '2026-03-02T23:59:59.999Z',
              watchedMoviesCount: 0,
              watchDurationHours: 0,
              watchedDaysCount: 0,
            },
            dailyRecords: [
              { date: '2026-02-24', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
              { date: '2026-02-25', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
              { date: '2026-02-26', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
              { date: '2026-02-27', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
              { date: '2026-02-28', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
              { date: '2026-03-01', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
              { date: '2026-03-02', watchedMoviesCount: 0, watchDurationHours: 0, items: [] },
            ],
          }
        : getWeekRecordsResponse(),
    scenario,
  )
