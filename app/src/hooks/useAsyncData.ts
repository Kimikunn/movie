import { useEffect, useState } from 'react'

type AsyncState<T> = {
  requestKey: string
  data: T | null
  error: string | null
  loading: boolean
}

type UseAsyncDataOptions<T> = {
  enabled?: boolean
  initialData?: T | null
}

const createInitialState = <T,>(requestKey: string, enabled: boolean, initialData: T | null): AsyncState<T> => ({
  requestKey,
  data: initialData,
  error: null,
  loading: enabled,
})

export const useAsyncData = <T,>(
  requestKey: string,
  loader: () => Promise<T>,
  options?: UseAsyncDataOptions<T>,
) => {
  const enabled = options?.enabled ?? true
  const initialData = options?.initialData ?? null
  const [reloadToken, setReloadToken] = useState(0)
  const activeRequestKey = `${requestKey}:${reloadToken}`
  const [state, setState] = useState<AsyncState<T>>(() => createInitialState(activeRequestKey, enabled, initialData))

  useEffect(() => {
    if (!enabled) {
      return
    }

    let isActive = true

    loader()
      .then((nextData) => {
        if (!isActive) {
          return
        }
        setState({
          requestKey: activeRequestKey,
          data: nextData,
          error: null,
          loading: false,
        })
      })
      .catch((reason: unknown) => {
        if (!isActive) {
          return
        }
        const message = reason instanceof Error ? reason.message : '请求失败，请稍后重试。'
        setState({
          requestKey: activeRequestKey,
          data: initialData,
          error: message,
          loading: false,
        })
      })

    return () => {
      isActive = false
    }
  }, [activeRequestKey, enabled, initialData, loader])

  if (!enabled) {
    return {
      data: initialData,
      error: null,
      loading: false,
      reload: () => setReloadToken((value) => value + 1),
    }
  }

  if (state.requestKey !== activeRequestKey) {
    return {
      data: initialData,
      error: null,
      loading: true,
      reload: () => setReloadToken((value) => value + 1),
    }
  }

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    reload: () => setReloadToken((value) => value + 1),
  }
}
