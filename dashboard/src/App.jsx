import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import Heatmap from './pages/Heatmap'
import Landing from './pages/Landing'
import { useTracker } from './hooks/useTracker'

function AppContent() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  
  // Initialize tracker
  useTracker()

  // Initialize theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <>
      {!isLanding && <Navbar />}
      <main style={!isLanding ? { paddingTop: '72px', minHeight: '100vh' } : {}}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:sessionId" element={<SessionDetail />} />
          <Route path="/heatmap" element={<Heatmap />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
