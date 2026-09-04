// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file register.js
 * @description
 * The Awtsmoos renews Awtsmoos.com without repeating yesterday's offline cleanup on every route.
 * After that one-time retirement, this same ubiquitous vessel mounts the second universal Torah-chat garment without stale social chrome.
 */

const RETIREMENT_VERSION = "geelooy-offline-retirement-2026-07-15";
const RETIREMENT_KEY = "awtsmoos-geelooy-offline-retirement";
const RELOAD_KEY = "awtsmoos-geelooy-offline-reload";
const METADATA_PREFIX = "awtsmoos-metadata-";
const UNIVERSAL_CHAT_BOOTSTRAP = "/scripts/awtsmoos/social/universalChat/bootstrap.js?v=universal-chat-002";

/** Retires legacy offline state once for the declared release. */
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

/** Mounts the same universal-chat singleton used by the shared shell on standalone routes. */
async function mountUniversalChatFallback() {
	try {
		const module = await import(UNIVERSAL_CHAT_BOOTSTRAP);
		module.mountUniversalChat();
	} catch (error) {
		console.warn("Universal Torah chat fallback could not mount:", error?.message || error);
	}
}

/** Unregisters stale service workers when the browser exposes them. */
async function unregisterWorkers() {
	if (!("serviceWorker" in navigator)) {
		return;
	}
	const registrations = await navigator.serviceWorker.getRegistrations();
	await Promise.allSettled(
		registrations.map((registration) => registration.unregister())
	);
}

/** Deletes every remaining cache from the retired offline generation. */
async function clearCaches() {
	if (!("caches" in globalThis)) {
		return;
	}
	const cacheNames = await caches.keys();
	await Promise.allSettled(
		cacheNames.map((cacheName) => caches.delete(cacheName))
	);
}

/** Deletes only old metadata databases, leaving unrelated IndexedDB data alone. */
async function clearMetadataDatabases() {
	if (!("indexedDB" in globalThis) || typeof indexedDB.databases !== "function") {
		return;
	}
	const databases = await indexedDB.databases();
	const names = databases
		.map((database) => database.name)
		.filter((name) => name?.startsWith(METADATA_PREFIX));
	await Promise.allSettled(names.map(deleteDatabase));
}

/** Resolves regardless of success/error/blocked so cleanup cannot stall page startup. */
function deleteDatabase(databaseName) {
	return new Promise((resolve) => {
		const request = indexedDB.deleteDatabase(databaseName);
		request.addEventListener("success", resolve, { once: true });
		request.addEventListener("error", resolve, { once: true });
		request.addEventListener("blocked", resolve, { once: true });
	});
}

/** Reads storage defensively for private browsing and restricted contexts. */
function readStorage(storage, key) {
	try {
		return storage.getItem(key);
	} catch {
		return null;
	}
}

/** Writes storage defensively without allowing preference failure to break startup. */
function writeStorage(storage, key, value) {
	try {
		storage.setItem(key, value);
	} catch {
		return;
	}
}

retireLegacyOfflineState()
	.catch(() => {})
	.finally(() => mountUniversalChatFallback());
