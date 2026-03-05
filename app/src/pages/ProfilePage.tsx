import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { IonIcon } from '@ionic/react'
import { chevronForwardOutline, closeOutline, searchOutline } from 'ionicons/icons'
import { Link, useSearchParams } from 'react-router-dom'

const results = [
  {
    id: 'dune-2',
    title: '沙丘 2',
    meta: 'Dune: Part Two · 2024 · 美国',
    posterTone: 'dark',
  },
  {
    id: 'anatomy-of-a-fall',
    title: '坠落的审判',
    meta: 'Anatomy of a Fall · 2023 · 法国',
    posterTone: 'mid',
  },
  {
    id: 'robot-dreams',
    title: '机器人之梦',
    meta: 'Robot Dreams · 2023 · 西班牙',
    posterTone: 'dark',
  },
]

const recentSearches = ['沙丘 2', '坠落的审判', '机器人之梦']

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const from = (searchParams.get('from') ?? '').trim()
  const sourceMovieId = (searchParams.get('movie') ?? '').trim()
  const contextParams: Record<string, string> = from === 'detail' ? { from: 'detail', movie: sourceMovieId || 'dune-2' } : {}
  const keywordFromParam = (searchParams.get('q') ?? '').trim()
  const activeKeyword = keywordFromParam || '沙丘'
  const isInitialMode = searchParams.get('mode') === 'initial' && !keywordFromParam
  const [searchText, setSearchText] = useState(keywordFromParam)
  const visibleResults = keywordFromParam
    ? results.filter((item) => item.title.includes(keywordFromParam) || item.meta.includes(keywordFromParam))
    : results
  const hasNoResult = !isInitialMode && visibleResults.length === 0

  useEffect(() => {
    setSearchText(keywordFromParam)
  }, [keywordFromParam])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextKeyword = searchText.trim()
    if (nextKeyword) {
      setSearchParams({ ...contextParams, q: nextKeyword })
      return
    }
    setSearchParams({ ...contextParams, mode: 'initial' })
  }

  const handleSearchClear = () => {
    setSearchText('')
    setSearchParams({ ...contextParams, mode: 'initial' })
  }

  const handleRecentChipClick = (keyword: string) => {
    setSearchParams({ ...contextParams, q: keyword })
  }

  const closeTarget = from === 'detail' ? `/detail?movie=${encodeURIComponent(sourceMovieId || 'dune-2')}` : '/home'

  return (
    <section className="search-page">
      <header className="search-nav">
        <Link to={closeTarget} className="close-pill" aria-label="关闭搜索">
          <IonIcon icon={closeOutline} />
        </Link>
        <h2>搜索影片</h2>
        <span />
      </header>

      <form className="search-input" onSubmit={handleSearchSubmit}>
        <IonIcon icon={searchOutline} />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          aria-label="搜索影片"
          placeholder="搜索影片名称 / 导演 / 英文名"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        {searchText.trim() ? (
          <button type="button" className="search-clear-btn" aria-label="清空关键词" onClick={handleSearchClear}>
            <IonIcon icon={closeOutline} />
          </button>
        ) : null}
      </form>

      {isInitialMode ? (
        <div className="search-state search-state-idle">
          <p>输入片名开始搜索</p>
        </div>
      ) : (
        <div className="search-state">
          <p>搜索词：{activeKeyword}</p>
          <span>{visibleResults.length} 个结果</span>
        </div>
      )}

      <p className="result-head">{isInitialMode ? '最近搜索' : '搜索结果'}</p>
      {isInitialMode ? (
        <div className="recent-list">
          <div className="recent-chip-row">
            {recentSearches.map((label) => (
              <button key={label} type="button" className="recent-chip" onClick={() => handleRecentChipClick(label)}>
                {label}
              </button>
            ))}
          </div>
          <div className="initial-empty-card">
            <IonIcon icon={searchOutline} />
            <p>输入关键词后显示搜索结果</p>
          </div>
        </div>
      ) : hasNoResult ? (
        <div className="search-no-result-card">
          <IonIcon icon={searchOutline} />
          <p>未找到匹配结果</p>
          <span>换个关键词试试</span>
        </div>
      ) : (
        <div className="result-list">
          {visibleResults.map((item) => (
            <Link
              key={item.id}
              className="result-card"
              to={`/detail?movie=${item.id}&from=search&q=${encodeURIComponent(activeKeyword)}`}
              aria-label={`查看${item.title}详情`}
            >
              <div className={`result-poster ${item.posterTone === 'mid' ? 'mid' : ''}`} />
              <div className="result-info">
                <h3>{item.title}</h3>
                <p>{item.meta}</p>
              </div>
              <IonIcon icon={chevronForwardOutline} />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProfilePage
