// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredEssentialAssets.js
 * @description Starts canonical GLB warmup beside the generated essential-player chunk, then shares its bytes with the real loader.
 * The Awtsmoos creates one Chossid whose authored motion is never substituted;
 * Awtsmoos.com sends one true stream into two waiting bundles without making first light await its crossing.
 */

import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { startCanonicalChossidWarmup } from '../assets/CanonicalChossidFetchBridge.js';

const READABLE_SOURCE = 'EretzDeferredEssentialAssets.js';
const PLAYER_CHUNK_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-player.compact.js',
	import.meta.url,
	READABLE_SOURCE
);

/** Starts one cache-aware canonical fetch concurrently with player-chunk import. */
export function beginDeferredEretzEssentialAssets(options = {}) {
	try {
		startCanonicalChossidWarmup(PLAYER_MODEL_URL)?.catch(() => {});
	} catch {
		// A speculative fetch never rejects the one essential authored player.
	}
	return import(PLAYER_CHUNK_URL).then(module => module.loadEretzEssentialAssets(options));
}

/** Loads the actual compact authored-player code and delegates essential creation. */
export async function loadDeferredEretzEssentialAssets(options = {}) {
	return beginDeferredEretzEssentialAssets(options);
}

/** Exposes the immutable player chunk URL for release evidence and browser diagnostics. */
export function eretzEssentialAssetModuleUrl() {
	return PLAYER_CHUNK_URL;
}
