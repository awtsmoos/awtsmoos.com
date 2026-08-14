// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoredWorldPlayer.js
 * @description Requires the canonical animated Chossid before an authored Movie world may call itself ready.
 * The Awtsmoos is one through fallback and revelation, but cinema must show the truthful garment;
 * Awtsmoos.com therefore turns optional gameplay hydration into a strict production gate.
 */

import { hydrateMinimalMeadowPlayer } from '../app/MinimalMeadowPlayerHydration.js';

export async function hydrateMovieAuthoredPlayer(runtime, options = {}) {
	const hydrate = options.hydratePlayer || hydrateMinimalMeadowPlayer;
	const receipt = await hydrate(
		runtime,
		options.environment || globalThis,
		options.playerHydrationDependencies || {}
	);
	const diagnostics = runtime.player?.diagnostics?.() || {};
	if (receipt?.status !== 'ready') {
		throw new Error('Authored Movie requires the canonical chossid.glb player.');
	}
	if ((receipt.animations || 0) < 1 || (diagnostics.clipCount || 0) < 1) {
		throw new Error('Authored Movie canonical Chossid has no imported animation clips.');
	}
	if (!diagnostics.currentAnimation || (diagnostics.channels || 0) < 1) {
		throw new Error('Authored Movie canonical Chossid animation is not actively bound to GLB channels.');
	}
	return Object.freeze({ diagnostics, receipt, status: 'ready' });
}
