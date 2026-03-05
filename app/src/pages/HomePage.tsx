import { Link } from 'react-router-dom'

const watchlist = [
  { id: 'dune-2', title: '沙丘2', meta: '科幻 · 166 分钟 · 评分 9.2', tone: 'dark' },
  { id: 'anatomy-of-a-fall', title: '坠落的审判', meta: '剧情 · 151 分钟 · 评分 9.0', tone: 'charcoal' },
  { id: 'robot-dreams', title: '机器人之梦', meta: '动画 · 102 分钟 · 评分 8.8', tone: 'silver' },
]

const recentLogs = [
  { id: 'dune-2', title: '沙丘2', meta: '科幻 · 166 分钟 · 评分 9.2', watchedAt: '观影时间：2026/02/25', tone: 'dark' },
  {
    id: 'anatomy-of-a-fall',
    title: '坠落的审判',
    meta: '剧情 · 151 分钟 · 评分 9.0',
    watchedAt: '观影时间：2026/02/19',
    tone: 'charcoal',
  },
]

const favoritePosters = [
  { id: 'dune-2', label: '沙丘2 · 9.2', cls: 'hero fav-1 border-soft' },
  { id: 'blade-runner-2049', label: '银翼杀手2049 · 8.9', cls: 'tall fav-2' },
  { id: 'in-the-mood-for-love', label: '花样年华 · 8.7', cls: 'tall fav-3' },
  { id: 'robot-dreams', label: '机器人之梦 · 8.8', cls: 'mid fav-4' },
  { id: 'anatomy-of-a-fall', label: '坠落的审判 · 9.0', cls: 'wide fav-5 border-soft' },
  { id: 'tenet', label: '信条 · 8.6', cls: 'mid fav-6' },
]

const HomePage = () => {
  return (
    <section className="home-page">
      <header className="home-nav">
        <div className="home-avatar" aria-hidden="true" />
      </header>

      <section className="home-hero-section">
        <Link className="home-hero-card" to="/detail?movie=dune-2&from=home">
          <span className="home-hero-pill">2026 · 2月</span>
          <h2>沙丘2</h2>
        </Link>
      </section>

      <section className="home-watchlist-section">
        <h3>待看清单</h3>
        <div className="home-watchlist-scroll">
          {watchlist.map((item) => (
            <Link key={item.id} to={`/detail?movie=${item.id}&from=home`} className="home-mini-card">
              <div className={`home-mini-poster ${item.tone}`} />
              <div className="home-mini-info">
                <h4>{item.title}</h4>
                <p>{item.meta}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-recent-section">
        <h3>最近观影记录</h3>
        <div className="home-recent-list">
          {recentLogs.map((item) => (
            <Link key={item.id} to={`/detail?movie=${item.id}&from=home`} className="home-mini-card full">
              <div className={`home-mini-poster ${item.tone}`} />
              <div className="home-mini-info">
                <h4>{item.title}</h4>
                <p>{item.meta}</p>
                <p className="home-watched-at">{item.watchedAt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-favorite-section">
        <h3>最喜爱的电影</h3>
        <div className="home-favorite-wall">
          {favoritePosters.map((item) => (
            <Link key={item.id} to={`/detail?movie=${item.id}&from=home`} className={`home-fav-card ${item.cls}`}>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  )
}

export default HomePage
