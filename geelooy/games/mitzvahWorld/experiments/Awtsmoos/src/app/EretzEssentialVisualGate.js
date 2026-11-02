// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialVisualGate.js
 * @description Requires real player-rendering WebGL before Lush Meadow play; defers ornamental terrain assets.
 * The Awtsmoos lights a living traveler before the distant mountains receive their glow;
 * Awtsmoos.com protects the first true image while richer roots and waters grow.
 */

const RELIABILITY_WORLD_ID = 'blank-meadow';
const PROGRESSIVE_WORLD_ID = 'lush-meadow';

/** Proves actual WebGL readiness while avoiding ornamental texture hydration in first play. */
export async function prepareEretzEssentialVisuals(options = {}) {
	const { boot, renderer, signal, terrain, worldExperience } = options;
	throwIfAborted(signal);
	boot?.begin?.('essential-visuals');
	if (isProgressiveVisualWorld(worldExperience)) {
		return worldExperience?.id === PROGRESSIVE_WORLD_ID
			? prepareLushPlayableVisuals(renderer, boot, signal)
			: prepareBootstrapVisuals(renderer, boot, signal);
	}
	boot?.progress?.('essential-visuals', 0, 2,
		'Preparing authored sky and WebGL detail…', 'loading');
	const delegate = await hydrateRichRenderer(renderer);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 1, 2,
		'Binding authored meadow textures…', 'loading');
	const terrainReceipt = await hydrateTerrain(terrain);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 2, 2, 'Authored world ready.', 'ready');
	return visualReceipt(delegate, renderer, terrainReceipt.loaded, terrainReceipt.phase, 'rich-ready');
}

/** Only explicitly elected Lush Meadow may defer scenic textures while keeping real player rendering. */
export function isProgressiveVisualWorld(worldExperience) {
	if (worldExperience?.id === RELIABILITY_WORLD_ID) return true;
	return worldExperience?.id === PROGRESSIVE_WORLD_ID
		&& worldExperience.cinematicBotany === true
		&& worldExperience.canonicalPromotion === false
		&& worldExperience.postPlayTerrainHydration === true;
}

/** Rich player renderer is indispensable for visible Lush Meadow gameplay. */
async function prepareLushPlayableVisuals(renderer, boot, signal) {
	requireBootstrapWebGl(renderer);
	boot?.progress?.('essential-visuals', 0, 2,
		'Awakening the authentic Chossid and playable WebGL world…', 'loading');
	const delegate = await hydrateRichRenderer(renderer);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 2, 2,
		'Character renderer ready; scenic terrain textures enrich the world after play.', 'ready');
	return visualReceipt(delegate, renderer, 0,
		'deferred-by-world-profile', 'playable-renderer-ready');
}

/** Preserve Blank Meadow's original minimal creator world, including its genuine WebGL gate. */
function prepareBootstrapVisuals(renderer, boot, signal) {
	const bootstrap = requireBootstrapWebGl(renderer);
	throwIfAborted(signal);
	boot?.progress?.('essential-visuals', 2, 2,
		'Bootstrap WebGL ready; rich shaders and ground textures stream after play.', 'ready');
	return visualReceipt(bootstrap, renderer, 0,
		'deferred-by-world-profile', 'bootstrap-webgl-ready');
}

function requireBootstrapWebGl(renderer) {
	if (!renderer) throw new Error('Essential visual gate requires a renderer.');
	if (renderer.backend !== 'webgl' || !renderer.gl) {
		throw new Error('Fast-start world requires a genuine bootstrap WebGL renderer before control.');
	}
	return renderer;
}

/** Hydration of an actual renderer is a drawable-player boundary, never a fake spinner. */
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
	if (signal?.aborted) throw signal.reason || new Error('Mitzvah World visual preparation was aborted.');
}
