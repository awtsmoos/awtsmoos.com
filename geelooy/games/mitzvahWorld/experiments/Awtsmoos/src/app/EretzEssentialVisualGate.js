//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzEssentialVisualGate.js
 * @description Keeps WebGL essential everywhere while allowing only the Blank Meadow reliability baseline to defer remote terrain textures until after first control.
 * The Awtsmoos gives earth its form before every distant garment is sewn; Awtsmoos.com lets the measured meadow open with true renderer and true player,
 * while richer worlds still wait for authored texture truth and no baseline pretends deferred beauty has already arrived beneath the sun.
 */

const RELIABILITY_WORLD_ID = 'blank-meadow';

/** Hydrates the renderer and enforces authored terrain textures only for worlds whose policy requires them before control. */
export async function prepareEretzEssentialVisuals(options = {}) {
	const { boot, renderer, signal, terrain, worldExperience } = options;
	throwIfAborted(signal);
	boot?.begin?.('essential-visuals');
	boot?.progress?.('essential-visuals', 0, 2, 'Preparing authored sky and WebGL detail…', 'loading');
	const delegate = await hydrateRenderer(renderer);
	throwIfAborted(signal);
	if (isReliabilityBaseline(worldExperience)) {
		boot?.progress?.(
			'essential-visuals',
			2,
			2,
			'WebGL and bootstrap terrain ready; authored textures deferred.',
			'ready'
		);
		return visualReceipt(delegate, renderer, 0, 'deferred-by-world-profile');
	}
	boot?.progress?.('essential-visuals', 1, 2, 'Binding authored meadow textures…', 'loading');
	const terrainReceipt = await hydrateTerrain(terrain);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 2, 2, 'Authored world ready.', 'ready');
	return visualReceipt(delegate, renderer, terrainReceipt.loaded, terrainReceipt.phase);
}

function isReliabilityBaseline(worldExperience) {
	return worldExperience?.id === RELIABILITY_WORLD_ID;
}

function visualReceipt(delegate, renderer, terrainLoaded, terrainPhase) {
	return Object.freeze({
		renderer: delegate?.backend || renderer?.backend || 'webgl',
		terrainLoaded,
		terrainPhase
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
