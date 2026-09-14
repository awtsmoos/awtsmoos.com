//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzEssentialVisualGate.js
 * @description Keeps genuine WebGL essential while letting only Blank Meadow defer rich renderer hydration and remote terrain textures until after first control.
 * The Awtsmoos gives the meadow a true luminous vessel before every later garment descends; Awtsmoos.com lets the traveler move through real WebGL now,
 * while richer shader families and authored texture detail arrive through the already-existing post-play covenant without falsifying readiness.
 */

const RELIABILITY_WORLD_ID = 'blank-meadow';

/** Hydrates only the visual work that the selected world must complete before first control. */
export async function prepareEretzEssentialVisuals(options = {}) {
	const { boot, renderer, signal, terrain, worldExperience } = options;
	throwIfAborted(signal);
	boot?.begin?.('essential-visuals');
	if (isReliabilityBaseline(worldExperience)) {
		return prepareReliabilityVisuals(renderer, boot, signal);
	}
	boot?.progress?.('essential-visuals', 0, 2, 'Preparing authored sky and WebGL detail…', 'loading');
	const delegate = await hydrateRichRenderer(renderer);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 1, 2, 'Binding authored meadow textures…', 'loading');
	const terrainReceipt = await hydrateTerrain(terrain);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 2, 2, 'Authored world ready.', 'ready');
	return visualReceipt(delegate, renderer, terrainReceipt.loaded, terrainReceipt.phase, 'rich-ready');
}

function prepareReliabilityVisuals(renderer, boot, signal) {
	const bootstrapRenderer = requireBootstrapWebGl(renderer);
	throwIfAborted(signal);
	boot?.progress?.(
		'essential-visuals',
		2,
		2,
		'Bootstrap WebGL ready; rich renderer and authored terrain textures deferred.',
		'ready'
	);
	return visualReceipt(
		bootstrapRenderer,
		renderer,
		0,
		'deferred-by-world-profile',
		'bootstrap-webgl-ready'
	);
}

function isReliabilityBaseline(worldExperience) {
	return worldExperience?.id === RELIABILITY_WORLD_ID;
}

function requireBootstrapWebGl(renderer) {
	if (!renderer) throw new Error('Essential visual gate requires a renderer.');
	if (renderer.backend !== 'webgl' || !renderer.gl) {
		throw new Error('Blank Meadow requires a genuine bootstrap WebGL renderer before control.');
	}
	return renderer;
}

async function hydrateRichRenderer(renderer) {
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

function visualReceipt(delegate, renderer, terrainLoaded, terrainPhase, rendererPhase) {
	return Object.freeze({
		renderer: delegate?.backend || renderer?.backend || 'webgl',
		rendererPhase,
		terrainLoaded,
		terrainPhase
	});
}

function throwIfAborted(signal) {
	if (!signal?.aborted) return;
	throw signal.reason || new Error('Mitzvah World visual preparation was aborted.');
}
