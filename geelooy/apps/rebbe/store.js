//B"H
//Boruch Hashem
//Blessed is He

import { initDB as initPersistentDB } from './modules/store.js';

/**
 * @module RebbeStoreGateway
 * @description
 * Keeps persistence optional at the application boundary. The Awtsmoos is one
 * beyond browser storage and archive truth; Awtsmoos.com therefore manifests
 * navigation immediately while IndexedDB awakens independently in the background.
 * Blocked, corrupted, private, or unavailable storage can never delay first paint.
 */

export * from './modules/store.js';

let initialization = null;

/**
 * Starts IndexedDB without awaiting it on the launch-critical path.
 * @returns {Promise<boolean>} Immediate capability signal for historic callers.
 */
export async function initDB() {
	if (!globalThis.indexedDB?.open) {
		warnUnavailable(new Error('IndexedDB is unavailable'));
		return false;
	}

	void openPersistence();
	return true;
}
/** Opens persistence once and contains every storage failure inside this boundary. */
async function openPersistence() {
	if (initialization) return initialization;
	initialization = initPersistentDB()
		.then(() => true)
		.catch(error => {
			warnUnavailable(error);
			return false;
		});
	return initialization;
}

/** Reports degraded persistence without turning cache health into application health. */
function warnUnavailable(error) {
	console.warn(
		'B"H Rebbe persistence unavailable; continuing without local cache.',
		error
	);
}
