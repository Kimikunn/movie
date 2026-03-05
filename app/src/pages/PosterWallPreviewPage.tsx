import { Link, useParams } from 'react-router-dom'

type PosterItem = {
  id: string
  title: string
  score: string
  cls: string
}

const posters: PosterItem[] = [
  { id: 'dune-2', title: '沙丘2', score: '9.2', cls: 'p1' },
  { id: 'blade-runner-2049', title: '银翼杀手2049', score: '8.9', cls: 'p2' },
  { id: 'in-the-mood-for-love', title: '花样年华', score: '8.7', cls: 'p3' },
  { id: 'robot-dreams', title: '机器人之梦', score: '8.8', cls: 'p4' },
  { id: 'anatomy-of-a-fall', title: '坠落的审判', score: '9.0', cls: 'p5' },
  { id: 'tenet', title: '信条', score: '8.6', cls: 'p6' },
]

const variants = [
  { key: 'bento', label: 'Bento 模块化' },
  { key: 'masonry', label: 'Masonry 画廊' },
  { key: 'filmstrip', label: '影院胶片带' },
  { key: 'editorial', label: '杂志编排' },
] as const

const PosterWallPreviewPage = () => {
  const { variant = 'bento' } = useParams()
  const activeVariant = variants.some((item) => item.key === variant) ? variant : 'bento'

  return (
    <section className="poster-preview-page">
      <header className="poster-preview-head">
        <div>
          <p>最喜爱的电影</p>
          <h2>海报墙预览方案</h2>
        </div>
        <Link to="/home" className="poster-preview-back">
          返回首页
        </Link>
      </header>

      <nav className="poster-variant-tabs">
        {variants.map((item) => (
          <Link
            key={item.key}
            to={`/preview/poster-wall/${item.key}`}
            className={`poster-variant-tab ${activeVariant === item.key ? 'is-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <article className={`poster-wall-preview variant-${activeVariant}`}>
        {activeVariant === 'bento' ? (
          <>
            <div className={`poster-card hero ${posters[0].cls}`}>
              <span>{`${posters[0].title} · ${posters[0].score}`}</span>
            </div>
            <div className={`poster-card tall ${posters[1].cls}`}>
              <span>{`${posters[1].title} · ${posters[1].score}`}</span>
            </div>
            <div className={`poster-card tall ${posters[2].cls}`}>
              <span>{`${posters[2].title} · ${posters[2].score}`}</span>
            </div>
            <div className={`poster-card mid ${posters[3].cls}`}>
              <span>{`${posters[3].title} · ${posters[3].score}`}</span>
            </div>
            <div className={`poster-card wide ${posters[4].cls}`}>
              <span>{`${posters[4].title} · ${posters[4].score}`}</span>
            </div>
            <div className={`poster-card mid ${posters[5].cls}`}>
              <span>{`${posters[5].title} · ${posters[5].score}`}</span>
            </div>
          </>
        ) : null}

        {activeVariant === 'masonry' ? (
          <div className="poster-masonry">
            <div className={`poster-card masonry h220 ${posters[0].cls}`}>
              <span>{`${posters[0].title} · ${posters[0].score}`}</span>
            </div>
            <div className={`poster-card masonry h150 ${posters[1].cls}`}>
              <span>{`${posters[1].title} · ${posters[1].score}`}</span>
            </div>
            <div className={`poster-card masonry h180 ${posters[2].cls}`}>
              <span>{`${posters[2].title} · ${posters[2].score}`}</span>
            </div>
            <div className={`poster-card masonry h200 ${posters[3].cls}`}>
              <span>{`${posters[3].title} · ${posters[3].score}`}</span>
            </div>
            <div className={`poster-card masonry h160 ${posters[4].cls}`}>
              <span>{`${posters[4].title} · ${posters[4].score}`}</span>
            </div>
            <div className={`poster-card masonry h140 ${posters[5].cls}`}>
              <span>{`${posters[5].title} · ${posters[5].score}`}</span>
            </div>
          </div>
        ) : null}

        {activeVariant === 'filmstrip' ? (
          <div className="poster-filmstrip">
            <div className="filmstrip-head">FILM ARCHIVE</div>
            <div className="filmstrip-row">
              {posters.map((item) => (
                <div key={`film-${item.id}`} className={`poster-card film ${item.cls}`}>
                  <span>{`${item.title} · ${item.score}`}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeVariant === 'editorial' ? (
          <div className="poster-editorial">
            <div className={`poster-card editorial big ${posters[0].cls}`}>
              <span>{`${posters[0].title} · ${posters[0].score}`}</span>
            </div>
            <div className="editorial-side">
              <div className={`poster-card editorial ${posters[1].cls}`}>
                <span>{`${posters[1].title} · ${posters[1].score}`}</span>
              </div>
              <div className={`poster-card editorial ${posters[2].cls}`}>
                <span>{`${posters[2].title} · ${posters[2].score}`}</span>
              </div>
            </div>
            <div className={`poster-card editorial wide ${posters[4].cls}`}>
              <span>{`${posters[4].title} · ${posters[4].score}`}</span>
            </div>
            <div className={`poster-card editorial ${posters[3].cls}`}>
              <span>{`${posters[3].title} · ${posters[3].score}`}</span>
            </div>
            <div className={`poster-card editorial ${posters[5].cls}`}>
              <span>{`${posters[5].title} · ${posters[5].score}`}</span>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  )
}

export default PosterWallPreviewPage
