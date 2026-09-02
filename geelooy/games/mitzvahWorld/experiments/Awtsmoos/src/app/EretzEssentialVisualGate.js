// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialVisualGate.js
 * @description Makes rich WebGL and authored terrain prerequisites of gameplay presentation instead of post-play decoration.
 * The Awtsmoos clothes earth and renderer before control enters sight; Awtsmoos.com lets the loader carry waiting,
 * so no flat green meadow impersonates the finished world while genuine texture and shader light are still creating.
 */

/** Hydrates and validates the rich renderer plus at least one authored terrain texture. */
export async function prepareEretzEssentialVisuals(options = {}) {
	const { boot, renderer, signal, terrain } = options;
	throwIfAborted(signal);
	boot?.begin?.('essential-visuals');
	boot?.progress?.('essential-visuals', 0, 2, 'Preparing authored sky and WebGL detail…', 'loading');
	const delegate = await hydrateRenderer(renderer);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 1, 2, 'Binding authored meadow textures…', 'loading');
	const terrainReceipt = await hydrateTerrain(terrain);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 2, 2, 'Authored world ready.', 'ready');
	return Object.freeze({
		renderer: delegate?.backend || renderer?.backend || 'webgl',
		terrainLoaded: terrainReceipt.loaded,
		terrainPhase: terrainReceipt.phase
	});
}

async function hydrateRenderer(renderer) {
	if (!renderer) throw new Error('Essential visual gate requires a renderer.');
	const delegate = typeof renderer.hydrate === 'function'
		? await renderer.hydrate()
		: renderer;
	if (renderer.hydrate && !renderer.delegate && renderer.hydrationState !== 'ready') {
		throw new Error('Rich WebGL renderer was not ready before gameplay presentation.');
	}
	return renderer.delegate || delegate || renderer;
}

async function hydrateTerrain(terrain) {
	if (typeof terrain?.startTextureHydration !== 'function') {
		throw new Error('Essential visual gate requires authored terrain hydration.');
	}
	const receipt = await terrain.startTextureHydration();
	if (!receipt || Number(receipt.loaded || 0) < 1) {
		throw new Error('Authored meadow textures were unavailable before gameplay presentation.');
	}
	return receipt;
}

function throwIfAborted(signal) {
	if (!signal?.aborted) return;
	throw signal.reason || new Error('Mitzvah World visual preparation was aborted.');
}
