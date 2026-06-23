import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/sessions" className={styles.brand} id="navbar-brand">
          <div className={styles.logoIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>
              analytics
            </span>
          </div>
          <span className={styles.brandName}>TrackForge</span>
          <span className={styles.brandSub}>Analytics</span>
        </a>

        {/* Nav Links */}
        <div className={styles.links}>
          <NavLink
            to="/sessions"
            id="nav-sessions"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>group</span>
            Sessions
          </NavLink>
          <NavLink
            to="/heatmap"
            id="nav-heatmap"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>local_fire_department</span>
            Heatmap
          </NavLink>
        </div>

        {/* Right side */}
        <div className={styles.right}>
          {/* Dark mode toggle */}
          <button
            id="dark-mode-toggle"
            className={styles.themeBtn}
            onClick={() => setDark(d => !d)}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Live indicator */}
          <div className={styles.liveChip}>
            <span className={`animate-pulse-dot ${styles.liveDot}`} />
            Live
          </div>
        </div>
      </div>
    </nav>
  )
}
