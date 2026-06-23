import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE = "http://localhost:4000/api";

function getSessionId() {
  let sid = localStorage.getItem("tf_session_id");
  if (!sid) {
    sid = "tf_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now();
    localStorage.setItem("tf_session_id", sid);
  }
  return sid;
}

const SESSION_ID = getSessionId();

function sendEvent(payload) {
  fetch(API_BASE + "/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(err => console.error("Tracking error:", err));
}

export function useTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    sendEvent({
      session_id: SESSION_ID,
      event_type: "page_view",
      page_url: window.location.origin + location.pathname + location.search,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    });
  }, [location]);

  useEffect(() => {
    // Track clicks globally
    const trackClick = (e) => {
      sendEvent({
        session_id: SESSION_ID,
        event_type: "click",
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        x: e.pageX,
        y: e.pageY,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });
    };

    document.addEventListener("click", trackClick, { passive: true });

    return () => {
      document.removeEventListener("click", trackClick);
    };
  }, []);

  useEffect(() => {
    // Track scroll depth
    const reportedDepths = new Set();
    let scrollTimeout;

    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate max scroll percentage
        const scrollPercent = Math.round(((scrollY + windowHeight) / documentHeight) * 100);
        
        const thresholds = [25, 50, 75, 100];
        thresholds.forEach(threshold => {
          if (scrollPercent >= (threshold - 1) && !reportedDepths.has(threshold)) { // -1 tolerance for 100% rounding issues
            reportedDepths.add(threshold);
            sendEvent({
              session_id: SESSION_ID,
              event_type: "scroll",
              page_url: window.location.href,
              timestamp: new Date().toISOString(),
              depth: threshold
            });
          }
        });
      }, 500); // Throttle 500ms
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [location]);
}
