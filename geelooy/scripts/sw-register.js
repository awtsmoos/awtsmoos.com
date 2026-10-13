// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sw-register.js — Service Worker auto-registration + build version guard
 * @description
 * Registers the Awtsmoos service worker and checks for updates.
 * Include this script on every page (or inline the registration).
 *
 * Yaakov's law: users NEVER hard-refresh. Two mechanisms enforce it:
 * 1. Service worker: fresh HTML on every navigation, hashed assets cached
 *    immutably, immediate activation (skipWaiting + clients.claim).
 * 2. Build version guard: the app shell is a long-lived SPA — once loaded it
 *    never does a full page load, so a deploy could leave it running stale
 *    code for hours (this is how the old /mav Search route survived a
 *    deploy). Every deploy writes a new build id to /version.json; this
 *    script polls it and gently reloads the tab when it changes.
 */

(function() {
	if (!('serviceWorker' in navigator)) return;

	let swRegistration = null;

	// Register the service worker
	navigator.serviceWorker.register('/sw.js', { scope: '/' })
		.then((registration) => {
			swRegistration = registration;
			// Check for updates on every page load
			registration.update();

			// If a new SW is waiting, activate it immediately
			if (registration.waiting) {
				registration.waiting.postMessage({ type: 'SKIP_WAITING' });
			}

			// Listen for new SW installations
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (!newWorker) return;
				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						// New version available — show toast or auto-reload
						showUpdateToast(() => {
							newWorker.postMessage({ type: 'SKIP_WAITING' });
							window.location.reload();
						});
					}
				});
			});

			// B"H 2026-10-13: long-lived tabs (the app shell SPA) never
			// navigate, so the browser's own SW update check may not run for
			// hours. Poll for SW updates every 5 minutes as well.
			setInterval(() => {
				try { registration.update(); } catch (e) { /* ignore */ }
			}, 5 * 60 * 1000);
		})
		.catch(() => {
			// SW registration failed — not critical, page still works
		});

	// Auto-reload when the SW takes control (new version activated)
	// B"H 2026-10-13: Yaakov — tapping a game card was refreshing the page
	// instead of navigating. Root cause: controllerchange fired mid-navigation
	// and location.reload() cancelled the user's tap. Never reload while the
	// user is navigating away or actively interacting.
	let refreshing = false;
	let userNavigating = false;
	// Mark navigation intent: any link tap or form submit means "don't reload me"
	document.addEventListener('click', (event) => {
		if (event.target && event.target.closest && event.target.closest('a[href], button[type="submit"]')) {
			userNavigating = true;
		}
	}, true);
	window.addEventListener('beforeunload', () => { userNavigating = true; });
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (refreshing || userNavigating) return;
		// Only reload if the page is visible and the user is idle (no recent interaction)
		if (document.visibilityState !== 'visible') return;
		refreshing = true;
		window.location.reload();
	});

	function showUpdateToast(onUpdate) {
		// Create a subtle "New version available" toast
		const toast = document.createElement('div');
		toast.setAttribute('role', 'status');
		toast.style.cssText = [
			'position:fixed', 'bottom:1rem', 'left:50%', 'transform:translateX(-50%)',
			'background:#1a1a2e', 'color:#ffd700', 'padding:0.75rem 1.25rem',
			'border-radius:2rem', 'font-size:0.875rem', 'z-index:999999',
			'box-shadow:0 4px 20px rgba(0,0,0,0.3)', 'cursor:pointer',
			'border:1px solid rgba(255,215,0,0.3)', 'font-family:system-ui'
		].join(';');
		toast.textContent = '✨ New version available — tap to update';
		toast.addEventListener('click', () => {
			toast.remove();
			onUpdate();
		});
		document.body.appendChild(toast);

		// B"H (2026-10-13): NO auto-reload timer. Yaakov reported "weird
		// loading" — yanking the page after 10s while the user is reading
		// is worse than waiting for their tap. The toast stays until tapped
		// or dismissed; any navigation picks up the new version anyway.
	}

	// ------------------------------------------------------------------
	// Build version guard — B"H 2026-10-13 (Yaakov: "fix cache busting way better")
	//
	// Every deploy writes a fresh build id to /version.json. Poll it; when
	// the id changes, this tab is running stale code. Reload gently:
	//   - hidden tab: reload immediately (invisible, safe)
	//   - visible tab: show a toast and reload after 45s of user idleness
	//     (any tap/key/scroll resets the timer); tapping the toast reloads now
	// Never reload-loop: at most one auto-reload per build id, and at most
	// 3 auto-reloads per 10 minutes — beyond that, toast only.
	// ------------------------------------------------------------------
	const VERSION_URL = '/version.json';
	const VERSION_KEY = 'awtsmoos-build';
	const RELOADED_FOR_KEY = 'awtsmoos-reloaded-for';
	const RELOAD_LOG_KEY = 'awtsmoos-reload-log';
	const VERSION_POLL_MS = 60 * 1000;
	const IDLE_RELOAD_MS = 45 * 1000;
	const MAX_AUTO_RELOADS_PER_10MIN = 3;

	let pendingBuild = null;
	let versionToastEl = null;
	let idleTimer = null;

	function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
	function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

	function fetchBuildId() {
		return fetch(VERSION_URL, { cache: 'no-store' })
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => (data && data.build ? String(data.build) : null))
			.catch(() => null);
	}

	function recentReloads() {
		const now = Date.now();
		let log = [];
		try { log = JSON.parse(lsGet(RELOAD_LOG_KEY) || '[]'); } catch (e) { log = []; }
		return log.filter((t) => now - t < 10 * 60 * 1000);
	}

	function checkVersion() {
		fetchBuildId().then((serverBuild) => {
			if (!serverBuild) return;
			const known = lsGet(VERSION_KEY);
			if (!known) { lsSet(VERSION_KEY, serverBuild); return; }
			if (known === serverBuild) return;
			onStaleBuild(serverBuild);
		});
	}

	function onStaleBuild(serverBuild) {
		pendingBuild = serverBuild;
		// Never reload-loop: one auto-reload per build id, capped per 10 min.
		if (lsGet(RELOADED_FOR_KEY) === serverBuild) { showVersionToast(serverBuild); return; }
		if (recentReloads().length >= MAX_AUTO_RELOADS_PER_10MIN) { showVersionToast(serverBuild); return; }
		// Hidden tab: reload immediately — invisible and safe.
		if (document.visibilityState === 'hidden') { doVersionReload(serverBuild); return; }
		showVersionToast(serverBuild);
		armIdleReload();
	}

	function doVersionReload(serverBuild) {
		const log = recentReloads();
		log.push(Date.now());
		lsSet(RELOAD_LOG_KEY, JSON.stringify(log));
		lsSet(RELOADED_FOR_KEY, serverBuild);
		lsSet(VERSION_KEY, serverBuild);
		window.location.reload();
	}

	function armIdleReload() {
		if (idleTimer) clearTimeout(idleTimer);
		idleTimer = setTimeout(() => {
			if (pendingBuild) doVersionReload(pendingBuild);
		}, IDLE_RELOAD_MS);
	}

	// User activity resets the idle-reload timer — never yank mid-interaction.
	['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((ev) => {
		window.addEventListener(ev, () => {
			if (versionToastEl && pendingBuild) armIdleReload();
		}, { passive: true });
	});

	function showVersionToast(serverBuild) {
		if (versionToastEl) return;
		const toast = document.createElement('div');
		toast.setAttribute('role', 'status');
		toast.style.cssText = [
			'position:fixed', 'bottom:1rem', 'left:50%', 'transform:translateX(-50%)',
			'background:#1a1a2e', 'color:#ffd700', 'padding:0.75rem 1.25rem',
			'border-radius:2rem', 'font-size:0.875rem', 'z-index:999999',
			'box-shadow:0 4px 20px rgba(0,0,0,0.3)', 'cursor:pointer',
			'border:1px solid rgba(255,215,0,0.3)', 'font-family:system-ui',
			'max-width:92vw', 'text-align:center'
		].join(';');
		toast.textContent = '✨ New version ready — tap to update now';
		toast.addEventListener('click', () => {
			if (pendingBuild) doVersionReload(pendingBuild);
		});
		document.body.appendChild(toast);
		versionToastEl = toast;
	}

	// Poll for new builds; also check when the tab becomes visible and
	// nudge the service worker to update at the same time.
	setInterval(checkVersion, VERSION_POLL_MS);
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') {
			checkVersion();
			try { if (swRegistration) swRegistration.update(); } catch (e) { /* ignore */ }
		}
	});
	// First check shortly after load (not instantly — let the page settle).
	setTimeout(checkVersion, 5000);
})();
