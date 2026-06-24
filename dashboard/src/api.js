const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

/**
 * Wrapper around fetch with timeout and error handling.
 */
async function request(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000) // 12s timeout

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Server error (${res.status})`)
    }

    return res.json()
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out — is the backend running?')
    }
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot reach server — make sure the backend is running on port 4000.')
    }
    throw err
  }
}

/**
 * Fetch paginated sessions list.
 * @param {number} page  - 1-based page number (default 1)
 * @param {number} limit - items per page (default 20)
 * @returns {Promise<{sessions: Array, total: number, page: number, limit: number, pages: number}>}
 */
export const fetchSessions = (page = 1, limit = 20) =>
  request(`${API}/sessions?page=${page}&limit=${limit}`)

/**
 * Fetch all events for a single session (user journey).
 * @param {string} id - session_id
 * @returns {Promise<Array>}
 */
export const fetchSession = (id) =>
  request(`${API}/sessions/${encodeURIComponent(id)}`)

/**
 * Fetch click heatmap data for a page URL.
 * @param {string} url - page URL to filter by
 * @returns {Promise<Array>}
 */
export const fetchHeatmap = (url) =>
  request(`${API}/heatmap?page_url=${encodeURIComponent(url)}`)

/**
 * Fetch all page URLs that have click events (for the heatmap dropdown).
 * @returns {Promise<Array<string>>}
 */
export const fetchPages = () =>
  request(`${API}/pages`)

/**
 * Fetch global analytics stats.
 * @returns {Promise<{total_events, total_sessions, total_clicks, total_page_views, total_pages}>}
 */
export const fetchStats = () =>
  request(`${API}/stats`)

/**
 * Wipe all data from the backend database.
 */
export const clearData = () =>
  request(`${API}/events`, { method: 'DELETE' })
