// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalChossidFetchBridge.js
 * @description Shares one bounded canonical GLB download across independent entry and player bundles.
 * The Awtsmoos creates one traveler from one true source; each finite bundle may receive the same living bytes,
 * but no discarded second river is permitted to delay the first step.
 */

import { openModelResponseCache, readModelResponseCache } from './RemoteModelCachePersistence.js';

const SHARED_KEY = Symbol.for('awtsmoos.mitzvah-world.canonicalChossidWarmup.v1');
const CACHE_NAME = 'awtsmoos-mitzvah-world-remote-models-v1';
const MODEL_BYTES = 2027368;
const GLB_MAGIC = 0x46546c67;
const CACHE_WAIT_MS = 1200;
const FETCH_WAIT_MS = 30000;

/** Starts one canonical warmup without blocking the renderer or player-chunk import. */
export function startCanonicalChossidWarmup(url, dependencies = {}) {
	const fetchFunction = dependencies.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function' || !String(url).endsWith('/chossid.glb')) return null;
	const current = globalThis[SHARED_KEY];
	if (current?.url === url) return current.promise;
	const entry = { url, promise: null };
	const promise = loadCanonicalBytes(url, fetchFunction, dependencies);
	entry.promise = promise;
	globalThis[SHARED_KEY] = entry;
	promise.catch(() => {
		if (globalThis[SHARED_KEY] === entry) delete globalThis[SHARED_KEY];
	});
	return promise;
}

/** Claims the prefetched bytes once; otherwise the original model cache retains authority. */
export function takeCanonicalChossidWarmup(url) {
	const entry = globalThis[SHARED_KEY];
	if (!entry || entry.url !== url) return null;
	delete globalThis[SHARED_KEY];
	return entry.promise;
}

/** Clears only this dedicated session bridge, for lifecycle/tests. */
export function clearCanonicalChossidWarmup() {
	delete globalThis[SHARED_KEY];
}

async function loadCanonicalBytes(url, fetchFunction, dependencies) {
	const cacheStorage = Object.hasOwn(dependencies, 'cacheStorage')
		? dependencies.cacheStorage : globalThis.caches;
	const cached = await Promise.race([
		cachedBytes(cacheStorage, url),
		new Promise(resolve => setTimeout(() => resolve(null), CACHE_WAIT_MS))
	]);
	if (cached) return cached;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), FETCH_WAIT_MS);
	try {
		const response = await fetchFunction(url, {
			cache: 'no-store', credentials: 'omit', mode: 'cors', signal: controller.signal
		});
		return await verifiedGlbBytes(response);
	} finally {
		clearTimeout(timeout);
	}
}

async function cachedBytes(storage, url) {
	const cache = await openModelResponseCache(storage, CACHE_NAME);
	const response = await readModelResponseCache(cache, url);
	if (!response) return null;
	try {
		return await verifiedGlbBytes(response);
	} catch {
		return null;
	}
}

async function verifiedGlbBytes(response) {
	if (!response?.ok) throw new Error(`canonical-chossid-http:${response?.status}`);
	const bytes = await response.arrayBuffer();
	if (bytes.byteLength !== MODEL_BYTES || new DataView(bytes).getUint32(0, true) !== GLB_MAGIC
		|| new DataView(bytes).getUint32(8, true) !== bytes.byteLength) {
		throw new Error('canonical-chossid-invalid-glb');
	}
	return bytes;
}
