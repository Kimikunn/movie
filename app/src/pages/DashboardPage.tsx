import { useCallback } from 'react'
import { IonIcon } from '@ionic/react'
import { calendarOutline, chevronBackOutline, chevronForwardOutline, shareSocialOutline } from 'ionicons/icons'
import { Link, useSearchParams } from 'react-router-dom'
import PageState from '../components/PageState'
import { fetchYearRecordsResponse, getPosterTone, resolveMockScenario } from '../data/mockMediaApi'
import { useAsyncData } from '../hooks/useAsyncData'

const formatRankMeta = (movie: { primaryGenre?: string; runtimeMinutes?: number; userScore?: number }) =>
  [movie.primaryGenre, movie.runtimeMinutes ? `${movie.runtimeMinutes} 分钟` : null, movie.userScore ? `评分 ${movie.userScore.toFixed(1)}` : null]
    .filter(Boolean)
    .join(' · ')

const DashboardPage = () => {
  const [searchParams] = useSearchParams()
  const scenario = resolveMockScenario(searchParams.get('mock'))
  const loadYearData = useCallback(() => fetchYearRecordsResponse(scenario), [scenario])
  const { data: yearData, loading, error, reload } = useAsyncData(`records:year:${scenario}`, loadYearData)
  const topTrendPoints = yearData?.trend.points.slice(0, 6) ?? []
  const bottomTrendPoints = yearData?.trend.points.slice(6) ?? []
  const isEmpty = !loading && !error && yearData !== null && yearData.topMovies.length === 0 && yearData.genrePreferences.length === 0

  return (
    <section className="stats-page">
      <header className="stats-header">
        <h2>观影档案</h2>
        <button className="icon-btn muted" type="button" aria-label="分享年度报告">
          <IonIcon icon={shareSocialOutline} />
        </button>
      </header>

      <div className="time-control">
        <button className="icon-btn muted" type="button" aria-label="上一周期">
          <IonIcon icon={chevronBackOutline} />
        </button>
        <button className="month-pill" type="button">
          <IonIcon icon={calendarOutline} />
          <span>2026 年</span>
        </button>
        <button className="icon-btn muted" type="button" aria-label="下一周期">
          <IonIcon icon={chevronForwardOutline} />
        </button>
      </div>

      {loading ? (
        <PageState tone="loading" title="正在加载年度统计" description="正在读取年度概览、TOP 榜单和趋势数据。" />
      ) : error ? (
        <PageState tone="error" title="年度统计加载失败" description={error} actionLabel="重试" onAction={reload} />
      ) : isEmpty ? (
        <PageState tone="empty" title="这一年还没有统计数据" description="先新增观影记录，年度概览和榜单才会出现。" />
      ) : yearData ? (
        <>
          <article className="hero-metric">
            <p className="hero-label">YEAR TO DATE</p>
            <div className="hero-row">
              <div className="hero-primary">
                <p className="hero-main">{yearData.overview.watchedMoviesCount}</p>
                <p className="hero-sub-label">已看影片</p>
              </div>
              <div className="hero-secondary">
                <p className="hero-sub">{yearData.overview.watchDurationHours}h</p>
                <p className="hero-sub-label">观影时长</p>
              </div>
            </div>
          </article>

          <section className="movie-section">
            <div className="movie-head">
              <h3>年度TOP5</h3>
            </div>
            <div className="movie-list">
              {yearData.topMovies.map((movie) => (
                <Link
                  key={movie.mediaId}
                  className="movie-rank-item"
                  to={`/detail?movie=${movie.mediaId}&from=records`}
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
              <strong>{yearData.overview.watchedDaysCount} 天</strong>
            </article>
            <article className="quick-card dark">
              <p>月度均时</p>
              <strong>{yearData.overview.averageMonthlyHours?.toFixed(1) ?? '0.0'}h</strong>
            </article>
          </div>

          <Link className="panel-card trend-card trend-card-link" to="/records/month" aria-label="查看月详情页">
            <div className="trend-bars-merged">
              <div className="trend-group past">
                {topTrendPoints.map((item) => (
                  <div key={`past-${item.key}`} className="trend-col">
                    <div className="trend-track">
                      <div className="trend-fill" style={{ height: `${Math.max(20, item.value * 3)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="trend-split" aria-hidden="true" />
              <div className="trend-group future">
                {bottomTrendPoints.map((item) => (
                  <div key={`future-${item.key}`} className="trend-col">
                    <div className="trend-track">
                      <div className="trend-fill" style={{ height: `${Math.max(20, item.value * 3)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="trend-months-merged" aria-hidden="true">
              <div className="trend-month-group past">
                {topTrendPoints.map((item) => (
                  <span key={`past-label-${item.key}`} className="trend-month">
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="trend-split" />
              <div className="trend-month-group future">
                {bottomTrendPoints.map((item) => (
                  <span key={`future-label-${item.key}`} className="trend-month">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          <section className="genre-section">
            <div className="genre-list">
              {yearData.genrePreferences.map((genre) => (
                <div key={genre.genre} className="genre-item">
                  <div className="genre-meta">
                    <p className="genre-name">{genre.genre}</p>
                    <p className="genre-count">{genre.watchedMoviesCount} 部</p>
                  </div>
                  <div className="genre-track">
                    <div style={{ width: `${(genre.watchedMoviesCount / yearData.genrePreferences[0].watchedMoviesCount) * 100}%` }} className="genre-fill" />
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

export default DashboardPage
