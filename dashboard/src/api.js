const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

/**
 * Fetch paginated sessions list.
 * @param {number} page  - 1-based page number (default 1)
 * @param {number} limit - items per page (default 20)
 * @returns {Promise<{sessions: Array, total: number, page: number, limit: number, pages: number}>}
 */
export const fetchSessions = (page = 1, limit = 20) =>
  fetch(`${API}/sessions?page=${page}&limit=${limit}`).then(r => r.json())

/**
 * Fetch all events for a single session (user journey).
 * @param {string} id - session_id
 * @returns {Promise<Array>}
 */
export const fetchSession = (id) =>
  fetch(`${API}/sessions/${encodeURIComponent(id)}`).then(r => r.json())

/**
 * Fetch click heatmap data for a page URL.
 * @param {string} url - page URL to filter by
 * @returns {Promise<Array>}
 */
export const fetchHeatmap = (url) =>
  fetch(`${API}/heatmap?page_url=${encodeURIComponent(url)}`).then(r => r.json())

/**
 * Fetch all page URLs that have click events (for the heatmap dropdown).
 * @returns {Promise<Array<string>>}
 */
export const fetchPages = () =>
  fetch(`${API}/pages`).then(r => r.json())

/**
 * Fetch global analytics stats.
 * @returns {Promise<{total_events, total_sessions, total_clicks, total_page_views, total_pages}>}
 */
export const fetchStats = () =>
  fetch(`${API}/stats`).then(r => r.json())

/**
 * Wipe all data from the backend database.
 */
export const clearData = () =>
  fetch(`${API}/events`, { method: 'DELETE' }).then(r => r.json())
