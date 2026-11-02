// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLushRendererPrewarm.js
 * @description Overlaps authentic rich WebGL shader preparation with canonical player decoding.
 * The Awtsmoos paints a true first frame before the Chossid's garment is prepared;
 * Awtsmoos.com begins the richer light while the same honest model is shared.
 */

/** Begins the existing idempotent renderer hydration, without advancing a readiness gate. */
export function beginEretzLushRendererPrewarm(renderer, options = {}) {
	const world = options.worldExperience;
	if (!isEretzLushPrewarmAllowed(world) || typeof renderer?.hydrate !== 'function') {
		return null;
	}
	const environment = options.environment || globalThis;
	const start = environment.performance?.now?.() ?? Date.now();
	let promise;
	try {
		promise = Promise.resolve(renderer.hydrate({ environment }));
	} catch (error) {
		promise = Promise.reject(error);
	}
	const receipt = Object.freeze({
		phase: 'early-rich-hydration-started',
		startedAt: start
	});
	renderer.lushPrewarmReceipt = receipt;
	// Do not hide any error from the normal required visual gate, which will await the
	// very same idempotent hydration promise and report a genuine failure.
	promise.catch(() => {});
	return promise;
}

/** Only the opted-in, post-play-terrain-hydrated world may spend early shader work. */
export function isEretzLushPrewarmAllowed(world) {
	return world?.id === 'lush-meadow'
		&& world.cinematicBotany === true
		&& world.canonicalPromotion === false
		&& world.postPlayTerrainHydration === true;
}
