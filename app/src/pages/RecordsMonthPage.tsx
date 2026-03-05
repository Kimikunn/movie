import { IonIcon } from '@ionic/react'
import { chevronBackOutline, chevronForwardOutline, shareSocialOutline } from 'ionicons/icons'
import { Link } from 'react-router-dom'

const genres = [
  { name: '剧情', count: 32 },
  { name: '科幻', count: 26 },
  { name: '动画', count: 17 },
]

const topMovies = [
  { id: 'dune-2', title: '沙丘 2', meta: '科幻 · 159分钟 · 评分 9.2', tone: 'dark' },
  { id: 'anatomy-of-a-fall', title: '坠落的审判', meta: '悬疑 · 151分钟 · 评分 9.0', tone: 'charcoal' },
  { id: 'robot-dreams', title: '机器人之梦', meta: '动画 · 102分钟 · 评分 8.8', tone: 'silver' },
]

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const RecordsMonthPage = () => {
  return (
    <section className="stats-page month-detail-page">
      <header className="stats-detail-nav">
        <Link className="stats-detail-back" to="/records" aria-label="返回统计页">
          <IonIcon icon={chevronBackOutline} />
          <span>2026年总览</span>
        </Link>
        <button className="icon-btn muted" type="button" aria-label="分享月报告">
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

      <article className="hero-metric">
        <p className="hero-label">FEBRUARY 2026</p>
        <div className="hero-row">
          <div className="hero-primary">
            <p className="hero-main">11</p>
            <p className="hero-sub-label">已看电影</p>
          </div>
          <div className="hero-secondary">
            <p className="hero-sub">24h</p>
            <p className="hero-sub-label">观影时长</p>
          </div>
        </div>
      </article>

      <section className="movie-section">
        <div className="movie-head">
          <h3>月度TOP3</h3>
        </div>
        <div className="movie-list">
          {topMovies.map((movie, index) => (
            <Link
              key={movie.id}
              className="movie-rank-item"
              to={`/detail?movie=${movie.id}&from=records-month`}
              aria-label={`查看${movie.title}详情`}
            >
              <div className={`movie-poster ${movie.tone}`} aria-hidden="true" />
              <div className="movie-rank-meta">
                <h4>{`${index + 1}. ${movie.title}`}</h4>
                <p>{movie.meta}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="quick-grid">
        <article className="quick-card">
          <p>月均时长</p>
          <strong>2.1h</strong>
        </article>
        <article className="quick-card dark">
          <p>平均评分</p>
          <strong>8.1</strong>
        </article>
      </div>

      <Link className="panel-card week-rhythm-link" to="/records/week" aria-label="查看本周观影节奏详情">
        <div className="week-rhythm-strip">
          <div className="week-rhythm-meta">
            <p>02/24-03/02</p>
            <IonIcon icon={chevronForwardOutline} className="week-rhythm-meta-icon" />
          </div>
          <div className="week-rhythm-days" aria-hidden="true">
            {weekdays.map((label, index) => (
              <span key={`${label}-${index}`} className={`week-rhythm-day ${index === 4 || index === 6 ? 'is-muted' : ''}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <section className="genre-section">
        <div className="genre-list">
          {genres.map((genre) => (
            <div key={genre.name} className="genre-item">
              <div className="genre-meta">
                <p className="genre-name">{genre.name}</p>
                <p className="genre-count">{genre.count} 部</p>
              </div>
              <div className="genre-track">
                <div className="genre-fill" style={{ width: `${(genre.count / genres[0].count) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default RecordsMonthPage
