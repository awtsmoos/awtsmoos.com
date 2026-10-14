// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredEssentialAssets.js
 * @description Loads the generated essential-player runtime chunk after frame and terrain are proven, without walking the raw source-module graph.
 * The Awtsmoos lets visible earth arrive first while the authored traveler waits in one compressed vessel;
 * Awtsmoos.com preserves the real Chossid as essential yet removes dozens of source-module requests from the five-second road,
 * and lets the canonical GLB fetch begin in parallel with renderer and terrain work so travel never waits on a serial chain.
 */

import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

const READABLE_SOURCE = 'EretzDeferredEssentialAssets.js';
const PLAYER_CHUNK_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-player.compact.js',
	import.meta.url,
	READABLE_SOURCE
);

/** Appends a temporary diagnostic breadcrumb to document.title. Removed after diagnosis. */
function traceCrumb(text) { // TEMP-TRACE
	try { // TEMP-TRACE
		if (typeof document !== 'undefined' && document && typeof document.title === 'string') { // TEMP-TRACE
			document.title = `${document.title} | ${text}`; // TEMP-TRACE
		} // TEMP-TRACE
	} catch {} // TEMP-TRACE
} // TEMP-TRACE

/** Starts the generated player-chunk import and canonical Chossid fetch without awaiting it. */
export function beginDeferredEretzEssentialAssets(options = {}) {
	traceCrumb('TRACE: beginDeferred called'); // TEMP-TRACE
	// B"H: warmup disabled 2026-10-13 — testing if it interferes with the loader.
	// warmupCanonicalChossidFetch();
	return import(PLAYER_CHUNK_URL).then(
		module => {
			traceCrumb('TRACE: player chunk imported'); // TEMP-TRACE
			traceCrumb('TRACE: calling loadEretzEssentialAssets'); // TEMP-TRACE
			return module.loadEretzEssentialAssets(options);
		},
		error => {
			traceCrumb(`TRACE: player chunk import FAILED: ${error?.message || error}`); // TEMP-TRACE
			throw error;
		}
	);
}

/**
 * Starts the 2MB canonical GLB download immediately, in parallel with the
 * player-chunk import, instead of serializing the two largest boot downloads.
 * On a cold cache the GLB fetch used to wait for the player chunk to download,
 * parse, and run before the first byte flowed; now both fly at once. The
 * loader's `cache: 'force-cache'` fetch reuses these bytes when it runs.
 * Fire-and-forget: a warmup failure never breaks boot, the loader retries.
 */
function warmupCanonicalChossidFetch() {
	try {
		const fetchFn = globalThis.fetch;
		if (typeof fetchFn !== 'function') return;
		fetchFn(PLAYER_MODEL_URL, {
			cache: 'force-cache',
			credentials: 'omit',
			mode: 'cors'
		}).catch(() => {});
	} catch {}
}

/** Loads the generated canonical-player chunk and delegates essential asset creation. */
export async function loadDeferredEretzEssentialAssets(options = {}) {
	return beginDeferredEretzEssentialAssets(options);
}

/** Exposes the generated player-chunk URL for diagnostics and release proofs. */
export function eretzEssentialAssetModuleUrl() {
	return PLAYER_CHUNK_URL;
}
