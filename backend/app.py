import os
import threading
import time
import urllib.request
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING

load_dotenv()

app = Flask(__name__)

# Allow origins from .env CORS_ORIGINS or wildcard in development
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# ─── MongoDB connection ───────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/casualfunnel_analytics")
client = MongoClient(MONGO_URI)

try:
    client.admin.command("ping")
    print("\n🟢 SUCCESS: Connected to MongoDB Atlas!")
except Exception as e:
    print(f"\n🔴 ERROR: Failed to connect to MongoDB. Exception: {e}")

db = client.get_default_database()

# Ensure performance indexes (idempotent — safe to run every startup)
db.events.create_index([("session_id", ASCENDING)])
db.events.create_index([("event_type", ASCENDING)])
db.events.create_index([("timestamp", DESCENDING)])
db.events.create_index([("page_url", ASCENDING)])

# Make db accessible to blueprints
app.config["DB"] = db

from routes.events import events_bp
app.register_blueprint(events_bp, url_prefix="/api")

# ─── Root ─────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return jsonify({"status": "TrackForge Analytics API running", "version": "1.0.0"})

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    try:
        # Ping MongoDB
        client.admin.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return jsonify({"status": "ok", "database": db_status}), 200

def keep_alive_ping():
    time.sleep(10) # Wait for server to fully start
    port = os.getenv("PORT", 4000)
    # Render sets RENDER_EXTERNAL_URL automatically for web services
    url = os.getenv("RENDER_EXTERNAL_URL", f"http://localhost:{port}")
    ping_url = f"{url}/health"
    
    while True:
        try:
            req = urllib.request.Request(ping_url, headers={'User-Agent': 'Render-KeepAlive/1.0'})
            with urllib.request.urlopen(req) as response:
                print(f"🔄 Render Keep-Alive ping successful ({response.getcode()})")
        except Exception as e:
            print(f"⚠️ Render Keep-Alive ping failed: {e}")
        time.sleep(600) # Ping every 10 minutes

# Start the daemon thread globally so it runs under Gunicorn
threading.Thread(target=keep_alive_ping, daemon=True).start()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 4000))
    print(f"✅ Flask server running on http://localhost:{port}")
    app.run(debug=True, port=port, use_reloader=False)
