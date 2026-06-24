import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchHeatmap, fetchPages } from '../api'
import styles from './Heatmap.module.css'

const HEATMAP_W = 900
const HEATMAP_H = 2000 // Increased height to fit new Enterprise and Form sections
const IFRAME_SCALE = HEATMAP_W / 1440 // 0.625 — scale 1440px layout down to 900px canvas

function drawHeatmap(canvas, clicks) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (clicks.length === 0) return

  // Draw each click as a radial gradient blob
  clicks.forEach(({ x, y, viewport_width = 1440, viewport_height = 900 }) => {
    // To perfectly align clicks to the scaled 1440px iframe:
    let iframe_x = x;
    let iframe_y = y;
    
    if (viewport_width > 1440) {
      // The user's screen was wider than the 1440px max-width layout, so it was centered.
      // Subtract the empty margin to map X directly onto the 1440px content block.
      const margin = (viewport_width - 1440) / 2;
      iframe_x = x - margin;
    } else {
      // If screen was smaller, stretch proportionally (best effort for mobile->desktop mapping)
      iframe_x = x * (1440 / viewport_width);
    }
    
    // The iframe is visually scaled down by the canvas width (900 / 1440 = 0.625)
    // We apply this exact scale to both X and Y so the dots perfectly overlay the visual iframe
    const scale = canvas.width / 1440;
    const nx = iframe_x * scale;
    const ny = iframe_y * scale;
    const r  = 40

    const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r)
    grad.addColorStop(0,    'rgba(186, 26, 26, 0.55)')
    grad.addColorStop(0.35, 'rgba(245, 140, 0,  0.28)')
    grad.addColorStop(0.7,  'rgba(79, 70, 229,  0.12)')
    grad.addColorStop(1,    'rgba(79, 70, 229,  0)')

    ctx.beginPath()
    ctx.arc(nx, ny, r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  })

  // Overlay a compositing layer to blend blobs
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(250,248,255,0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'
}

