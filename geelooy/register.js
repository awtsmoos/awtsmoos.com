// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file register.js
 * @description
 * The Awtsmoos renews Awtsmoos.com without repeating yesterday's cleanup on
 * every route. This versioned retirement removes legacy workers, caches, and
 * metadata once, then leaves normal page startup quiet and fast.
 */

const RETIREMENT_VERSION = "geelooy-offline-retirement-2026-07-15";
const RETIREMENT_KEY = "awtsmoos-geelooy-offline-retirement";
const RELOAD_KEY = "awtsmoos-geelooy-offline-reload";
const METADATA_PREFIX = "awtsmoos-metadata-";

/**
 * Retires legacy offline state once for the declared release.
 * @returns {Promise<void>} Completion of safe cleanup.
 */
async function retireLegacyOfflineState() {
	if (readStorage(localStorage, RETIREMENT_KEY) === RETIREMENT_VERSION) {
		return;
	}
	const controlled = Boolean(navigator.serviceWorker?.controller);
	await unregisterWorkers();
	await clearCaches();
	await clearMetadataDatabases();
	writeStorage(localStorage, RETIREMENT_KEY, RETIREMENT_VERSION);
	if (controlled && readStorage(sessionStorage, RELOAD_KEY) !== RETIREMENT_VERSION) {
		writeStorage(sessionStorage, RELOAD_KEY, RETIREMENT_VERSION);
		location.reload();
	}
}

async function unregisterWorkers() {
	if (!("serviceWorker" in navigator)) {
		return;
	}
	const registrations = await navigator.serviceWorker.getRegistrations();
	await Promise.allSettled(registrations.map(registration => registration.unregister()));
}

async function clearCaches() {
	if (!("caches" in globalThis)) {
		return;
	}
	const cacheNames = await caches.keys();
	await Promise.allSettled(cacheNames.map(cacheName => caches.delete(cacheName)));
}

async function clearMetadataDatabases() {
	if (!("indexedDB" in globalThis) || typeof indexedDB.databases !== "function") {
		return;
	}
	const databases = await indexedDB.databases();
	const names = databases.map(database => database.name).filter(name => name?.startsWith(METADATA_PREFIX));
	await Promise.allSettled(names.map(deleteDatabase));
}

function deleteDatabase(databaseName) {
	return new Promise(resolve => {
		const request = indexedDB.deleteDatabase(databaseName);
		request.addEventListener("success", resolve, { once: true });
		request.addEventListener("error", resolve, { once: true });
		request.addEventListener("blocked", resolve, { once: true });
	});
}

function readStorage(storage, key) {
	try {
		return storage.getItem(key);
	} catch {
		return null;
	}
}

function writeStorage(storage, key, value) {
	try {
		storage.setItem(key, value);
	} catch {
		return;
	}
}

retireLegacyOfflineState().catch(() => {
	return;
});
