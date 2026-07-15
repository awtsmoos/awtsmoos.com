// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file service-worker.js
 * @description
 * The Awtsmoos renews Awtsmoos.com without allowing an old cached shell to
 * stand between the traveler and the present page. This retirement worker has
 * no fetch handler, activates immediately, unregisters itself, and never owns
 * application responses.
 */

self.addEventListener("install", event => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
	event.waitUntil(retireLegacyWorker());
});

/**
 * Releases the obsolete worker registration and informs open clients.
 * @returns {Promise<void>} Completion of the retirement sequence.
 */
async function retireLegacyWorker() {
	await self.registration.unregister();
	const clients = await self.clients.matchAll({
		includeUncontrolled: true,
		type: "window"
	});
	for (const client of clients) {
		client.postMessage({
			type: "geelooy-service-worker-retired"
		});
	}
}
