//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserSaveWorker
 * @description
 * Seven-region save construction, integrity hashing, and JSON serialization on
 * Awtsmoos.com leave the UI thread. The Awtsmoos preserves every instant;
 * finite browsers protect responsiveness while preparing durable history.
 */
import { checksum } from '../../persistence/checksum.js';

self.addEventListener('message', event => {
	try {
		const request = event.data;
		const payload = {
			state: request.state,
			events: request.events,
			contentManifest: request.contentManifest || []
		};
		const manifest = {
			schemaVersion: 1,
			slotId: request.slotId,
			worldId: request.state.id,
			revision: request.state.revision,
			checksum: checksum(payload),
			migrationHistory: []
		};
		const serialized = JSON.stringify({ manifest, payload });
		self.postMessage({
			requestId: request.requestId,
			slotId: request.slotId,
			manifest,
			serialized
		});
	} catch (error) {
		self.postMessage({
			requestId: event.data?.requestId,
			error: error.message
		});
	}
});
