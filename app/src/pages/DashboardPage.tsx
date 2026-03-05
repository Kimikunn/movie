import { IonIcon } from '@ionic/react'
import { calendarOutline, chevronBackOutline, chevronForwardOutline, shareSocialOutline } from 'ionicons/icons'
import { Link } from 'react-router-dom'

const trendPast = [
  { month: '1', value: 56 },
  { month: '2', value: 46 },
  { month: '3', value: 72 },
  { month: '4', value: 52 },
  { month: '5', value: 100 },
  { month: '6', value: 90 },
]

const trendFuture = [
  { month: '7', value: 42 },
  { month: '8', value: 38 },
  { month: '9', value: 46 },
  { month: '10', value: 35 },
  { month: '11', value: 40 },
  { month: '12', value: 32 },
]

const genres = [
  { name: '剧情', count: 32 },
  { name: '科幻', count: 24 },
  { name: '动画', count: 17 },
  { name: '悬疑', count: 14 },
  { name: '纪录', count: 11 },
]

const topMovies = [
  { id: 'dune-2', title: '沙丘 2', genre: '科幻', duration: 166, score: '9.2', tone: 'dark' },
  { id: 'anatomy-of-a-fall', title: '坠落的审判', genre: '剧情', duration: 151, score: '9.0', tone: 'charcoal' },
  { id: 'robot-dreams', title: '机器人之梦', genre: '动画', duration: 102, score: '8.8', tone: 'silver' },
  { id: 'furiosa', title: '芙莉欧莎', genre: '动作', duration: 148, score: '8.7', tone: 'dark' },
  { id: 'poor-things', title: '可怜的东西', genre: '奇幻', duration: 141, score: '8.6', tone: 'charcoal' },
]

const DashboardPage = () => {
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

      <article className="hero-metric">
        <p className="hero-label">YEAR TO DATE</p>
        <div className="hero-row">
          <div className="hero-primary">
            <p className="hero-main">128</p>
            <p className="hero-sub-label">已看电影</p>
          </div>
          <div className="hero-secondary">
            <p className="hero-sub">286h</p>
            <p className="hero-sub-label">观影时长</p>
          </div>
        </div>
      </article>

      <section className="movie-section">
        <div className="movie-head">
          <h3>年度TOP5</h3>
        </div>
        <div className="movie-list">
          {topMovies.map((movie, index) => (
            <Link
              key={movie.id}
              className="movie-rank-item"
              to={`/detail?movie=${movie.id}&from=records`}
              aria-label={`查看${movie.title}详情`}
            >
              <div className={`movie-poster ${movie.tone}`} aria-hidden="true" />
              <div className="movie-rank-meta">
                <h4>{`${index + 1}. ${movie.title}`}</h4>
                <p>{`${movie.genre} · ${movie.duration} 分钟 · 评分 ${movie.score}`}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="quick-grid">
        <article className="quick-card">
          <p>月度均时</p>
          <strong>2.2h</strong>
        </article>
        <article className="quick-card dark">
          <p>平均评分</p>
          <strong>8.4</strong>
        </article>
      </div>

      <Link className="panel-card trend-card trend-card-link" to="/records/month" aria-label="查看月详情页">
        <div className="trend-bars-merged">
          <div className="trend-group past">
            {trendPast.map((item) => (
              <div key={`past-${item.month}`} className="trend-col">
                <div className="trend-track">
                  <div className="trend-fill" style={{ height: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="trend-split" aria-hidden="true" />
          <div className="trend-group future">
            {trendFuture.map((item) => (
              <div key={`future-${item.month}`} className="trend-col">
                <div className="trend-track">
                  <div className="trend-fill" style={{ height: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="trend-months-merged" aria-hidden="true">
          <div className="trend-month-group past">
            {trendPast.map((item) => (
              <span key={`past-label-${item.month}`} className="trend-month">
                {item.month}月
              </span>
            ))}
          </div>
          <div className="trend-split" />
          <div className="trend-month-group future">
            {trendFuture.map((item) => (
              <span key={`future-label-${item.month}`} className="trend-month">
                {item.month}月
              </span>
            ))}
          </div>
        </div>
      </Link>

      <section className="genre-section">
        <div className="genre-list">
          {genres.map((g) => (
            <div key={g.name} className="genre-item">
              <div className="genre-meta">
                <p className="genre-name">{g.name}</p>
                <p className="genre-count">{g.count} 部</p>
              </div>
              <div className="genre-track">
                <div style={{ width: `${(g.count / genres[0].count) * 100}%` }} className="genre-fill" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default DashboardPage
