import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { IonIcon } from '@ionic/react'
import { checkmarkOutline, closeOutline } from 'ionicons/icons'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { addWatchLog } from '../data/watchLogStore'

const movieOptions = [
  { id: 'dune-2', title: '沙丘 2' },
  { id: 'anatomy-of-a-fall', title: '坠落的审判' },
  { id: 'robot-dreams', title: '机器人之梦' },
  { id: 'furiosa', title: '芙莉欧莎' },
  { id: 'poor-things', title: '可怜的东西' },
]

const formatOptions = ['影院', '杜比', 'IMAX', '流媒体', '蓝光']

const today = new Date().toISOString().slice(0, 10)

const AddRecordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')
  const movieFromQuery = (searchParams.get('movie') ?? '').trim()
  const returnFrom = (searchParams.get('returnFrom') ?? '').trim()

  const initialMovieId = movieOptions.some((item) => item.id === movieFromQuery) ? movieFromQuery : 'dune-2'
  const [movieId, setMovieId] = useState(initialMovieId)
  const [watchedAt, setWatchedAt] = useState(today)
  const [place, setPlace] = useState('')
  const [mode, setMode] = useState(formatOptions[0])
  const [score, setScore] = useState('')
  const [note, setNote] = useState('')
  const [errorText, setErrorText] = useState('')

  const closeTarget = useMemo(() => {
    if (from === 'detail') {
      const source = movieFromQuery || movieId
      const resolvedFrom = returnFrom || 'home'
      return `/detail?movie=${encodeURIComponent(source)}&from=${encodeURIComponent(resolvedFrom)}`
    }
    if (from === 'records') {
      return '/records'
    }
    return '/home'
  }, [from, movieFromQuery, movieId, returnFrom])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!movieId || !watchedAt || !place.trim() || !score.trim()) {
      setErrorText('请补全影片、日期、地点和评分。')
      return
    }
    setErrorText('')

    addWatchLog({
      movieId,
      watchedAt,
      place: place.trim(),
      mode,
      score: score.trim(),
      note: note.trim(),
    })

    if (from === 'detail') {
      const resolvedFrom = returnFrom || 'home'
      navigate(`/detail?movie=${encodeURIComponent(movieId)}&from=${encodeURIComponent(resolvedFrom)}`, { replace: true })
      return
    }

    navigate('/records', { replace: true })
  }

  return (
    <section className="create-page">
      <header className="create-nav">
        <Link to={closeTarget} className="close-pill" aria-label="关闭新增记录">
          <IonIcon icon={closeOutline} />
        </Link>
        <h2>新增观影记录</h2>
        <span />
      </header>

      <form className="create-form" onSubmit={handleSubmit}>
        <label className="create-field">
          <span>影片</span>
          <select value={movieId} onChange={(event) => setMovieId(event.target.value)}>
            {movieOptions.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </label>

        <label className="create-field">
          <span>观影日期</span>
          <input type="date" value={watchedAt} onChange={(event) => setWatchedAt(event.target.value)} />
        </label>

        <label className="create-field">
          <span>观影地点</span>
          <input
            type="text"
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            placeholder="例如：万达影城 IMAX 厅"
          />
        </label>

        <label className="create-field">
          <span>观影方式</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            {formatOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="create-field">
          <span>我的评分（0-10）</span>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="例如：8.8"
          />
        </label>

        <label className="create-field">
          <span>短评（可选）</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="一句话记录感受" />
        </label>

        {errorText ? <p className="create-error">{errorText}</p> : null}

        <button type="submit" className="create-submit-btn">
          <IonIcon icon={checkmarkOutline} />
          <span>保存记录</span>
        </button>
      </form>
    </section>
  )
}

export default AddRecordPage
