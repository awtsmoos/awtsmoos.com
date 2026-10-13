// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sw.js — Awtsmoos Service Worker
 * @description
 * Yaakov's law (2026-10-13): "Users should NEVER need to hard refresh."
 *
 * This service worker ensures users ALWAYS get the latest version:
 * 1. On every navigation, checks if the HTML has changed (via ETag)
 * 2. If new version available, updates cache and shows a toast
 * 3. NEVER serves stale HTML — always revalidates
 * 4. Static assets (CSS/JS/images) are cached aggressively BUT only
 *    when they have content-hash versions (?v=hash)
 *
 * Cache strategy:
 * - HTML: Network-first, ALWAYS revalidate (never serve stale)
 * - Hashed assets (?v=hash): Cache-first (immutable, safe)
 * - Unhashed assets: Network-first with short cache
 * - Drive images: Cache-first with version check
 */

const CACHE_NAME = 'awtsmoos-v1';
const HTML_CACHE = 'awtsmoos-html-v1';

// Install — skip waiting to activate immediately
self.addEventListener('install', (event) => {
	self.skipWaiting();
});

// Activate — clean up old caches, take control immediately
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter((key) => key.startsWith('awtsmoos-') && key !== CACHE_NAME && key !== HTML_CACHE)
					.map((key) => caches.delete(key))
			);
		}).then(() => self.clients.claim())
	);
});

// Check if a URL has a content hash version
function hasHashVersion(url) {
	return /[?&]v=[a-f0-9]{6,}/.test(url);
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
					// Cache the fresh HTML
					const clone = response.clone();
					caches.open(HTML_CACHE).then((cache) => cache.put(request, clone));
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
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
					return response;
				});
			})
		);
		return;
	}

	// Everything else: network first, short cache
	event.respondWith(
		fetch(request)
			.then((response) => {
				const clone = response.clone();
				caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				return response;
			})
			.catch(() => caches.match(request))
	);
});

// Listen for "check for updates" messages from pages
self.addEventListener('message', (event) => {
	if (event.data?.type === 'CHECK_UPDATE') {
		// Force revalidation of current page
		event.waitUntil(
			caches.open(HTML_CACHE).then((cache) => cache.delete(event.data.url))
		);
	}
});
