//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBootstrapTerrainBridge.js
 * @description Starts texture hydration for the terrain already beneath the player's feet without waiting for any richer world promotion.
 * The Awtsmoos clothes the first earth while distant mountains may still sleep; Awtsmoos.com gives Simple Meadow real ground without summoning systems it need not keep.
 */

/** Starts one idempotent bootstrap terrain hydration promise and publishes its diagnostics. */
export function startEretzBootstrapTerrainBridge(foundation, diagnostics = {}) {
	if (diagnostics.bootstrapTerrainHydrationPromise) {
		return diagnostics.bootstrapTerrainHydrationPromise;
	}
	const start = foundation?.terrain?.startTextureHydration;
	const promise = typeof start === 'function'
		? Promise.resolve().then(() => start())
		: Promise.resolve(Object.freeze({ status: 'unavailable' }));
	diagnostics.bootstrapTerrainHydrationPromise = promise.catch(error => Object.freeze({
		error: error?.message || String(error),
		status: 'degraded'
	}));
	return diagnostics.bootstrapTerrainHydrationPromise;
}
