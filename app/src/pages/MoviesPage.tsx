import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { IonIcon } from '@ionic/react'
import { addOutline, checkmarkOutline, chevronBackOutline, closeOutline, shareSocialOutline } from 'ionicons/icons'
import { Link, useSearchParams } from 'react-router-dom'
import { addWatchLog, getWatchLogsByMovie, updateWatchLog } from '../data/watchLogStore'
import { getShortReviewByMovie, setShortReviewByMovie } from '../data/shortReviewStore'

const defaultWatchLogsByMovie: Record<string, Array<{ watchedAt: string; place: string; mode: string; score: string; note?: string }>> = {
  'dune-2': [
    { watchedAt: '2026-02-25', place: 'IMAX 2D', mode: '影院', score: '9.2' },
    { watchedAt: '2026-03-03', place: '杜比影院', mode: '影院', score: '9.0' },
  ],
  'anatomy-of-a-fall': [{ watchedAt: '2026-02-19', place: '百丽宫影城', mode: '影院', score: '9.0' }],
}

const movieLibrary = {
  'dune-2': {
    title: '沙丘 2',
    subtitle: 'Dune: Part Two',
    metaLine: '2024 · 166分钟 · 科幻 / 冒险',
    region: '地区：中国大陆 / 美国',
    director: '导演：丹尼斯·维伦纽瓦',
    cast: '主演：提莫西·查拉梅 / 赞达亚',
    synopsis: '保罗接受命运，与弗雷曼并肩作战。',
  },
  'anatomy-of-a-fall': {
    title: '坠落的审判',
    subtitle: 'Anatomy of a Fall',
    metaLine: '2023 · 151分钟 · 剧情 / 悬疑',
    region: '地区：法国',
    director: '导演：茹斯汀·特里耶',
    cast: '主演：桑德拉·惠勒 / 斯万·阿劳德',
    synopsis: '一场坠楼案引发审判，婚姻与真相在法庭中被层层剥开。',
  },
  'robot-dreams': {
    title: '机器人之梦',
    subtitle: 'Robot Dreams',
    metaLine: '2023 · 102分钟 · 动画 / 剧情',
    region: '地区：西班牙 / 法国',
    director: '导演：巴勃罗·贝赫尔',
    cast: '主演：动画角色',
    synopsis: '在无对白的城市寓言里，友情与离别被温柔讲述。',
  },
  furiosa: {
    title: '芙莉欧莎',
    subtitle: 'Furiosa: A Mad Max Saga',
    metaLine: '2024 · 148分钟 · 动作 / 冒险',
    region: '地区：澳大利亚 / 美国',
    director: '导演：乔治·米勒',
    cast: '主演：安雅·泰勒-乔伊 / 克里斯·海姆斯沃斯',
    synopsis: '一段在废土世界中求生与复仇的成长旅程。',
  },
  'poor-things': {
    title: '可怜的东西',
    subtitle: 'Poor Things',
    metaLine: '2023 · 141分钟 · 奇幻 / 喜剧',
    region: '地区：英国 / 爱尔兰 / 美国',
    director: '导演：欧格斯·兰斯莫斯',
    cast: '主演：艾玛·斯通 / 马克·鲁法洛',
    synopsis: '用荒诞与黑色幽默，讨论女性成长、自由与自我建构。',
  },
} as const

const viewModes = ['影院', '杜比', 'IMAX', '流媒体', '蓝光']
const today = new Date().toISOString().slice(0, 10)
const defaultReviewByMovie: Record<string, string> = {
  'dune-2': '视听震撼，节奏流畅，第二部真正立住世界观。',
  'anatomy-of-a-fall': '表演极其克制，法庭戏张力很足。',
  'robot-dreams': '无对白却很有共鸣，后劲很强。',
  furiosa: '动作设计凌厉，节奏推进非常硬核。',
  'poor-things': '设定大胆，视觉风格统一且鲜明。',
}

const formatDate = (value: string) => value.replace(/-/g, '/')

