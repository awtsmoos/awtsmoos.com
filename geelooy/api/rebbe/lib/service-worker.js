//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeServiceWorker
 * @description
 * Source of the service worker for the Rebbe bundle pages (served at
 * /api/rebbe/sw.js, scope /api/rebbe/). Its only job is notifications:
 * the bundle page shows conversion progress / completion / error
 * notifications through the registration while the user is elsewhere,
 * and this worker handles the click - focusing the bundle page if one
 * is open, opening it otherwise. It deliberately has NO fetch handler:
 * page loads, manifest fetches and Archive.org downloads are never
 * intercepted.
 */

/* eslint-disable no-undef */
function rebbeServiceWorkerMain() {
	'use strict';
	self.addEventListener('install', () => { self.skipWaiting(); });
	self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
	self.addEventListener('notificationclick', event => {
		const target = (event.notification.data && event.notification.data.url) || '/api/rebbe/bundle/page';
		event.notification.close();
		event.waitUntil((async () => {
			const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
			for (const client of windows) {
				if (client.url.indexOf('/api/rebbe/bundle/page') !== -1 && 'focus' in client) {
					if (client.url !== target && client.navigate) {
						try { await client.navigate(target); } catch (e) {}
					}
					return client.focus();
				}
			}
			return self.clients.openWindow(target);
		})());
	});
}
/* eslint-enable no-undef */

const SERVICE_WORKER_JS = "(" + rebbeServiceWorkerMain.toString() + ")();\n";

module.exports = { SERVICE_WORKER_JS };