export default function Heatmap() {
  const [pages, setPages]     = useState([])
  const [selPage, setSelPage] = useState('')
  const [clicks, setClicks]   = useState([])
  const [loading, setLoading] = useState(true)  // start true to avoid empty-state flash
  const [pagesLoading, setPagesLoading] = useState(true)
  const [iframeStatus, setIframeStatus] = useState('loading') // 'loading' | 'loaded' | 'error'
  const [hasFetched, setHasFetched] = useState(false) // true once a heatmap fetch completes
  const canvasRef = useRef(null)

  // Load available pages — filter out internal dashboard routes
  useEffect(() => {
    const DASHBOARD_PATHS = ['/sessions', '/heatmap']
    const isDashboardRoute = (url) => {
      try {
        const path = new URL(url).pathname.replace(/\/$/, '')
        return DASHBOARD_PATHS.some(p => path === p || path.startsWith(p + '/'))
      } catch {
        return false
      }
    }
    fetchPages()
      .then(p => {
        const filtered = p.filter(url => !isDashboardRoute(url))
        setPages(filtered)
        if (filtered.length > 0) setSelPage(filtered[0])
        else setLoading(false) // no pages, stop spinner
      })
      .catch(() => setLoading(false))
      .finally(() => setPagesLoading(false))
  }, [])

  // Load click data when page selection changes
  useEffect(() => {
    if (!selPage) return
    setLoading(true)
    setHasFetched(false)
    setIframeStatus('loading')
    fetchHeatmap(selPage)
      .then(data => {
        setClicks(data)
        // Draw after state update
        requestAnimationFrame(() => {
          if (canvasRef.current) drawHeatmap(canvasRef.current, data)
        })
      })
      .catch(() => setClicks([]))
      .finally(() => {
        setLoading(false)
        setHasFetched(true)
      })
  }, [selPage])

  // Redraw on resize
  const redraw = useCallback(() => {
    if (canvasRef.current && clicks.length > 0) drawHeatmap(canvasRef.current, clicks)
  }, [clicks])

  useEffect(() => {
    window.addEventListener('resize', redraw)
    return () => window.removeEventListener('resize', redraw)
  }, [redraw])

  // Build same-origin iframe URL from the stored page_url.
  // The DB stores full URLs like "http://deployed-site.com/" or "http://localhost:5173/".
  // We extract just the pathname so the iframe always loads from the current origin,
  // avoiding cross-origin blocking and ensuring the faded preview actually renders.
  const iframeSrc = (() => {
    if (!selPage) return ''
    try {
      const url = new URL(selPage)
      return url.pathname + url.search + url.hash
    } catch {
      // If it's already a relative path, use as-is
      return selPage
    }
  })()

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Click Heatmap</h1>
          <p className={styles.subtitle}>Visualize where users click on each page</p>
        </div>
        <div className={styles.meta}>
          <span className={`badge badge-click`}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>ads_click</span>
            {clicks.length} clicks
          </span>
        </div>
      </div>

      {/* Page selector */}
      <div className={styles.controls}>
        <label className={styles.label} htmlFor="page-select">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>language</span>
          Page URL
        </label>
        {pagesLoading ? (
          <div className={styles.selectPlaceholder}>Loading pages…</div>
        ) : pages.length === 0 ? (
          <div className={styles.noPages}>
            No click data yet. Interact with the landing page first.
          </div>
        ) : (
          <select
            id="page-select"
            className={styles.select}
            value={selPage}
            onChange={e => setSelPage(e.target.value)}
          >
            {pages.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Canvas */}
      <div className={`${styles.canvasWrap} glass-card`}>
        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'rgba(186,26,26,0.7)' }} />
            High
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'rgba(245,140,0,0.7)' }} />
            Medium
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'rgba(79,70,229,0.5)' }} />
            Low
          </div>
        </div>

        {loading ? (
          <div className={styles.canvasLoading}>
            <div className={styles.spinner} />
            <p>Rendering heatmap…</p>
          </div>
        ) : hasFetched && clicks.length === 0 && selPage ? (
          <div className={styles.canvasEmpty}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--color-outline)' }}>
              local_fire_department
            </span>
            <p>No click data for this page yet.</p>
            <p style={{ fontSize: 13 }}>Open <strong>{selPage}</strong> and start clicking!</p>
          </div>
        ) : (
          <div
            className={`${styles.heatmapScroller} custom-scrollbar`}
            style={{ width: HEATMAP_W, maxWidth: '100%', position: 'relative' }}
          >
            {/* Click count badge */}
            <div className={styles.clickCountBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>ads_click</span>
              {clicks.length} clicks rendered
            </div>
            {/* Iframe error fallback */}
            {iframeStatus === 'error' && (
              <div className={styles.iframeFallback}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>image_not_supported</span>
                Page preview unavailable
              </div>
            )}
            {/* Spacer div — establishes the scrollable height (canvas natural height) */}
            <div style={{ width: HEATMAP_W, height: HEATMAP_H, position: 'relative' }}>
              {/* Faded landing page background (iframe) */}
              {selPage && (
                <iframe 
                  key={selPage}
                  src={iframeSrc}
                  sandbox="allow-same-origin allow-scripts"
                  loading="lazy"
                  onLoad={() => setIframeStatus('loaded')}
                  onError={() => setIframeStatus('error')}
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '1440px', 
                    height: `${Math.ceil(HEATMAP_H / IFRAME_SCALE)}px`,
                    transform: `scale(${IFRAME_SCALE})`, 
                    transformOrigin: 'top left',
                    opacity: iframeStatus === 'loaded' ? 0.4 : 0,
                    filter: 'grayscale(50%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    border: 'none',
                    transition: 'opacity 0.5s ease'
                  }} 
                  title="Heatmap Background"
                />
              )}
              {/* Heatmap canvas overlay */}
              <canvas
                ref={canvasRef}
                width={HEATMAP_W}
                height={HEATMAP_H}
                className={styles.canvas}
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  zIndex: 10, 
                  background: 'transparent', 
                  display: 'block' 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Click list table */}
      {clicks.length > 0 && (
        <div className={`${styles.clickTable} glass-card`}>
          <h3 className={styles.tableTitle}>Raw Click Coordinates</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>X</th>
                <th>Y</th>
                <th>Viewport</th>
              </tr>
            </thead>
            <tbody>
              {clicks.slice(0, 50).map((c, i) => (
                <tr key={i}>
                  <td className={styles.muted}>{i + 1}</td>
                  <td><strong>{c.x}</strong></td>
                  <td><strong>{c.y}</strong></td>
                  <td className={styles.muted}>{c.viewport_width}×{c.viewport_height}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {clicks.length > 50 && (
            <p className={styles.muted} style={{ padding: '12px 16px', fontSize: 13 }}>
              Showing first 50 of {clicks.length} clicks.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

