import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSessions, clearData } from '../api'
import styles from './Sessions.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short'
  })
}

function getDeviceInfo(ua) {
  if (!ua) return { os: 'Unknown', browser: 'Unknown', icon: 'devices' }
  const str = ua.toLowerCase()
  let os = 'Unknown'
  let icon = 'devices'
  let browser = 'Unknown'

  if (str.includes('win')) { os = 'Windows'; icon = 'desktop_windows' }
  else if (str.includes('mac')) { os = 'macOS'; icon = 'laptop_mac' }
  else if (str.includes('iphone') || str.includes('ipad')) { os = 'iOS'; icon = 'phone_iphone' }
  else if (str.includes('android')) { os = 'Android'; icon = 'smartphone' }
  else if (str.includes('linux')) { os = 'Linux'; icon = 'laptop_chromebook' }

  if (str.includes('chrome') && !str.includes('edge')) browser = 'Chrome'
  else if (str.includes('safari') && !str.includes('chrome')) browser = 'Safari'
  else if (str.includes('firefox')) browser = 'Firefox'
  else if (str.includes('edge')) browser = 'Edge'

  return { os, browser, icon }
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={styles.statCard} style={{ '--accent': accent }}>
      <div className={styles.statIcon}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
      </div>
    </div>
  )
}

const PAGE_SIZE = 20

export default function Sessions() {
  const [sessions, setSessions]     = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const navigate = useNavigate()

  const load = useCallback((p = page) => {
    setLoading(true)
    setError(null)
    fetchSessions(p, PAGE_SIZE)
      .then(data => {
        // Handle both paginated response { sessions, total, page, pages }
        // and legacy plain array for compatibility
        if (Array.isArray(data)) {
          setSessions(data)
          setTotal(data.length)
          setTotalPages(1)
        } else {
          setSessions(data.sessions || [])
          setTotal(data.total || 0)
          setTotalPages(data.pages || 1)
          setPage(data.page || p)
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { load(1) }, []) // eslint-disable-line

  const handleClear = () => {
    if (window.confirm("Are you sure you want to completely WIPE all tracking data? This cannot be undone.")) {
      setLoading(true)
      clearData()
        .then(() => {
          setPage(1)
          load(1)
        })
        .catch(e => {
          setError(e.message)
          setLoading(false)
        })
    }
  }

  const filtered = sessions.filter(s =>
    s.session_id.toLowerCase().includes(search.toLowerCase())
  )

  const totalEvents = sessions.reduce((a, s) => a + (s.event_count || 0), 0)

  function goPage(p) {
    if (p < 1 || p > totalPages) return
    setPage(p)
    load(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sessions</h1>
          <p className={styles.subtitle}>
            All tracked user sessions and their event activity
            {total > 0 && <> &mdash; <strong>{total}</strong> total</>}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-error border-error/30 hover:bg-error hover:text-white" onClick={handleClear} title="Wipe Database">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            Clear Data
          </button>
          <button className="btn-primary" onClick={() => load(page)} title="Refresh" id="refresh-sessions-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.stats}>
        <StatCard icon="group"    label="Total Sessions"  value={total}                                                accent="var(--color-primary)" />
        <StatCard icon="bolt"     label="Events This Page" value={totalEvents}                                         accent="var(--color-secondary)" />
        <StatCard icon="language" label="Unique Pages"    value={[...new Set(sessions.flatMap(s => s.page_urls || []))].length} accent="var(--color-tertiary)" />
      </div>

      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', fontSize: 20 }}>search</span>
          <input
            id="session-search"
            className={styles.search}
            placeholder="Filter by session ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
        <span className={styles.count}>
          {search ? `${filtered.length} matching` : `${sessions.length} on this page`}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading sessions…</p>
        </div>
      ) : error ? (
        <div className={styles.errorBox}>
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
          <p style={{ fontSize: 13, opacity: 0.7 }}>Make sure the Flask backend is running on port 4000.</p>
          <button className="btn-secondary" onClick={() => load(page)} style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>inbox</span>
          <p>{sessions.length === 0
            ? 'No sessions yet. Open landing.html and interact!'
            : 'No sessions match your filter.'
          }</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap + ' glass-card'}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Events</th>
                  <th>First Seen</th>
                  <th>Last Seen</th>
                  <th>Pages</th>
                  <th>Device</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.session_id}
                    className={styles.row}
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => navigate(`/sessions/${s.session_id}`)}
                    title={`View journey for ${s.session_id}`}
                  >
                    <td>
                      <span className={styles.sessionId}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>fingerprint</span>
                        {s.session_id}
                      </span>
                    </td>
                    <td>
                      <span className={styles.eventBadge}>{s.event_count}</span>
                    </td>
                    <td className={styles.muted}>{formatDate(s.first_seen)}</td>
                    <td className={styles.muted}>{formatDate(s.last_seen)}</td>
                    <td className={styles.muted}>{(s.page_urls || []).length}</td>
                    <td>
                      {(() => {
                        const { os, browser, icon } = getDeviceInfo(s.user_agent)
                        return (
                          <div className="flex flex-col text-xs">
                            <span className="flex items-center gap-1 font-medium text-on-surface">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
                              {os}
                            </span>
                            <span className="text-on-surface-variant/70 pl-5">{browser}</span>
                          </div>
                        )
                      })()}
                    </td>
                    <td>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', fontSize: 20 }}>
                        chevron_right
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!search && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                id="prev-page-btn"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                Prev
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
                        onClick={() => goPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )
                }
              </div>

              <button
                className={styles.pageBtn}
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages}
                id="next-page-btn"
              >
                Next
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="glass-card mt-xl p-lg rounded-xl border border-outline-variant/30 flex flex-col gap-sm mt-8">
            <h3 className="font-display text-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span> Terminology Guide
            </h3>
            <ul className="space-y-2 text-body-md text-on-surface-variant">
              <li><strong>Session ID:</strong> A unique, anonymous identifier given to a user's browser for this visit.</li>
              <li><strong>Events:</strong> The total number of tracking events (both page views and mouse clicks) recorded during the session.</li>
              <li><strong>First Seen / Last Seen:</strong> The timestamps marking the beginning and the most recent activity of the session.</li>
              <li><strong>Pages:</strong> The total number of unique URLs the user visited during this session.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