const MoviesPage = () => {
  const [searchParams] = useSearchParams()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const sheetHost =
    typeof document !== 'undefined' ? (document.querySelector('.phone-canvas') as HTMLElement | null) : null
  const [watchedAt, setWatchedAt] = useState(today)
  const [place, setPlace] = useState('')
  const [mode, setMode] = useState(viewModes[0])
  const [score, setScore] = useState('')
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [isReviewEditing, setIsReviewEditing] = useState(false)
  const [reviewDraft, setReviewDraft] = useState('')
  const [saveError, setSaveError] = useState('')

  const movieId = (searchParams.get('movie') ?? '').trim()
  const from = (searchParams.get('from') ?? '').trim()
  const keyword = (searchParams.get('q') ?? '').trim()
  const activeMovieId = movieId && movieId in movieLibrary ? movieId : 'dune-2'
  const currentMovie = movieLibrary[activeMovieId as keyof typeof movieLibrary]
  const storedReview = getShortReviewByMovie(activeMovieId)
  const baseReview = storedReview || defaultReviewByMovie[activeMovieId] || ''
  const currentReview = baseReview || '暂无短评，点击右上角“修改”添加。'

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

  const userLogs = getWatchLogsByMovie(activeMovieId).map((item) => ({
    id: item.id,
    watchedAt: item.watchedAt,
    place: item.place,
    mode: item.mode,
    score: item.score,
    note: item.note,
    source: 'user' as const,
  }))

  const seedLogs = (defaultWatchLogsByMovie[activeMovieId] ?? []).map((item) => ({
    ...item,
    source: 'seed' as const,
  }))

  const unique = new Set(userLogs.map((item) => `${item.watchedAt}-${item.place}`))
  const mergedWatchLogs = [...userLogs, ...seedLogs.filter((item) => !unique.has(`${item.watchedAt}-${item.place}`))]
  const isEditingLog = editingLogId !== null

  const resetAddForm = () => {
    setWatchedAt(today)
    setPlace('')
    setMode(viewModes[0])
    setScore('')
    setEditingLogId(null)
    setSaveError('')
  }

  const openAddSheet = () => {
    resetAddForm()
    setIsAddOpen(true)
  }

  const closeAddSheet = () => {
    setIsAddOpen(false)
    setEditingLogId(null)
    setSaveError('')
  }

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!watchedAt || !place.trim() || !score.trim()) {
      setSaveError('请补全观影日期、地点和评分。')
      return
    }

    if (editingLogId) {
      updateWatchLog(editingLogId, {
        watchedAt,
        place: place.trim(),
        mode,
        score: score.trim(),
      })
    } else {
      addWatchLog({
        movieId: activeMovieId,
        watchedAt,
        place: place.trim(),
        mode,
        score: score.trim(),
      })
    }

    closeAddSheet()
  }

  const openEditSheet = (log: { id: string; watchedAt: string; place: string; mode: string; score: string }) => {
    setWatchedAt(log.watchedAt)
    setPlace(log.place)
    setMode(log.mode)
    setScore(log.score)
    setEditingLogId(log.id)
    setSaveError('')
    setIsAddOpen(true)
  }

  const handleLogActivate = (log: { id?: string; watchedAt: string; place: string; mode: string; score: string; source: 'user' | 'seed' }) => {
    if (log.source !== 'user' || !log.id) {
      return
    }
    openEditSheet({
      id: log.id,
      watchedAt: log.watchedAt,
      place: log.place,
      mode: log.mode,
      score: log.score,
    })
  }

  const openReviewEditor = () => {
    setReviewDraft(baseReview)
    setIsReviewEditing(true)
  }

  const cancelReviewEditor = () => {
    setReviewDraft('')
    setIsReviewEditing(false)
  }

  const saveReview = () => {
    setShortReviewByMovie(activeMovieId, reviewDraft.trim())
    setIsReviewEditing(false)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareTitle = `${currentMovie.title} | 观影档案`
    const shareText = `${currentMovie.title} · ${currentMovie.metaLine}`

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

  const handleScoreRangeChange = (value: string) => {
    setScore(value)
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
  const scoreProgress = Math.min(100, Math.max(0, (Number.parseFloat(scoreDisplay) || 0) * 10))

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

      <article className="movie-hero">
        <div className="poster-block" />
        <div className="movie-meta">
          <div className="hero-top">
            <p className="status-pill">已观看</p>
          </div>
          <h3>{currentMovie.title}</h3>
          <p className="movie-subtitle">{currentMovie.subtitle}</p>
          <p>{currentMovie.metaLine}</p>
        </div>
      </article>

      <article className="my-score-card">
        <div>
          <p>我的评分</p>
          <strong>9.2/10</strong>
        </div>
        <div className="divider" />
        <div>
          <p>平台均分</p>
          <strong>8.5/10</strong>
        </div>
      </article>

      <section className="ratings-box">
        <div className="ratings-top-row">
          <article className="score-card score-douban">
            <p className="score-label">豆瓣</p>
            <p className="score-note">262,791人评价</p>
            <p className="douban-line">
              <strong>8.3</strong>
              <span>★★★★☆</span>
            </p>
          </article>

          <article className="score-card score-mtc">
            <div className="mtc-badge">79</div>
            <div className="mtc-meta">
              <p className="score-label">Metacritic</p>
              <strong>Generally Favorable</strong>
            </div>
          </article>
        </div>

        <div className="ratings-mid-row">
          <article className="score-card score-tmdb">
            <p className="score-label">TMDB</p>
            <div className="tmdb-ring">
              <span>84%</span>
            </div>
          </article>

          <article className="score-card score-imdb">
            <p className="score-label">IMDb</p>
            <p className="imdb-line">
              <span aria-hidden="true">★</span>
              <strong>8.5/10</strong>
            </p>
            <p className="score-note">3.2M</p>
          </article>
        </div>

        <article className="score-card score-rt">
          <p className="score-label">烂番茄</p>
          <div className="rt-grid">
            <div className="rt-cell">
              <span>新鲜度</span>
              <strong>92/100</strong>
            </div>
            <div className="rt-cell">
              <span>爆米花</span>
              <strong>88/100</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="synopsis-section">
        <h3>影片简介</h3>
        <article className="synopsis-card">
          <div className="synopsis-meta-row">
            <div className="synopsis-meta-col">
              <p>{currentMovie.region}</p>
              <p>{currentMovie.director}</p>
              <p>{currentMovie.cast}</p>
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
          <button className="add-log-btn" type="button" onClick={openAddSheet} aria-label="添加观影记录">
            <IonIcon icon={addOutline} />
            <span>添加</span>
          </button>
        </div>
        <div className="log-list">
          {mergedWatchLogs.length === 0 ? (
            <div className="log-empty">还没有记录，点击右上角“添加”创建第一条。</div>
          ) : (
            mergedWatchLogs.map((log, index) => (
              <div key={`${log.watchedAt}-${log.place}-${index}`} className="log-entry">
                <article
                  className={`log-card ${log.source === 'user' ? 'is-clickable' : ''}`}
                  role={log.source === 'user' ? 'button' : undefined}
                  tabIndex={log.source === 'user' ? 0 : undefined}
                  aria-label={log.source === 'user' ? '点击修改这条观影记录' : undefined}
                  onClick={() => handleLogActivate(log)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleLogActivate(log)
                    }
                  }}
                >
                  <div className="log-row log-row-primary">
                    <span className="log-primary">{formatDate(log.watchedAt)}</span>
                    <strong className="log-primary">{log.place}</strong>
                  </div>
                  <div className="log-row">
                    <span>观影方式</span>
                    <strong className="log-value">{log.mode}</strong>
                  </div>
                  <div className="log-row">
                    <span>我的评分</span>
                    <strong className="log-score">{log.score}</strong>
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
          className={`review-card ${isReviewEditing ? '' : 'is-clickable'}`.trim()}
          role={isReviewEditing ? undefined : 'button'}
          tabIndex={isReviewEditing ? undefined : 0}
          aria-label={isReviewEditing ? undefined : '点击修改短评'}
          onClick={isReviewEditing ? undefined : openReviewEditor}
          onKeyDown={
            isReviewEditing
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
                <button type="button" className="review-action-btn solid" onClick={saveReview}>
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
                      <span>观影地点与方式</span>
                      <div className="create-place-mode">
                        <input
                          type="text"
                          value={place}
                          onChange={(event) => setPlace(event.target.value)}
                          placeholder="例如：万达影城 IMAX 厅 / Netflix"
                        />
                        <div className="mode-segment" role="radiogroup" aria-label="观影方式">
                          {viewModes.map((item) => (
                            <button
                              key={item}
                              type="button"
                              role="radio"
                              aria-checked={mode === item}
                              className={`mode-segment-btn ${mode === item ? 'is-active' : ''}`}
                              onClick={() => setMode(item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <label className="create-field">
                      <span>我的评分（0-10）</span>
                      <div className="score-combo">
                        <div className="score-track-wrap">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={scoreDisplay}
                            onChange={(event) => handleScoreRangeChange(event.target.value)}
                            style={{ '--score-progress': scoreProgress } as CSSProperties}
                            aria-label="评分滑杆"
                          />
                          <span className="score-live-value">{scoreDisplay}</span>
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

                    <button type="submit" className="create-submit-btn">
                      <IonIcon icon={checkmarkOutline} />
                      <span>{isEditingLog ? '保存修改' : '保存记录'}</span>
                    </button>
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


