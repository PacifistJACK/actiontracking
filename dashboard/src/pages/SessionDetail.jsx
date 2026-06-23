import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSession } from '../api'
import styles from './SessionDetail.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })
}

function EventNode({ event, index }) {
  const isClick = event.event_type === 'click'
  const isScroll = event.event_type === 'scroll'
  const isView = event.event_type === 'page_view'

  let dotColorStyle = styles.dotView;
  let iconName = 'visibility';
  let badgeColor = 'badge-page-view';
  
  if (isClick) {
    dotColorStyle = styles.dotClick;
    iconName = 'touch_app';
    badgeColor = 'badge-click';
  } else if (isScroll) {
    dotColorStyle = 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    iconName = 'swap_vert';
    badgeColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
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
          <div className="flex items-center gap-1 text-sm mt-2 text-on-surface-variant/80">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_content</span>
            Scrolled to <strong>{event.depth}%</strong> depth
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

  useEffect(() => {
    fetchSession(sessionId)
      .then(data => {
        if (data.error) throw new Error(data.error)
        setEvents(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [sessionId])

  const clicks    = events.filter(e => e.event_type === 'click').length
  const pageViews = events.filter(e => e.event_type === 'page_view').length

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.back} onClick={() => navigate('/sessions')}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Back to Sessions
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Session Journey</h1>
          <p className={styles.sessionId}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>fingerprint</span>
            {sessionId}
          </p>
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
