import { useEffect, useState } from 'react'

const getBrowserOfflineState = () => (typeof navigator !== 'undefined' ? !navigator.onLine : false)

export const useOfflineStatus = (forcedOffline = false) => {
  const [isBrowserOffline, setIsBrowserOffline] = useState(getBrowserOfflineState)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncBrowserState = () => {
      setIsBrowserOffline(getBrowserOfflineState())
    }

    window.addEventListener('online', syncBrowserState)
    window.addEventListener('offline', syncBrowserState)

    return () => {
      window.removeEventListener('online', syncBrowserState)
      window.removeEventListener('offline', syncBrowserState)
    }
  }, [])

  return forcedOffline || isBrowserOffline
}
