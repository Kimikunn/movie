import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { IonIcon, IonRange } from '@ionic/react'
import type { RangeCustomEvent } from '@ionic/react'
import { addOutline, bookmarkOutline, checkmarkOutline, chevronBackOutline, closeOutline, shareSocialOutline } from 'ionicons/icons'
import { Link, useSearchParams } from 'react-router-dom'
import PageState from '../components/PageState'
import { defaultSeedWatchLogsByMediaId, fetchMediaDetailResponse, resolveMockScenario } from '../data/mockMediaApi'
import { useAsyncData } from '../hooks/useAsyncData'
import { useOfflineStatus } from '../hooks/useOfflineStatus'
import {
  addWatchLog,
  deleteWatchLog,
  getDeletedSeedWatchLogKeysByMovie,
  getWatchLogsByMovie,
  markSeedWatchLogDeleted,
  updateWatchLog,
} from '../data/watchLogStore'
import { getShortReviewByMovie, setShortReviewByMovie } from '../data/shortReviewStore'
import { isMediaWishlisted, setMediaWishlisted } from '../data/wishlistStore'

const viewModes = ['影院', '流媒体', '蓝光/碟片', '其他'] as const
type WatchMethodOption = (typeof viewModes)[number]
type EditableLog = {
  id: string
  watchedAt: string
  watchMethod: string
  score: number
  source: 'user' | 'seed'
  overrideKey?: string
}
const today = new Date().toISOString().slice(0, 10)

