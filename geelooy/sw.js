// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sw.js — Awtsmoos Service Worker
 * @description
 * Yaakov's law (2026-10-13): "Users should NEVER need to hard refresh."
 *
 * This service worker ensures users ALWAYS get the latest version:
 * 1. Activates immediately on install (skipWaiting) and takes control (clients.claim)
 * 2. On activate, deletes EVERY old cache except the two current ones
 * 3. HTML: network-first, ALWAYS revalidate — never serves stale HTML
 * 4. Hashed assets (?v=hash): cache-first (immutable, safe)
 * 5. Unhashed assets: network-first; only successful responses are cached
 * 6. Drive images without a hash: never cached in the SW (network-only)
 *
 * Companion: sw-register.js polls /version.json so long-lived tabs
 * (the app shell SPA) reload gently when a deploy ships new code.
 */

const CACHE_NAME = 'awtsmoos-v3';
const HTML_CACHE = 'awtsmoos-html-v3';

// Install — skip waiting to activate immediately
self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

// Activate — nuke every stale cache, then take control immediately.
// B"H 2026-10-13 (Yaakov: "fix cache busting way better"): previously only
// caches with the awtsmoos- prefix were cleaned. Now anything that is not
// one of the two current caches is deleted, so no stale bucket can survive
// an update.
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then((keys) => Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME && key !== HTML_CACHE)
					.map((key) => caches.delete(key))
			))
			.then(() => self.clients.claim())
	);
});

// Check if a URL has a content hash version
function hasHashVersion(url) {
	return /[?&]v=[a-f0-9]{6,}/.test(url);
}

// Check if this is a Drive public URL
function isDriveUrl(url) {
	return url.includes('/api/social/drive/public/');
}

// Check if this is an HTML page request
function isHtmlRequest(request) {
	return request.mode === 'navigate' ||
		(request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Only handle same-origin requests
	if (url.origin !== self.location.origin) return;

	// HTML pages: NETWORK FIRST, always revalidate
	// This is the key — users NEVER get stale HTML
	if (isHtmlRequest(request)) {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Cache the fresh HTML — but never cache error pages
					if (response.ok) {
						const clone = response.clone();
						caches.open(HTML_CACHE).then((cache) => cache.put(request, clone));
					}
					return response;
				})
				.catch(() => {
					// Offline fallback: serve cached HTML
					return caches.match(request);
				})
		);
		return;
	}

	// Hashed static assets: CACHE FIRST (immutable)
	if (hasHashVersion(url.href)) {
		event.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached;
				return fetch(request).then((response) => {
					if (response.ok) {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
					}
					return response;
				});
			})
		);
		return;
	}

	// Drive URLs WITHOUT a hash version: NEVER cache in the SW.
	// They are served with immutable 1-year cache headers; if the file is
	// replaced in-place, the SW cache would serve the stale copy forever.
	// Let the browser HTTP cache handle them (it respects the version param
	// once bustDriveCaches.mjs adds it). Network-only, no SW caching.
	if (isDriveUrl(url.href) && !hasHashVersion(url.href)) {
		event.respondWith(fetch(request));
		return;
	}

	// Everything else: network first, short cache (successful responses only)
	event.respondWith(
		fetch(request)
			.then((response) => {
				if (response.ok) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				}
				return response;
			})
			.catch(() => caches.match(request))
	);
});

self.addEventListener('message', (event) => {
	// B"H 2026-10-13: sw-register.js posts SKIP_WAITING when a new worker is
	// waiting. Previously no handler existed, so the message was dropped and
	// the new worker sat in "waiting" until every tab closed. Handle it.
	if (event.data?.type === 'SKIP_WAITING') {
		event.waitUntil(self.skipWaiting());
		return;
	}
	if (event.data?.type === 'CHECK_UPDATE') {
		// Force revalidation of current page
		event.waitUntil(
			caches.open(HTML_CACHE).then((cache) => cache.delete(event.data.url))
		);
	}
});
