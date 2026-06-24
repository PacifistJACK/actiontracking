# TrackForge — User Analytics Application

> **Live Links:**
> - **Dashboard:** [https://trackforge-dashboard.onrender.com/](https://trackforge-dashboard.onrender.com/)
> - **Backend API:** [https://actiontracking.onrender.com/](https://actiontracking.onrender.com/)

> **CausalFunnel Full Stack Engineer Assignment**  
> Tracks user interactions on a webpage and visualises them in a real-time analytics dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Tracker** | React Hook (`useTracker.js`) |
| **Backend** | Python · Flask · PyMongo |
| **Database** | MongoDB (local or Atlas) |
| **Dashboard** | React 18 · Vite · React Router v6 |
| **Styling** | Tailwind CSS v4 |

---

## Features

### Event Tracking (Client-Side)
- **`useTracker.js`** — lightweight React hook embedded in the demo landing page.
- Tracks **`page_view`**, **`click`** (with x/y coordinates + viewport size), and **`scroll`** depth thresholds (25%, 50%, 75%, 100%).
- Grabs the user's **Device OS and Browser** via the `userAgent`.
- Stores `session_id` in `localStorage`.
- Click throttle protects the backend from spam.

### Backend (Flask API)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/events` | Receive & store a tracking event |
| `GET` | `/api/sessions` | Paginated list of sessions (`?page=1&limit=20`) |
| `GET` | `/api/sessions/:id` | All events for a session (ordered by timestamp) |
| `GET` | `/api/heatmap?page_url=` | Click x/y data for a given page |
| `GET` | `/api/pages` | Distinct page URLs with click data |
| `GET` | `/api/stats` | Overall event/session counts |
| `DELETE` | `/api/events` | Clears all tracking data in the database |
| `GET` | `/health` | Health check + MongoDB ping |

### Dashboard (React)
- **Sessions view** — Sleek table showing event count, newest sessions first, total pages visited, and a parsed **Device/Browser OS** icon column. Includes a "Clear All Data" button.
- **Session detail** — Reverse chronological timeline of all events for one session. Clicks feature precise X/Y data, and scrolls show the exact depth reached with custom visual badges.
- **Heatmap view** — Interactive HTML5 Canvas heatmap overlaying an iframe of the live landing page. Calculates margin-aware offsets for dynamic screen sizes.
- **Dark mode** toggle (persisted in `localStorage`, respects `prefers-color-scheme`)

### Database (MongoDB)
- Collection: `events`
- Indexes on `session_id`, `event_type`, `timestamp`, `page_url` (created on startup)

---

## Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB running locally on port `27017` (or set `MONGO_URI` to an Atlas URI)

---

### 1. Start the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# (Optional) Edit .env for custom MONGO_URI or PORT
# Start server
python app.py
# ✅  Flask server running on http://localhost:4000
```

### 2. Start the Dashboard & Landing Page

```bash
cd dashboard
npm install
npm run dev
# Available at http://localhost:5173
```

The landing page runs at `http://localhost:5173/`. Interact with the dummy content (scroll, click buttons) and then navigate to `http://localhost:5173/sessions` to watch the events appear in the dashboard.

---

## Project Structure

```
assigment_casualfunnel/
├── backend/
│   ├── app.py            # Flask app + Keep-Alive Daemon + MongoDB init
│   ├── routes/
│   │   └── events.py     # All API route handlers
│   ├── requirements.txt
│   └── .env              # MONGO_URI, PORT, CORS_ORIGINS
└── dashboard/
    ├── src/
    │   ├── api.js                    # API client
    │   ├── App.jsx                   # Router + layout
    │   ├── components/Navbar.jsx     # Top nav
    │   ├── hooks/
    │   │   └── useTracker.js         # Client-side tracking logic
    │   └── pages/
    │       ├── Landing.jsx           # Demo webpage with tracker embedded
    │       ├── Sessions.jsx          # Sessions list + device detection
    │       ├── SessionDetail.jsx     # Per-session event timeline
    │       └── Heatmap.jsx           # Margin-aware click heatmap
    └── vite.config.js
```

---

## Assumptions & Trade-offs

- **MongoDB** is used as required. No ORM — raw PyMongo for simplicity and performance.
- **Session ID** is stored in `localStorage` (cookie fallback). No server-side session management.
- **`sendBeacon` + `fetch keepalive`** ensures events are not lost on page unload.
- **Heatmap** normalises click coordinates relative to the visitor's viewport size so dots render proportionally regardless of screen resolution.
- **Pagination** defaults to 20 sessions per page (configurable via `?limit=N`).
- **No authentication** — this is a demo assignment; in production you'd add API keys or JWT.
- **CORS** is open (`*`) in development; restrict via `CORS_ORIGINS` in `.env` for production.