const formatDate = (value: string) => value.replace(/-/g, '/')
const formatScore = (value: number | string) => (typeof value === 'number' ? value.toFixed(1) : value)
const formatMetaLine = (year: number, runtimeMinutes: number, genres: string[]) => [year, `${runtimeMinutes}分钟`, genres.join(' / ')].join(' · ')
const formatRegion = (countries: string[]) => `地区：${countries.join(' / ')}`
const formatDirector = (directors: string[]) => `导演：${directors.join(' / ')}`
const formatCast = (cast: string[]) => `主演：${cast.join(' / ')}`
const formatDoubanStars = (stars?: number) => (stars ? `${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 5 - stars))}` : '--')
const formatRatingCount = (count?: number) => (typeof count === 'number' ? `${count.toLocaleString('en-US')}人评价` : '--')
const formatImdbCount = (count?: number) => {
  if (typeof count !== 'number') {
    return '--'
  }
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
const formatPercent = (value?: number) => (typeof value === 'number' ? `${value}%` : '--')
const formatScoreOutOfTen = (value?: number) => (typeof value === 'number' ? `${value.toFixed(1)}/10` : '--')

const parseDateValue = (value: string) => {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const MoviesPage = () => {
  const [searchParams] = useSearchParams()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const sheetHost =
    typeof document !== 'undefined' ? (document.querySelector('.phone-canvas') as HTMLElement | null) : null
  const [watchedAt, setWatchedAt] = useState(today)
  const [watchMethod, setWatchMethod] = useState<WatchMethodOption>(viewModes[0])
  const [score, setScore] = useState('')
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editingSeedKey, setEditingSeedKey] = useState<string | null>(null)
  const [isReviewEditing, setIsReviewEditing] = useState(false)
  const [reviewDraft, setReviewDraft] = useState('')
  const [saveError, setSaveError] = useState('')
  const [, setWishlistVersion] = useState(0)

  const movieId = (searchParams.get('movie') ?? '').trim()
  const from = (searchParams.get('from') ?? '').trim()
  const keyword = (searchParams.get('q') ?? '').trim()
  const scenario = resolveMockScenario(searchParams.get('mock'))
  const isOfflineMode = useOfflineStatus(scenario === 'offline')
  const requestedMovieId = movieId || 'dune-2'
  const loadDetail = useCallback(() => fetchMediaDetailResponse(requestedMovieId, scenario), [requestedMovieId, scenario])
  const { data: loadedDetail, loading: detailLoading, error: detailError, reload: reloadDetail } = useAsyncData(
    `detail:${scenario}:${requestedMovieId}`,
    loadDetail,
  )
  const activeMovieId = loadedDetail?.media.id ?? requestedMovieId

  const backTarget =
    from === 'search' || from === 'create'
      ? keyword
        ? `/search?q=${encodeURIComponent(keyword)}`
        : '/search?mode=initial'
      : from === 'records-week'
        ? '/records/week'
        : from === 'records-month'
          ? '/records/month'
      : from === 'records'
        ? '/records'
        : '/home'

  if (detailLoading && !loadedDetail) {
    return (
      <section className="detail-page">
        <header className="detail-nav">
          <Link className="icon-btn muted" to={backTarget} aria-label="返回">
            <IonIcon icon={chevronBackOutline} />
          </Link>
          <span />
        </header>
        <PageState tone="loading" title="正在加载详情" description="正在读取影片信息、平台评分和个人记录。" />
      </section>
    )
  }

  if (detailError || !loadedDetail) {
    return (
      <section className="detail-page">
        <header className="detail-nav">
          <Link className="icon-btn muted" to={backTarget} aria-label="返回">
            <IonIcon icon={chevronBackOutline} />
          </Link>
          <span />
        </header>
        <PageState tone="error" title="详情加载失败" description={detailError ?? '未找到对应的影视条目。'} actionLabel="重试" onAction={reloadDetail} />
      </section>
    )
  }

  const currentDetail = loadedDetail
  const seedWatchLogs = scenario === 'empty' ? [] : (defaultSeedWatchLogsByMediaId[activeMovieId] ?? [])
  const currentMovie = currentDetail.media
  const currentMovieScores = currentDetail.ratings
  const storedReview = getShortReviewByMovie(activeMovieId)
  const baseReview = storedReview !== undefined ? storedReview : (currentDetail.shortReview?.content ?? '')
  const currentReview = baseReview || '暂无短评，点击此处添加。'
  const metaLine = formatMetaLine(currentMovie.year, currentMovie.runtimeMinutes, currentMovie.genres)
  const regionLine = formatRegion(currentMovie.countries)
  const directorLine = formatDirector(currentMovie.directors)
  const castLine = formatCast(currentMovie.cast)

  const userLogsSource = getWatchLogsByMovie(activeMovieId)
  const userLogs = userLogsSource.map((item) => ({
    id: item.id,
    watchedAt: item.watchedAt,
    watchMethod: item.watchMethod,
    score: item.score,
    note: item.note,
    overrideKey: item.overrideKey,
    source: 'user' as const,
  }))

  const getWatchLogKey = (log: { watchedAt: string; watchMethod: string }) => `${log.watchedAt}-${log.watchMethod}`
  const getSeedWatchLogKey = (log: { watchedOn: string; watchMethod: string }) => `${log.watchedOn}-${log.watchMethod}`

  const uniqueUserLogs = (() => {
    const seen = new Set<string>()
    return userLogs.filter((item) => {
      const dedupeKey = item.overrideKey ?? getWatchLogKey(item)
      if (seen.has(dedupeKey)) {
        return false
      }
      seen.add(dedupeKey)
      return true
    })
  })()

  const deletedSeedKeys = new Set(getDeletedSeedWatchLogKeysByMovie(activeMovieId))
  const seedLogs = seedWatchLogs.map((item) => ({
    id: `seed:${activeMovieId}:${getSeedWatchLogKey(item)}`,
    watchedAt: item.watchedOn,
    watchMethod: item.watchMethod,
    score: item.userScore,
    note: item.note,
    source: 'seed' as const,
  }))

  const unique = new Set(uniqueUserLogs.map((item) => item.overrideKey ?? getWatchLogKey(item)))
  const mergedWatchLogs = [
    ...uniqueUserLogs,
    ...seedLogs.filter((item) => {
      const seedKey = getWatchLogKey(item)
      return !unique.has(seedKey) && !deletedSeedKeys.has(seedKey)
    }),
  ]
  const isEditingLog = editingLogId !== null
  const defaultWishlist = currentDetail.userState.libraryStatus === 'wishlist'
  const isWishlisted = isMediaWishlisted(activeMovieId, defaultWishlist)
  const effectiveLibraryStatus = mergedWatchLogs.length > 0 ? 'watched' : isWishlisted ? 'wishlist' : 'none'
  const statusLabel = effectiveLibraryStatus === 'watched' ? '已观看' : effectiveLibraryStatus === 'wishlist' ? '待看' : '未记录'
  const latestUserScore = [...userLogsSource]
    .sort((left, right) => right.createdAt - left.createdAt)[0]
    ?.score
  const latestSeedScore = [...seedWatchLogs]
    .sort((left, right) => parseDateValue(right.watchedOn) - parseDateValue(left.watchedOn))[0]
    ?.userScore
  const currentMyScore = latestUserScore ?? latestSeedScore ?? currentMovieScores?.platformAverageScore ?? 0

  const resetAddForm = () => {
    setWatchedAt(today)
    setWatchMethod(viewModes[0])
    setScore('')
    setEditingLogId(null)
    setEditingSeedKey(null)
    setSaveError('')
  }

  const openAddSheet = () => {
    if (isOfflineMode) {
      return
    }
    resetAddForm()
    setIsAddOpen(true)
  }

  const closeAddSheet = () => {
    setIsAddOpen(false)
    setEditingLogId(null)
    setEditingSeedKey(null)
    setSaveError('')
  }

  const handleWishlistToggle = () => {
    if (isOfflineMode || effectiveLibraryStatus === 'watched') {
      return
    }

    setMediaWishlisted(activeMovieId, !isWishlisted, defaultWishlist)
    setWishlistVersion((value) => value + 1)
  }

  const handleDeleteLog = () => {
    if (isOfflineMode) {
      setSaveError('当前离线，暂时不能删除观影记录。')
      return
    }
    if (!isEditingLog || !editingLogId) {
      return
    }

    if (editingLogId.startsWith('seed:')) {
      if (editingSeedKey) {
        markSeedWatchLogDeleted(activeMovieId, editingSeedKey)
      }
      closeAddSheet()
      return
    }

    const didDelete = deleteWatchLog(editingLogId)
    if (!didDelete) {
      setSaveError('删除失败，请稍后重试。')
      return
    }

    if (editingSeedKey) {
      markSeedWatchLogDeleted(activeMovieId, editingSeedKey)
    }

    closeAddSheet()
  }

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isOfflineMode) {
      setSaveError('当前离线，暂时不能保存观影记录。')
      return
    }
    if (!watchedAt || !score.trim()) {
      setSaveError('请补全观影日期和评分。')
      return
    }

    const nextScore = Number.parseFloat(score)
    if (!Number.isFinite(nextScore)) {
      setSaveError('请输入有效评分。')
      return
    }

    if (editingLogId && !editingLogId.startsWith('seed:')) {
      updateWatchLog(editingLogId, {
        watchedAt,
        watchMethod,
        score: nextScore,
      })
    } else if (editingSeedKey) {
      const existingOverride = userLogsSource.find((item) => item.overrideKey === editingSeedKey)
      if (existingOverride) {
        updateWatchLog(existingOverride.id, {
          watchedAt,
          watchMethod,
          score: nextScore,
          overrideKey: editingSeedKey,
        })
      } else {
        addWatchLog({
          movieId: activeMovieId,
          watchedAt,
          watchMethod,
          score: nextScore,
          overrideKey: editingSeedKey,
        })
      }
    } else {
      addWatchLog({
        movieId: activeMovieId,
        watchedAt,
        watchMethod,
        score: nextScore,
      })
    }

    setMediaWishlisted(activeMovieId, false, defaultWishlist)
    setWishlistVersion((value) => value + 1)

    closeAddSheet()
  }

  const openEditSheet = (log: EditableLog) => {
    setWatchedAt(log.watchedAt)
    setWatchMethod(viewModes.includes(log.watchMethod as WatchMethodOption) ? (log.watchMethod as WatchMethodOption) : '其他')
    setScore(log.score.toString())
    setEditingLogId(log.id)
    setEditingSeedKey(log.source === 'seed' ? getWatchLogKey(log) : (log.overrideKey ?? null))
    setSaveError('')
    setIsAddOpen(true)
  }

  const handleLogActivate = (log: EditableLog) => {
    if (isOfflineMode) {
      return
    }
    if (!log.id) {
      return
    }
    openEditSheet({
      id: log.id,
      watchedAt: log.watchedAt,
      watchMethod: log.watchMethod,
      score: log.score,
      source: log.source,
      overrideKey: log.overrideKey,
    })
  }

  const openReviewEditor = () => {
    if (isOfflineMode) {
      return
    }
    setReviewDraft(baseReview)
    setIsReviewEditing(true)
  }

  const cancelReviewEditor = () => {
    setReviewDraft('')
    setIsReviewEditing(false)
  }

  const saveReview = () => {
    if (isOfflineMode) {
      return
    }
    setShortReviewByMovie(activeMovieId, reviewDraft.trim())
    setIsReviewEditing(false)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareTitle = `${currentMovie.title} | 观影档案`
    const shareText = `${currentMovie.title} · ${metaLine}`

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        return
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
    }

    window.prompt('复制链接进行分享', shareUrl)
  }

  const handleScoreRangeChange = (event: RangeCustomEvent) => {
    const value = event.detail.value
    const next = typeof value === 'number' ? value : Number.parseFloat(String(value ?? 0))
    if (!Number.isFinite(next)) {
      return
    }
    setScore(next.toFixed(1))
  }

  const handleScoreInputChange = (value: string) => {
    if (value === '') {
      setScore('')
      return
    }
    const next = Number.parseFloat(value)
    if (!Number.isFinite(next)) {
      return
    }
    const clamped = Math.min(10, Math.max(0, next))
    setScore(clamped.toString())
  }

  const scoreDisplay = score.trim() ? score : '0'
  const scoreValue = Number.parseFloat(scoreDisplay) || 0

  return (
    <section className="detail-page">
      <header className="detail-nav">
        <Link className="icon-btn muted" to={backTarget} aria-label="返回">
          <IonIcon icon={chevronBackOutline} />
        </Link>
        <button className="icon-btn muted" type="button" aria-label="分享" onClick={handleShare}>
          <IonIcon icon={shareSocialOutline} />
        </button>
      </header>

      {isOfflineMode ? <p className="page-inline-notice">当前离线，仅可查看已缓存内容；新增、修改、删除观影记录和保存短评需联网。</p> : null}

      <article className="movie-hero">
        <div className="poster-block" />
        <div className="movie-meta">
          <div className="hero-top">
            <p className="status-pill">{statusLabel}</p>
            {effectiveLibraryStatus !== 'watched' ? (
              <button
                className={`wishlist-btn ${isWishlisted ? 'is-active' : ''}`.trim()}
                type="button"
                onClick={handleWishlistToggle}
                disabled={isOfflineMode}
                aria-label={isWishlisted ? '移出待看清单' : '加入待看清单'}
              >
                <IonIcon icon={isWishlisted ? checkmarkOutline : bookmarkOutline} />
                <span>{isWishlisted ? '移出待看' : '加入待看'}</span>
              </button>
            ) : null}
          </div>
          <h3>{currentMovie.title}</h3>
          <p className="movie-subtitle">{currentMovie.originalTitle}</p>
          <p>{metaLine}</p>
        </div>
      </article>

      <article className="my-score-card">
        <div>
          <p>我的评分</p>
          <strong>{formatScore(currentMyScore)}/10</strong>
        </div>
        <div className="divider" />
        <div>
          <p>平台均分</p>
          <strong>{currentMovieScores?.platformAverageScore?.toFixed(1) ?? '--'}/10</strong>
        </div>
      </article>

      <section className="ratings-box">
        <div className="ratings-top-row">
          <article className="score-card score-douban">
            <p className="score-label">豆瓣</p>
            <p className="score-note">{formatRatingCount(currentMovieScores?.douban?.count)}</p>
            <p className="douban-line">
              <strong>{currentMovieScores?.douban?.score?.toFixed(1) ?? '--'}</strong>
              <span>{formatDoubanStars(currentMovieScores?.douban?.stars)}</span>
            </p>
          </article>

          <article className="score-card score-mtc">
            <div className="mtc-badge">{currentMovieScores?.metacritic?.score ?? '--'}</div>
            <div className="mtc-meta">
              <p className="score-label">Metacritic</p>
              <strong>{currentMovieScores?.metacritic?.summary ?? '--'}</strong>
            </div>
          </article>
        </div>

        <div className="ratings-mid-row">
          <article className="score-card score-tmdb">
            <p className="score-label">TMDB</p>
            <div className="tmdb-ring">
              <span>{formatPercent(currentMovieScores?.tmdb?.score)}</span>
            </div>
          </article>

          <article className="score-card score-imdb">
            <p className="score-label">IMDb</p>
            <p className="imdb-line">
              <span aria-hidden="true">★</span>
              <strong>{formatScoreOutOfTen(currentMovieScores?.imdb?.score)}</strong>
            </p>
            <p className="score-note">{formatImdbCount(currentMovieScores?.imdb?.count)}</p>
          </article>
        </div>

        <article className="score-card score-rt">
          <p className="score-label">烂番茄</p>
          <div className="rt-grid">
            <div className="rt-cell">
              <span>新鲜度</span>
              <strong>{formatPercent(currentMovieScores?.rottenTomatoes?.criticsScore)}</strong>
            </div>
            <div className="rt-cell">
              <span>爆米花</span>
              <strong>{formatPercent(currentMovieScores?.rottenTomatoes?.audienceScore)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="synopsis-section">
        <h3>影片简介</h3>
        <article className="synopsis-card">
          <div className="synopsis-meta-row">
            <div className="synopsis-meta-col">
              <p>{regionLine}</p>
              <p>{directorLine}</p>
              <p>{castLine}</p>
            </div>
            <div className="director-photo" aria-hidden="true" />
          </div>
          <div className="synopsis-divider" />
          <p className="synopsis-label">剧情简介</p>
          <p className="synopsis-text">{currentMovie.synopsis}</p>
        </article>
      </section>

      <section className="watch-log-section">
        <div className="panel-head">
          <h3>观影记录</h3>
          <button className="add-log-btn" type="button" onClick={openAddSheet} aria-label="添加观影记录" disabled={isOfflineMode}>
            <IonIcon icon={addOutline} />
            <span>添加</span>
          </button>
        </div>
        <div className="log-list">
          {mergedWatchLogs.length === 0 ? (
            <div className="log-empty">还没有记录，点击右上角“添加”创建第一条。</div>
          ) : (
            mergedWatchLogs.map((log, index) => (
              <div key={`${log.watchedAt}-${log.watchMethod}-${index}`} className="log-entry">
                <article
                  className={`log-card ${isOfflineMode ? '' : 'is-clickable'}`.trim()}
                  role={isOfflineMode ? undefined : 'button'}
                  tabIndex={isOfflineMode ? undefined : 0}
                  aria-label={isOfflineMode ? undefined : '点击修改这条观影记录'}
                  onClick={isOfflineMode ? undefined : () => handleLogActivate(log)}
                  onKeyDown={
                    isOfflineMode
                      ? undefined
                      : (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleLogActivate(log)
                          }
                        }
                  }
                >
                  <div className="log-row log-row-primary">
                    <span className="log-primary">{formatDate(log.watchedAt)}</span>
                    <strong className="log-primary">{log.watchMethod}</strong>
                  </div>
                  <div className="log-row">
                    <span>我的评分</span>
                    <strong className="log-score">{formatScore(log.score)}</strong>
                  </div>
                  {log.note ? (
                    <div className="log-row">
                      <span>备注</span>
                      <strong className="log-value">{log.note}</strong>
                    </div>
                  ) : null}
                </article>
                {index < mergedWatchLogs.length - 1 ? <div className="log-separator" aria-hidden="true" /> : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="review-section">
        <div className="panel-head">
          <h3>我的短评</h3>
        </div>
        <article
          className={`review-card ${isReviewEditing || isOfflineMode ? '' : 'is-clickable'}`.trim()}
          role={isReviewEditing || isOfflineMode ? undefined : 'button'}
          tabIndex={isReviewEditing || isOfflineMode ? undefined : 0}
          aria-label={isReviewEditing || isOfflineMode ? undefined : '点击修改短评'}
          onClick={isReviewEditing || isOfflineMode ? undefined : openReviewEditor}
          onKeyDown={
            isReviewEditing || isOfflineMode
              ? undefined
              : (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openReviewEditor()
                  }
                }
          }
        >
          {isReviewEditing ? (
            <div className="review-editor">
              <textarea
                value={reviewDraft}
                onChange={(event) => setReviewDraft(event.target.value)}
                placeholder="写下你的短评"
                aria-label="短评输入框"
              />
              <div className="review-editor-actions">
                <button type="button" className="review-action-btn ghost" onClick={cancelReviewEditor}>
                  取消
                </button>
                <button type="button" className="review-action-btn solid" onClick={saveReview} disabled={isOfflineMode}>
                  保存
                </button>
              </div>
            </div>
          ) : (
            <p>{currentReview}</p>
          )}
        </article>
      </section>

      {isAddOpen && sheetHost
        ? createPortal(
            <div className="in-app-sheet-layer" role="presentation">
              <button type="button" className="in-app-sheet-backdrop" aria-label="关闭新增弹窗" onClick={closeAddSheet} />
              <section className="in-app-sheet" role="dialog" aria-modal="true" aria-label={isEditingLog ? '修改观影记录' : '新增观影记录'}>
                <div className="in-app-sheet-handle" aria-hidden="true" />
                <div className="add-record-sheet">
                  <header className="add-record-sheet-head">
                    <div>
                      <p>{isEditingLog ? '修改记录' : '新增记录'}</p>
                      <h3>{currentMovie.title}</h3>
                    </div>
                    <button type="button" className="icon-btn muted" aria-label="关闭新增弹窗" onClick={closeAddSheet}>
                      <IonIcon icon={closeOutline} />
                    </button>
                  </header>

                  <form className="create-form" onSubmit={handleAddSubmit}>
                    <label className="create-field">
                      <span>观影日期</span>
                      <input type="date" value={watchedAt} onChange={(event) => setWatchedAt(event.target.value)} />
                    </label>

                    <div className="create-field create-field-stack">
                      <span>观影方式</span>
                      <div className="mode-segment" role="radiogroup" aria-label="观影方式">
                        {viewModes.map((item) => (
                          <button
                            key={item}
                            type="button"
                            role="radio"
                            aria-checked={watchMethod === item}
                            className={`mode-segment-btn ${watchMethod === item ? 'is-active' : ''}`}
                            onClick={() => setWatchMethod(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="create-field">
                      <span>我的评分（0-10）</span>
                      <div className="score-combo">
                        <div className="score-track-wrap">
                          <IonRange
                            className="score-range"
                            min={0}
                            max={10}
                            step={0.1}
                            value={scoreValue}
                            onIonInput={handleScoreRangeChange}
                            aria-label="评分滑杆"
                          />
                        </div>
                        <input
                          className="score-number-input"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={score}
                          onChange={(event) => handleScoreInputChange(event.target.value)}
                          placeholder="8.8"
                          aria-label="评分数值输入"
                        />
                      </div>
                    </label>

                    {saveError ? <p className="create-error">{saveError}</p> : null}
                    {isOfflineMode ? <p className="create-error">当前离线，暂时不能保存或删除观影记录。</p> : null}

                    <div className="create-form-actions">
                      <button type="submit" className="create-submit-btn" disabled={isOfflineMode}>
                        <IonIcon icon={checkmarkOutline} />
                        <span>{isEditingLog ? '保存修改' : '保存记录'}</span>
                      </button>
                      {isEditingLog && editingLogId ? (
                        <button type="button" className="create-delete-btn" onClick={handleDeleteLog} disabled={isOfflineMode}>
                          删除记录
                        </button>
                      ) : null}
                    </div>
                  </form>
                </div>
              </section>
            </div>,
            sheetHost,
          )
        : null}
    </section>
  )
}

export default MoviesPage


