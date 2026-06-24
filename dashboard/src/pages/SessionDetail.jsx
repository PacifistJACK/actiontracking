import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSession } from '../api'
import styles from './SessionDetail.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })
}

function formatDuration(events) {
  if (!events || events.length < 2) return '< 1s'
  const timestamps = events.map(e => new Date(e.timestamp).getTime()).filter(t => !isNaN(t))
  if (timestamps.length < 2) return '< 1s'
  const ms = Math.max(...timestamps) - Math.min(...timestamps)
  if (ms < 1000) return '< 1s'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes < 60) return `${minutes}m ${secs}s`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function getDeviceInfo(ua) {
  if (!ua) return { os: 'Unknown', browser: 'Unknown' }
  const str = ua.toLowerCase()
  let os = 'Unknown', browser = 'Unknown'
  if (str.includes('win')) os = 'Windows'
  else if (str.includes('mac')) os = 'macOS'
  else if (str.includes('iphone') || str.includes('ipad')) os = 'iOS'
  else if (str.includes('android')) os = 'Android'
  else if (str.includes('linux')) os = 'Linux'
  if (str.includes('chrome') && !str.includes('edge')) browser = 'Chrome'
  else if (str.includes('safari') && !str.includes('chrome')) browser = 'Safari'
  else if (str.includes('firefox')) browser = 'Firefox'
  else if (str.includes('edge')) browser = 'Edge'
  return { os, browser }
}

function EventNode({ event, index }) {
  const isClick = event.event_type === 'click'
  const isScroll = event.event_type === 'scroll'

  let dotColorStyle = styles.dotView;
  let iconName = 'visibility';
  let badgeColor = 'badge-page-view';
  
  if (isClick) {
    dotColorStyle = styles.dotClick;
    iconName = 'touch_app';
    badgeColor = 'badge-click';
  } else if (isScroll) {
    dotColorStyle = styles.dotScroll;
    iconName = 'swap_vert';
    badgeColor = styles.badgeScroll;
  }

  return (
    <div className={`${styles.eventRow} animate-fade-in-up`} style={{ animationDelay: `${index * 45}ms` }}>
      {/* Timeline dot + line */}
      <div className={styles.timelineCol}>
        <div className={`${styles.dot} ${dotColorStyle} flex items-center justify-center rounded-full w-8 h-8`}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {iconName}
          </span>
        </div>
        <div className={styles.line} />
      </div>

      {/* Card */}
      <div className={`${styles.eventCard} glass-card`}>
        <div className={styles.cardTop}>
          <span className={`badge ${badgeColor}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
              {isClick ? 'ads_click' : isScroll ? 'swap_vert' : 'pageview'}
            </span>
            {event.event_type}
          </span>
          <span className={styles.time}>{formatDate(event.timestamp)}</span>
        </div>
        <p className={styles.url}>{event.page_url}</p>
        
        {isClick && event.x != null && (
          <div className={styles.coords}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              location_on
            </span>
            x: <strong>{event.x}</strong> &nbsp; y: <strong>{event.y}</strong>
            {event.viewport_width && (
              <span className={styles.viewport}>
                &nbsp;/ {event.viewport_width}×{event.viewport_height}
              </span>
            )}
          </div>
        )}

        {isScroll && event.depth != null && (
          <div className={styles.scrollDepthWrap}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-primary)' }}>expand_content</span>
              <span style={{ fontSize: 13 }}>Scrolled to <strong>{event.depth}%</strong></span>
            </div>
            <div className="progress-bar" style={{ width: '100%' }}>
              <div className="progress-bar-fill" style={{ width: `${event.depth}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchSession(sessionId)
      .then(data => {
        if (data.error) throw new Error(data.error)
        setEvents(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [sessionId])

  // Escape key to go back
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') navigate('/sessions')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = sessionId
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const clicks    = events.filter(e => e.event_type === 'click').length
  const pageViews = events.filter(e => e.event_type === 'page_view').length
  const maxDepth  = Math.max(0, ...events.filter(e => e.event_type === 'scroll' && e.depth).map(e => e.depth))
  const device    = getDeviceInfo(events[0]?.user_agent)
  const uniquePages = [...new Set(events.map(e => e.page_url))].length

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Back */}
      <button className={styles.back} onClick={() => navigate('/sessions')}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Back to Sessions
        <span style={{ fontSize: 11, opacity: 0.5, marginLeft: 4 }}>Esc</span>
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Session Journey</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p className={styles.sessionId}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>fingerprint</span>
              {sessionId}
            </p>
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copy Session ID"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className={styles.chips}>
          <div className={styles.chip}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
            {events.length} events
          </div>
          <div className={`${styles.chip} ${styles.chipBlue}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pageview</span>
            {pageViews} views
          </div>
          <div className={`${styles.chip} ${styles.chipGreen}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>ads_click</span>
            {clicks} clicks
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {!loading && !error && events.length > 0 && (
        <div className={`${styles.summaryCard} glass-card`}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-primary)' }}>timer</span>
              <div>
                <p className={styles.summaryLabel}>Duration</p>
                <p className={styles.summaryValue}>{formatDuration(events)}</p>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-secondary)' }}>devices</span>
              <div>
                <p className={styles.summaryLabel}>Device</p>
                <p className={styles.summaryValue}>{device.os} · {device.browser}</p>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-tertiary)' }}>language</span>
              <div>
                <p className={styles.summaryLabel}>Pages Visited</p>
                <p className={styles.summaryValue}>{uniquePages}</p>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#16a34a' }}>expand_content</span>
              <div>
                <p className={styles.summaryLabel}>Max Scroll Depth</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p className={styles.summaryValue}>{maxDepth > 0 ? `${maxDepth}%` : '—'}</p>
                  {maxDepth > 0 && (
                    <div className="progress-bar" style={{ width: 80, height: 4 }}>
                      <div className="progress-bar-fill" style={{ width: `${maxDepth}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /><p>Loading events…</p></div>
      ) : error ? (
        <div className={styles.errorBox}>
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className={styles.empty}>
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>inbox</span>
          <p>No events for this session.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {/* Latest Activity marker at top */}
          <div className={styles.endMarker}>
            <div className={styles.endDot} style={{ background: 'var(--color-primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>update</span>
            </div>
            <span>Latest Activity</span>
          </div>

          {events.map((e, i) => (
            <EventNode key={i} event={e} index={i} />
          ))}
          
          {/* Start marker at bottom */}
          <div className={styles.endMarker}>
            <div className={styles.endDot} style={{ background: 'var(--color-secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_arrow</span>
            </div>
            <span>Session Start</span>
          </div>
        </div>
      )}
    </div>
  )
}
