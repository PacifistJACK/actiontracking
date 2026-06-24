from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timezone

events_bp = Blueprint("events", __name__)


def get_db():
    return current_app.config["DB"]


# ─── POST /api/events ────────────────────────────────────────────────────────
@events_bp.route("/events", methods=["POST", "OPTIONS"])
def track_event():
    """Receive and store a tracking event from the client."""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    db = get_db()
    data = request.get_json(silent=True, force=True)

    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    required = ["session_id", "event_type", "page_url", "timestamp"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    if data["event_type"] not in ("page_view", "click", "scroll"):
        return jsonify({"error": "event_type must be 'page_view', 'click', or 'scroll'"}), 400

    event = {
        "session_id": str(data["session_id"]),
        "event_type": data["event_type"],
        "page_url": str(data["page_url"]),
        "timestamp": str(data["timestamp"]),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Only store coordinates for click events
    if data["event_type"] == "click":
        event["x"] = data.get("x")
        event["y"] = data.get("y")
        event["viewport_width"] = data.get("viewport_width")
        event["viewport_height"] = data.get("viewport_height")

    if "user_agent" in data:
        event["user_agent"] = data["user_agent"]
        
    if "depth" in data:
        event["depth"] = data["depth"]

    result = db.events.insert_one(event)
    return jsonify({"success": True, "id": str(result.inserted_id)}), 201


# ─── GET /api/sessions ───────────────────────────────────────────────────────
@events_bp.route("/sessions", methods=["GET"])
def get_sessions():
    """
    List all sessions with event count, first seen, last seen.
    Supports pagination: ?page=1&limit=20
    Returns: { sessions: [...], total, page, limit }
    """
    db = get_db()

    # Pagination parameters
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(100, max(1, int(request.args.get("limit", 20))))
    except (ValueError, TypeError):
        page, limit = 1, 20

    skip = (page - 1) * limit

    # Count pipeline (for total)
    count_pipeline = [
        {"$group": {"_id": "$session_id"}},
        {"$count": "total"}
    ]
    count_result = list(db.events.aggregate(count_pipeline))
    total = count_result[0]["total"] if count_result else 0

    # Main pipeline with pagination
    pipeline = [
        {
            "$group": {
                "_id": "$session_id",
                "event_count": {"$sum": 1},
                "first_seen": {"$min": "$timestamp"},
                "last_seen": {"$max": "$timestamp"},
                "page_urls": {"$addToSet": "$page_url"},
                "user_agent": {"$first": "$user_agent"}
            }
        },
        {"$sort": {"last_seen": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {
            "$project": {
                "_id": 0,
                "session_id": "$_id",
                "event_count": 1,
                "first_seen": 1,
                "last_seen": 1,
                "page_urls": 1,
                "user_agent": 1,
            }
        },
    ]

    sessions = list(db.events.aggregate(pipeline))
    return jsonify({
        "sessions": sessions,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }), 200


# ─── GET /api/sessions/<session_id> ─────────────────────────────────────────
@events_bp.route("/sessions/<session_id>", methods=["GET"])
def get_session_events(session_id):
    """Return all events for a specific session, ordered by timestamp (user journey)."""
    db = get_db()

    events = list(
        db.events.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", -1)
    )

    if not events:
        return jsonify({"error": "Session not found"}), 404

    return jsonify(events), 200


# ─── GET /api/heatmap?page_url=... ──────────────────────────────────────────
@events_bp.route("/heatmap", methods=["GET"])
def get_heatmap():
    """Return click x/y coordinates for a given page URL (for heatmap visualization)."""
    db = get_db()
    page_url = request.args.get("page_url")

    query = {"event_type": "click", "x": {"$ne": None}, "y": {"$ne": None}}
    if page_url:
        query["page_url"] = page_url

    clicks = list(
        db.events.find(
            query,
            {"_id": 0, "x": 1, "y": 1, "viewport_width": 1, "viewport_height": 1, "page_url": 1, "timestamp": 1}
        ).sort("timestamp", -1).limit(1000)
    )

    return jsonify(clicks), 200


# ─── GET /api/pages ─────────────────────────────────────────────────────────
@events_bp.route("/pages", methods=["GET"])
def get_pages():
    """Return list of distinct page URLs that have click events (for heatmap page selector).
    Excludes internal dashboard routes (/sessions, /heatmap, etc.) which are tracked
    by the analytics script but are not meaningful heatmap targets.
    """
    db = get_db()
    pages = db.events.distinct("page_url", {"event_type": "click"})

    # Dashboard-internal path segments to exclude from heatmap target list.
    DASHBOARD_PATHS = ("/sessions", "/heatmap")

    def is_dashboard_route(url):
        try:
            from urllib.parse import urlparse
            path = urlparse(url).path.rstrip("/")
            # Exclude exact matches and sub-paths like /sessions/tf_abc123
            return any(
                path == p or path.startswith(p + "/")
                for p in DASHBOARD_PATHS
            )
        except Exception:
            return False

    filtered = [p for p in pages if not is_dashboard_route(p)]
    return jsonify(sorted(filtered)), 200


# ─── GET /api/stats ──────────────────────────────────────────────────────────
@events_bp.route("/stats", methods=["GET"])
def get_stats():
    """Return overall analytics stats for the overview dashboard."""
    db = get_db()

    total_events = db.events.count_documents({})
    total_sessions = len(db.events.distinct("session_id"))
    total_clicks = db.events.count_documents({"event_type": "click"})
    total_page_views = db.events.count_documents({"event_type": "page_view"})
    total_pages = len(db.events.distinct("page_url"))

    return jsonify({
        "total_events": total_events,
        "total_sessions": total_sessions,
        "total_clicks": total_clicks,
        "total_page_views": total_page_views,
        "total_pages": total_pages,
    }), 200


# ─── DELETE /api/events ──────────────────────────────────────────────────────
@events_bp.route("/events", methods=["DELETE", "OPTIONS"])
def clear_events():
    """Wipe all events from the database."""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    db = get_db()
    result = db.events.delete_many({})
    return jsonify({"success": True, "deleted_count": result.deleted_count}), 200
