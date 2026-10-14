// B"H
// Boruch Hashem
/**
 * Awtsmoos feed service worker — Yaakov 2026-10-13 (TRACK D).
 * Scope: /feed/. Simple by design:
 * - /offline/posts/... requests are served from the offline Cache Storage
 *   bucket (written by geelooy/feed/js/offline.js).
 * - Everything else is network-first with a cache fallback, so the feed
 *   shell stays usable on flaky connections.
 */
const SW_CACHE = 'awtsmoos-feed-sw-v1';
const OFFLINE_CACHE = 'awtsmoos-offline-v1';

self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((k) => k !== SW_CACHE && k !== OFFLINE_CACHE && k.startsWith('awtsmoos-feed'))
					.map((k) => caches.delete(k))
			)
		).then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);

	// Saved posts: serve from the offline bucket.
	if (url.pathname.startsWith('/offline/posts/')) {
		event.respondWith(caches.open(OFFLINE_CACHE).then((cache) => cache.match(request)));
		return;
	}

	// Feed scope: network-first, cache fallback.
	if (url.pathname.startsWith('/feed/')) {
		event.respondWith(
			fetch(request).then((res) => {
				if (res && res.ok) {
					const copy = res.clone();
					caches.open(SW_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
				}
				return res;
			}).catch(() => caches.open(SW_CACHE).then((cache) => cache.match(request)))
		);
	}
});
