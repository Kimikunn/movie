import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { IonIcon } from '@ionic/react'
import { chevronForwardOutline, closeOutline, searchOutline } from 'ionicons/icons'
import { Link, useSearchParams } from 'react-router-dom'
import PageState from '../components/PageState'
import { fetchSearchMedia, getPosterTone, resolveMockScenario } from '../data/mockMediaApi'
import { useAsyncData } from '../hooks/useAsyncData'
import { useOfflineStatus } from '../hooks/useOfflineStatus'

const recentSearches = ['沙丘 2', '坠落的审判', '机器人之梦']

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const from = (searchParams.get('from') ?? '').trim()
  const sourceMovieId = (searchParams.get('movie') ?? '').trim()
  const scenario = resolveMockScenario(searchParams.get('mock'))
  const isOfflineMode = useOfflineStatus(scenario === 'offline')
  const contextParams: Record<string, string> = from === 'detail' ? { from: 'detail', movie: sourceMovieId || 'dune-2' } : {}
  const keywordFromParam = (searchParams.get('q') ?? '').trim()
  const activeKeyword = keywordFromParam || '沙丘'
  const isInitialMode = searchParams.get('mode') === 'initial' && !keywordFromParam
  const [searchText, setSearchText] = useState(keywordFromParam)
  const loadSearchResult = useCallback(() => fetchSearchMedia(keywordFromParam, scenario), [keywordFromParam, scenario])
  const { data: searchResult, loading, error, reload } = useAsyncData(`search:${scenario}:${keywordFromParam}`, loadSearchResult, {
    enabled: !isInitialMode,
  })
  const visibleResults = keywordFromParam ? (searchResult?.items ?? []) : (searchResult?.items ?? []).slice(0, 3)
  const hasNoResult = !isInitialMode && !loading && !error && visibleResults.length === 0

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

      {isOfflineMode ? <p className="page-inline-notice">当前离线，仅可查看已缓存的搜索结果；新关键词可能暂时无法获取。</p> : null}

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

      {loading ? (
        <PageState tone="loading" title="正在搜索" description={keywordFromParam ? `正在检索“${keywordFromParam}”` : '正在准备搜索内容。'} />
      ) : error ? (
        <PageState tone="error" title="搜索失败" description={error} actionLabel="重试" onAction={reload} />
      ) : isInitialMode ? (
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
          <span>{searchResult?.suggestions?.length ? `试试：${searchResult.suggestions.join(' / ')}` : '换个关键词试试'}</span>
        </div>
      ) : (
        <div className="result-list">
          {visibleResults.map((item) => {
            const meta = [item.originalTitle, item.year, item.countries?.[0]].filter(Boolean).join(' · ')
            return (
              <Link
                key={item.mediaId}
                className="result-card"
                to={`/detail?movie=${item.mediaId}&from=search&q=${encodeURIComponent(activeKeyword)}`}
                aria-label={`查看${item.title}详情`}
              >
                <div className={`result-poster ${getPosterTone(item.mediaId) === 'mid' ? 'mid' : ''}`} />
                <div className="result-info">
                  <h3>{item.title}</h3>
                  <p>{meta}</p>
                </div>
                <IonIcon icon={chevronForwardOutline} />
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default SearchPage
