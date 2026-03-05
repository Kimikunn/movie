import { IonIcon } from '@ionic/react'
import { chevronBackOutline, chevronForwardOutline, shareSocialOutline } from 'ionicons/icons'
import { Link } from 'react-router-dom'

const dailyLogs = [
  { week: '周一', date: '02/24', total: '无观看', items: [] },
  {
    week: '周二',
    date: '02/25',
    total: '1.8h 总时长',
    items: [
      { id: 'dune-2', title: '沙丘 2', meta: '106m · 9.2', tone: 'dark' },
      { id: 'anatomy-of-a-fall', title: '坠落的审判', meta: '51m · 9.0', tone: 'charcoal' },
    ],
  },
  { week: '周三', date: '02/26', total: '无观看', items: [] },
  { week: '周四', date: '02/27', total: '无观看', items: [] },
  { week: '周五', date: '02/28', total: '无观看', items: [] },
  { week: '周六', date: '03/01', total: '无观看', items: [] },
  { week: '周日', date: '03/02', total: '无观看', items: [] },
]

const RecordsWeekPage = () => {
  return (
    <section className="stats-page week-detail-page">
      <header className="stats-detail-nav">
        <Link className="stats-detail-back" to="/records/month" aria-label="返回月详情">
          <IonIcon icon={chevronBackOutline} />
          <span>2月总览</span>
        </Link>
        <button className="icon-btn muted" type="button" aria-label="分享周报告">
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

      <article className="hero-metric">
        <p className="hero-label">WEEK 02/24-03/02</p>
        <div className="hero-row">
          <div className="hero-primary">
            <p className="hero-main">2</p>
            <p className="hero-sub-label">已看电影</p>
          </div>
          <div className="hero-secondary">
            <p className="hero-sub">5.3h</p>
            <p className="hero-sub-label">观影时长</p>
          </div>
        </div>
      </article>

      <div className="quick-grid">
        <article className="quick-card">
          <p>观影天数</p>
          <strong className="week-quick-value">1 天</strong>
        </article>
        <article className="quick-card dark">
          <p>本周影片</p>
          <strong className="week-quick-value">2 部</strong>
        </article>
      </div>

      <section className="week-daily-section">
        <div className="week-day-list">
          {dailyLogs.map((day) => (
            <article key={`${day.week}-${day.date}`} className="week-day-card">
              <header className="week-day-head">
                <p>{`${day.week}  ${day.date}`}</p>
                <span>{day.total}</span>
              </header>
              {day.items.length > 0 ? (
                <div className="week-day-movie-list">
                  {day.items.map((item) => (
                    <Link
                      key={item.id}
                      className="week-day-movie-item"
                      to={`/detail?movie=${item.id}&from=records-week`}
                      aria-label={`查看${item.title}详情`}
                    >
                      <div className={`week-day-poster ${item.tone}`} aria-hidden="true" />
                      <div className="week-day-movie-meta">
                        <strong>{item.title}</strong>
                        <p>{item.meta}</p>
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
    </section>
  )
}

export default RecordsWeekPage
