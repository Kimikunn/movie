import { IonIcon } from '@ionic/react'
import {
  addOutline,
  batteryFullOutline,
  cellularOutline,
  gridOutline,
  homeOutline,
  wifiOutline,
} from 'ionicons/icons'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/home', icon: homeOutline, label: '首页', kind: 'default' },
  { to: '/search', icon: addOutline, label: '搜索', kind: 'center' },
  { to: '/records', icon: gridOutline, label: '观影记录', kind: 'default' },
] as const

const AppShell = () => {
  const location = useLocation()
  const contentRef = useRef<HTMLElement | null>(null)
  const activeIndex = (() => {
    const matchedIndex = navItems.findIndex(
      (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
    )
    if (matchedIndex >= 0) {
      return matchedIndex
    }

    if (location.pathname === '/detail') {
      const from = new URLSearchParams(location.search).get('from')
      if (from === 'records' || from === 'dashboard' || from === 'records-month' || from === 'records-week') {
        return 2
      }
      if (from === 'create' || from === 'profile' || from === 'search') {
        return 1
      }
      return 0
    }

    if (location.pathname === '/search' || location.pathname === '/profile' || location.pathname === '/create') {
      return 1
    }

    return 0
  })()
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="app-shell-wrap">
      <div className="phone-canvas">
        <header className="ios-status-bar">
          <span className="ios-time">9:41</span>
          <div className="ios-icons">
            <IonIcon icon={cellularOutline} />
            <IonIcon icon={wifiOutline} />
            <IonIcon icon={batteryFullOutline} />
          </div>
        </header>

        <main ref={contentRef} className="app-content with-tab">
          <Outlet />
        </main>

        <footer className="tab-footer">
          <nav
            className="tab-pill tab-pill--liquid"
            style={{ '--tab-active-index': safeActiveIndex } as CSSProperties}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const isDetailForcedActive = location.pathname === '/detail' && navItems[safeActiveIndex]?.to === item.to
                  return `tab-item ${item.kind === 'center' ? 'is-center' : ''} ${isActive || isDetailForcedActive ? 'is-active' : ''}`.trim()
                }}
                aria-label={item.label}
              >
                <span className="tab-item-content">
                  <IonIcon icon={item.icon} />
                </span>
              </NavLink>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  )
}

export default AppShell
