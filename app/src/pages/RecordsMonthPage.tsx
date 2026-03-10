import { useCallback } from 'react'
import { IonIcon } from '@ionic/react'
import { chevronBackOutline, chevronForwardOutline, shareSocialOutline } from 'ionicons/icons'
import { Link, useSearchParams } from 'react-router-dom'
import PageState from '../components/PageState'
import { fetchMonthRecordsResponse, getPosterTone, resolveMockScenario } from '../data/mockMediaApi'
import { useAsyncData } from '../hooks/useAsyncData'

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const weekDates = ['2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']
const formatRankMeta = (movie: { primaryGenre?: string; runtimeMinutes?: number; userScore?: number }) =>
  [movie.primaryGenre, movie.runtimeMinutes ? `${movie.runtimeMinutes} 分钟` : null, movie.userScore ? `评分 ${movie.userScore.toFixed(1)}` : null]
    .filter(Boolean)
    .join(' · ')

const RecordsMonthPage = () => {
  const [searchParams] = useSearchParams()
  const scenario = resolveMockScenario(searchParams.get('mock'))
  const loadMonthData = useCallback(() => fetchMonthRecordsResponse(scenario), [scenario])
  const { data: monthData, loading, error, reload } = useAsyncData(`records:month:${scenario}`, loadMonthData)
  const isEmpty = !loading && !error && monthData !== null && monthData.topMovies.length === 0 && monthData.genrePreferences.length === 0

  return (
    <section className="stats-page month-detail-page">
      <header className="stats-detail-nav">
        <Link className="stats-detail-back" to="/records" aria-label="返回统计页">
          <IonIcon icon={chevronBackOutline} />
          <span>2026年总览</span>
        </Link>
        <button className="icon-btn muted" type="button" aria-label="分享月报">
          <IonIcon icon={shareSocialOutline} />
        </button>
      </header>

      <div className="time-control">
        <button className="icon-btn muted" type="button" aria-label="上个月">
          <IonIcon icon={chevronBackOutline} />
        </button>
        <button className="month-pill" type="button">
          <span>2月</span>
        </button>
        <button className="icon-btn muted" type="button" aria-label="下个月">
          <IonIcon icon={chevronForwardOutline} />
        </button>
      </div>

      {loading ? (
        <PageState tone="loading" title="正在加载月详情" description="正在读取月度概览、TOP3 和本周节奏。" />
      ) : error ? (
        <PageState tone="error" title="月详情加载失败" description={error} actionLabel="重试" onAction={reload} />
      ) : isEmpty ? (
        <PageState tone="empty" title="这个月还没有统计数据" description="本月还没有影片记录，稍后再回来查看。" />
      ) : monthData ? (
        <>
          <article className="hero-metric">
            <p className="hero-label">FEBRUARY 2026</p>
            <div className="hero-row">
              <div className="hero-primary">
                <p className="hero-main">{monthData.overview.watchedMoviesCount}</p>
                <p className="hero-sub-label">已看影片</p>
              </div>
              <div className="hero-secondary">
                <p className="hero-sub">{monthData.overview.watchDurationHours}h</p>
                <p className="hero-sub-label">观影时长</p>
              </div>
            </div>
          </article>

          <section className="movie-section">
            <div className="movie-head">
              <h3>月度TOP3</h3>
            </div>
            <div className="movie-list">
              {monthData.topMovies.map((movie) => (
                <Link
                  key={movie.mediaId}
                  className="movie-rank-item"
                  to={`/detail?movie=${movie.mediaId}&from=records-month`}
                  aria-label={`查看${movie.title}详情`}
                >
                  <div className={`movie-poster ${getPosterTone(movie.mediaId)}`} aria-hidden="true" />
                  <div className="movie-rank-meta">
                    <h4>{`${movie.rank}. ${movie.title}`}</h4>
                    <p>{formatRankMeta(movie)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="quick-grid">
            <article className="quick-card">
              <p>观影天数</p>
              <strong>{monthData.overview.watchedDaysCount} 天</strong>
            </article>
            <article className="quick-card dark">
              <p>本月影片</p>
              <strong>{monthData.overview.watchedMoviesCount} 部</strong>
            </article>
          </div>

          <Link className="panel-card week-rhythm-link" to="/records/week" aria-label="查看本周观影节奏详情">
            <div className="week-rhythm-strip">
              <div className="week-rhythm-meta">
                <p>{`${monthData.weekRhythm.periodStart.slice(5).replace('-', '/')} - ${monthData.weekRhythm.periodEnd.slice(5).replace('-', '/')}`}</p>
                <IonIcon icon={chevronForwardOutline} className="week-rhythm-meta-icon" />
              </div>
              <div className="week-rhythm-days" aria-hidden="true">
                {weekdays.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className={`week-rhythm-day ${monthData.weekRhythm.watchedDates.length > 0 && !monthData.weekRhythm.watchedDates.includes(weekDates[index]) ? 'is-muted' : ''}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          <section className="genre-section">
            <div className="genre-list">
              {monthData.genrePreferences.map((genre) => (
                <div key={genre.genre} className="genre-item">
                  <div className="genre-meta">
                    <p className="genre-name">{genre.genre}</p>
                    <p className="genre-count">{genre.watchedMoviesCount} 部</p>
                  </div>
                  <div className="genre-track">
                    <div className="genre-fill" style={{ width: `${(genre.watchedMoviesCount / monthData.genrePreferences[0].watchedMoviesCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  )
}

export default RecordsMonthPage
