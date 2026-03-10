import { IonApp } from '@ionic/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import MoviesPage from './pages/MoviesPage'
import PosterWallPreviewPage from './pages/PosterWallPreviewPage'
import RecordsMonthPage from './pages/RecordsMonthPage'
import RecordsWeekPage from './pages/RecordsWeekPage'
import SearchPage from './pages/SearchPage'
import TabLabPage from './pages/TabLabPage'

function App() {
  return (
    <IonApp>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/records" element={<DashboardPage />} />
            <Route path="/records/month" element={<RecordsMonthPage />} />
            <Route path="/records/week" element={<RecordsWeekPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/movies" element={<HomePage />} />
            <Route path="/detail" element={<MoviesPage />} />
            <Route path="/preview/poster-wall/:variant" element={<PosterWallPreviewPage />} />
            <Route path="/preview/poster-wall" element={<Navigate to="/preview/poster-wall/bento" replace />} />
            <Route path="/preview/tab-lab" element={<TabLabPage />} />
            <Route path="/create" element={<Navigate to="/search" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </IonApp>
  )
}

export default App
