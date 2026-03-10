import { useEffect, useMemo, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallMode = 'prompt' | 'ios-manual' | null

const DISMISS_KEY = 'movie:pwa-install-dismissed'

const isStandaloneMode = () =>
  (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
  (typeof navigator !== 'undefined' && 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))

const isIosSafari = () => {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent
  const isIosDevice = /iphone|ipad|ipod/i.test(userAgent)
  const isSafariBrowser = /safari/i.test(userAgent) && !/crios|fxios|edgios/i.test(userAgent)
  return isIosDevice && isSafariBrowser
}

const readDismissedState = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(DISMISS_KEY) === '1'
}

export const usePwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode)
  const [dismissed, setDismissed] = useState(readDismissedState)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setDismissed(false)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(DISMISS_KEY)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const mode = useMemo<InstallMode>(() => {
    if (isInstalled || dismissed) {
      return null
    }
    if (deferredPrompt) {
      return 'prompt'
    }
    if (isIosSafari()) {
      return 'ios-manual'
    }
    return null
  }, [deferredPrompt, dismissed, isInstalled])

  const dismissPrompt = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, '1')
    }
  }

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (choice.outcome === 'dismissed') {
      dismissPrompt()
    }
  }

  return {
    canShowPrompt: mode !== null,
    dismissPrompt,
    installMode: mode,
    promptInstall,
  }
}
