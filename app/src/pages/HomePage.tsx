import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageState from '../components/PageState'
import { fetchHomeResponse, getFavoriteWallClass, getPosterTone, resolveMockScenario } from '../data/mockMediaApi'
import { useAsyncData } from '../hooks/useAsyncData'

const formatMeta = (item: { primaryGenre?: string; runtimeMinutes?: number; userScore?: number }) =>
  [item.primaryGenre, item.runtimeMinutes ? `${item.runtimeMinutes} 分钟` : null, item.userScore ? `评分 ${item.userScore.toFixed(1)}` : null]
    .filter(Boolean)
    .join(' · ')

const formatWatchedOn = (value: string) => `观影时间：${value.replace(/-/g, '/')}`

const HomePage = () => {
  const [searchParams] = useSearchParams()
  const scenario = resolveMockScenario(searchParams.get('mock'))
  const loadHomeData = useCallback(() => fetchHomeResponse(scenario), [scenario])
  const { data: homeData, loading, error, reload } = useAsyncData(`home:${scenario}`, loadHomeData)

  return (
    <section className="home-page">
      <header className="home-nav">
        <div className="home-avatar" aria-hidden="true" />
      </header>

      {loading && !homeData ? (
        <PageState tone="loading" title="正在加载首页数据" description="正在读取待看清单、最近观影和喜爱影片。" />
      ) : error ? (
        <PageState tone="error" title="首页加载失败" description={error} actionLabel="重试" onAction={reload} />
      ) : homeData && !homeData.heroMedia && homeData.watchlist.length === 0 && homeData.recentWatched.length === 0 && homeData.favoriteMedia.length === 0 ? (
        <PageState tone="empty" title="还没有首页数据" description="先搜索一部影片，加入待看或写入第一条观影记录。" />
      ) : homeData ? (
        <>
          <section className="home-hero-section">
            <Link className="home-hero-card" to={`/detail?movie=${homeData.heroMedia?.mediaId ?? 'dune-2'}&from=home`}>
              <span className="home-hero-pill">2026 · 2月</span>
              <h2>{homeData.heroMedia?.title ?? '沙丘 2'}</h2>
            </Link>
          </section>

          <section className="home-watchlist-section">
            <h3>待看清单</h3>
            <div className="home-watchlist-scroll">
              {homeData.watchlist.map((item) => (
                <Link key={item.mediaId} to={`/detail?movie=${item.mediaId}&from=home`} className="home-mini-card">
                  <div className={`home-mini-poster ${getPosterTone(item.mediaId)}`} />
                  <div className="home-mini-info">
                    <h4>{item.title}</h4>
                    <p>{formatMeta(item)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="home-recent-section">
            <h3>最近观影记录</h3>
            <div className="home-recent-list">
              {homeData.recentWatched.map((item) => (
                <Link key={`${item.media.mediaId}-${item.watchedOn}`} to={`/detail?movie=${item.media.mediaId}&from=home`} className="home-mini-card full">
                  <div className={`home-mini-poster ${getPosterTone(item.media.mediaId)}`} />
                  <div className="home-mini-info">
                    <h4>{item.media.title}</h4>
                    <p>{formatMeta(item.media)}</p>
                    <p className="home-watched-at">{formatWatchedOn(item.watchedOn)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="home-favorite-section">
            <h3>最喜爱的影片</h3>
            <div className="home-favorite-wall">
              {homeData.favoriteMedia.map((item) => (
                <Link key={item.mediaId} to={`/detail?movie=${item.mediaId}&from=home`} className={`home-fav-card ${getFavoriteWallClass(item.mediaId)}`}>
                  <span>{[item.title, item.userScore ? item.userScore.toFixed(1) : null].filter(Boolean).join(' · ')}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  )
}

export default HomePage
