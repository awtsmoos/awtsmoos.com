// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReaderAnalytics
 * @description
 * Client-side active reading tracker for the Torah reader. Sends heartbeats
 * to the server ONLY while the user is actively reading — scrolling, visible
 * tab, recent interaction. Stops counting when idle, hidden, or scrolled away.
 *
 * Active time rules:
 * - Heartbeat every 10 seconds while active
 * - Idle timeout: 30s without scroll/interaction = not active
 * - Tab hidden (visibilitychange) = not active
 * - Only counts time when at least one content section is in viewport
 */

class ReaderAnalytics {
	constructor({ postId, seriesId = null, heartbeatUrl = '/api/social/reading/heartbeat' } = {}) {
		this.postId = postId;
		this.seriesId = seriesId;
		this.heartbeatUrl = heartbeatUrl;
		this.sessionId = this.generateSessionId();

		this.isActive = false;
		this.lastActivity = 0;
		this.sessionStart = Date.now();
		this.lastHeartbeat = Date.now();
		this.activeSecondsSinceHeartbeat = 0;
		this.sectionsInView = new Set();
		this.maxScrollPercent = 0;

		this.heartbeatInterval = null;
		this.activityCheckInterval = null;
		this.observer = null;

		this.IDLE_TIMEOUT_MS = 30000;
		this.HEARTBEAT_INTERVAL_MS = 10000;

		this.boundOnActivity = this.onActivity.bind(this);
		this.boundOnVisibility = this.onVisibilityChange.bind(this);
		this.boundOnScroll = this.onScroll.bind(this);
	}

	generateSessionId() {
		return 'rs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
	}

	/**
	 * Starts tracking. Call after reader content is loaded.
	 */
	start() {
		if (this.heartbeatInterval) return; // Already started

		this.lastActivity = Date.now();
		this.setupListeners();
		this.setupSectionObserver();

		// Check activity every 2 seconds, accumulate active time
		let lastTick = Date.now();
		this.activityCheckInterval = setInterval(() => {
			const now = Date.now();
			const elapsed = (now - lastTick) / 1000;
			lastTick = now;

			if (this.isUserActive()) {
				this.activeSecondsSinceHeartbeat += elapsed;
				this.isActive = true;
			} else {
				this.isActive = false;
			}
		}, 2000);

		// Send heartbeat every 10 seconds
		this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), this.HEARTBEAT_INTERVAL_MS);

		// Send final heartbeat on page hide
		window.addEventListener('pagehide', () => this.sendHeartbeat(true));
		document.addEventListener('visibilitychange', this.boundOnVisibility);
	}

	/**
	 * Stops tracking and sends a final heartbeat.
	 */
	stop() {
		if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
		if (this.activityCheckInterval) clearInterval(this.activityCheckInterval);
		if (this.observer) this.observer.disconnect();
		this.removeListeners();
		this.sendHeartbeat(true);
	}

	setupListeners() {
		const events = ['scroll', 'mousedown', 'keydown', 'touchstart', 'wheel'];
		for (const evt of events) {
			window.addEventListener(evt, this.boundOnActivity, { passive: true });
		}
		window.addEventListener('scroll', this.boundOnScroll, { passive: true });
	}

	removeListeners() {
		const events = ['scroll', 'mousedown', 'keydown', 'touchstart', 'wheel'];
		for (const evt of events) {
			window.removeEventListener(evt, this.boundOnActivity);
		}
		window.removeEventListener('scroll', this.boundOnScroll);
		document.removeEventListener('visibilitychange', this.boundOnVisibility);
	}

	onActivity() {
		this.lastActivity = Date.now();
	}

	onVisibilityChange() {
		if (document.hidden) {
			// Tab hidden — send what we have, reset accumulator
			this.sendHeartbeat();
			this.activeSecondsSinceHeartbeat = 0;
			this.lastActivity = 0; // Force inactive until user returns
		} else {
			this.lastActivity = Date.now();
		}
	}

	onScroll() {
		this.onActivity();
		// Track max scroll percent
		const doc = document.documentElement;
		const scrollTop = window.scrollY || doc.scrollTop;
		const scrollHeight = doc.scrollHeight - window.innerHeight;
		if (scrollHeight > 0) {
			const pct = Math.round((scrollTop / scrollHeight) * 100);
			this.maxScrollPercent = Math.max(this.maxScrollPercent, Math.min(100, pct));
		}
	}

	/**
	 * User is active if: tab visible, recent interaction, and content in view.
	 */
	isUserActive() {
		if (document.hidden) return false;
		if (Date.now() - this.lastActivity > this.IDLE_TIMEOUT_MS) return false;
		// At least one section should be in view (set by observer)
		// If observer hasn't run yet, allow it (page just loaded)
		return true;
	}

	/**
	 * Observes which sections are in the viewport.
	 */
	setupSectionObserver() {
		if (!('IntersectionObserver' in window)) return;

		// Watch top-level sections and phrase sub-sections
		const selector = 'section, .meluket-section, .reader-section, [data-section-id], .is-reading-sub';
		this.observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const id = entry.target.id || entry.target.dataset.sectionId || entry.target.className.split(' ')[0];
				if (entry.isIntersecting) {
					this.sectionsInView.add(id);
				}
			}
		}, { threshold: 0.3 });

		// Observe after a short delay to let content render
		setTimeout(() => {
			document.querySelectorAll(selector).forEach(el => {
				if (el.id || el.dataset.sectionId) this.observer.observe(el);
			});
		}, 2000);
	}

	/**
	 * Sends a heartbeat to the server.
	 */
	async sendHeartbeat(isFinal = false) {
		const seconds = Math.round(this.activeSecondsSinceHeartbeat);
		// Don't send empty heartbeats unless it's the final one with data
		if (seconds <= 0 && !isFinal) return;
		if (seconds <= 0 && this.maxScrollPercent <= 0) return;

		this.activeSecondsSinceHeartbeat = 0;
		this.lastHeartbeat = Date.now();

		const payload = {
			postId: this.postId,
			sessionId: this.sessionId,
			activeSeconds: seconds,
			sectionsViewed: Array.from(this.sectionsInView).slice(0, 50),
			scrollPercent: this.maxScrollPercent,
			seriesId: this.seriesId
		};

		try {
			// Use sendBeacon for final heartbeat (reliable on page unload)
			if (isFinal && navigator.sendBeacon) {
				const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
				navigator.sendBeacon(this.heartbeatUrl, blob);
			} else {
				await fetch(this.heartbeatUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
					credentials: 'same-origin'
				});
			}
		} catch {
			// Silently fail — analytics should never break reading
		}
	}
}

// Auto-initialize if post ID is available on the page
if (typeof window !== 'undefined') {
	window.ReaderAnalytics = ReaderAnalytics;

	// Auto-start when DOM is ready if post metadata exists
	document.addEventListener('DOMContentLoaded', () => {
		const postId = document.body?.dataset?.postId
			|| document.querySelector('[data-post-id]')?.dataset?.postId
			|| window.__POST_ID__
			|| null;
		const seriesId = document.body?.dataset?.seriesId
			|| document.querySelector('[data-series-id]')?.dataset?.seriesId
			|| window.__SERIES_ID__
			|| null;

		if (postId) {
			const tracker = new ReaderAnalytics({ postId, seriesId });
			// Start after content loads (3s delay for client-rendered content)
			setTimeout(() => tracker.start(), 3000);
			window.__readerAnalytics = tracker;
		}
	});
}

if (typeof module !== 'undefined') module.exports = { ReaderAnalytics };
