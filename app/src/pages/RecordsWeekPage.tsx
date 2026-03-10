import { useCallback } from 'react'
import { IonIcon } from '@ionic/react'
import { chevronBackOutline, chevronForwardOutline, shareSocialOutline } from 'ionicons/icons'
import { Link, useSearchParams } from 'react-router-dom'
import PageState from '../components/PageState'
import { fetchWeekRecordsResponse, getPosterTone, resolveMockScenario } from '../data/mockMediaApi'
import { useAsyncData } from '../hooks/useAsyncData'

const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' })

const RecordsWeekPage = () => {
  const [searchParams] = useSearchParams()
  const scenario = resolveMockScenario(searchParams.get('mock'))
  const loadWeekData = useCallback(() => fetchWeekRecordsResponse(scenario), [scenario])
  const { data: weekData, loading, error, reload } = useAsyncData(`records:week:${scenario}`, loadWeekData)
  const isEmpty = !loading && !error && weekData !== null && weekData.overview.watchedMoviesCount === 0 && weekData.dailyRecords.every((item) => item.items.length === 0)

  return (
    <section className="stats-page week-detail-page">
      <header className="stats-detail-nav">
        <Link className="stats-detail-back" to="/records/month" aria-label="返回月详情">
          <IonIcon icon={chevronBackOutline} />
          <span>2月总览</span>
        </Link>
        <button className="icon-btn muted" type="button" aria-label="分享周报">
          <IonIcon icon={shareSocialOutline} />
        </button>
      </header>

      <div className="time-control">
        <button className="icon-btn muted" type="button" aria-label="上一周">
          <IonIcon icon={chevronBackOutline} />
        </button>
        <button className="month-pill" type="button">
          <span>02/24-03/02</span>
        </button>
        <button className="icon-btn muted" type="button" aria-label="下一周">
          <IonIcon icon={chevronForwardOutline} />
        </button>
      </div>

      {loading ? (
        <PageState tone="loading" title="正在加载周详情" description="正在读取本周概览和每日观影记录。" />
      ) : error ? (
        <PageState tone="error" title="周详情加载失败" description={error} actionLabel="重试" onAction={reload} />
      ) : isEmpty ? (
        <PageState tone="empty" title="这一周还没有观影记录" description="本周暂无记录，等你补上第一条观影后再来查看。" />
      ) : weekData ? (
        <>
          <article className="hero-metric">
            <p className="hero-label">WEEK 02/24-03/02</p>
            <div className="hero-row">
              <div className="hero-primary">
                <p className="hero-main">{weekData.overview.watchedMoviesCount}</p>
                <p className="hero-sub-label">已看影片</p>
              </div>
              <div className="hero-secondary">
                <p className="hero-sub">{weekData.overview.watchDurationHours}h</p>
                <p className="hero-sub-label">观影时长</p>
              </div>
            </div>
          </article>

          <div className="quick-grid">
            <article className="quick-card">
              <p>观影天数</p>
              <strong className="week-quick-value">{weekData.overview.watchedDaysCount} 天</strong>
            </article>
            <article className="quick-card dark">
              <p>本周影片</p>
              <strong className="week-quick-value">{weekData.overview.watchedMoviesCount} 部</strong>
            </article>
          </div>

          <section className="week-daily-section">
            <div className="week-day-list">
              {weekData.dailyRecords.map((day) => (
                <article key={day.date} className="week-day-card">
                  <header className="week-day-head">
                    <p>{`${weekdayFormatter.format(new Date(day.date))} ${day.date.slice(5).replace('-', '/')}`}</p>
                    <span>{day.watchedMoviesCount > 0 ? `${day.watchDurationHours}h 总时长` : '无观看'}</span>
                  </header>
                  {day.items.length > 0 ? (
                    <div className="week-day-movie-list">
                      {day.items.map((item) => (
                        <Link
                          key={item.mediaId}
                          className="week-day-movie-item"
                          to={`/detail?movie=${item.mediaId}&from=records-week`}
                          aria-label={`查看${item.title}详情`}
                        >
                          <div className={`week-day-poster ${getPosterTone(item.mediaId)}`} aria-hidden="true" />
                          <div className="week-day-movie-meta">
                            <strong>{item.title}</strong>
                            <p>{`${item.runtimeMinutes}m · ${item.userScore?.toFixed(1) ?? '--'}`}</p>
                          </div>
                          <IonIcon icon={chevronForwardOutline} />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  )
}

export default RecordsWeekPage
