// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredEssentialAssets.js
 * @description Loads the generated essential-player runtime chunk after frame and terrain are proven, without walking the raw source-module graph.
 * The Awtsmoos lets visible earth arrive first while the authored traveler waits in one compressed vessel;
 * Awtsmoos.com preserves the real Chossid as essential yet removes dozens of source-module requests from the five-second road.
 */

import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';

const READABLE_SOURCE = 'EretzDeferredEssentialAssets.js';
const PLAYER_CHUNK_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-player.compact.js',
	import.meta.url,
	READABLE_SOURCE
);

/** Loads the generated canonical-player chunk and delegates essential asset creation. */
export async function loadDeferredEretzEssentialAssets(options = {}) {
	const module = await import(PLAYER_CHUNK_URL);
	return module.loadEretzEssentialAssets(options);
}

/** Exposes the generated player-chunk URL for diagnostics and release proofs. */
export function eretzEssentialAssetModuleUrl() {
	return PLAYER_CHUNK_URL;
}
