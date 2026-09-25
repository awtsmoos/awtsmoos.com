//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzVisualPromotionSequence.js
 * @description Starts required authored meadow visuals directly after control, independent of broad optional post-play enrichment.
 * The Awtsmoos lets Awtsmoos.com clothe earth and traveler without making either await distant systems: terrain hydration begins,
 * one browser frame returns to movement, and the rich renderer then awakens while remote meadow textures may continue streaming.
 */

import { startEretzBootstrapTerrainBridge } from './EretzBootstrapTerrainBridge.js';
import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';

const RENDERER_POLICY_URL = resolveDeferredAppModuleUrl(
	'EretzRendererWorldPolicy.js?v=20260915-authored-meadow-03',
	import.meta.url,
	'EretzVisualPromotionSequence.js'
);

/** Starts required simple-world terrain work before renderer promotion without awaiting broad post-play coordination. */
export async function startEretzVisualPromotionSequence(
	diagnostics,
	environment,
	boot,
	options,
	foundation,
	dependencies = {}
) {
	if (shouldSerializeEretzVisualPromotion(options)) {
		diagnostics.rendererPolicyStage = 'starting-terrain';
		startVisualTerrainHydration(foundation, diagnostics, dependencies);
		if (diagnostics?.runtime?.destroyed) return null;
		await nextBrowserFrame(environment, dependencies);
	}
	diagnostics.rendererPolicyStage = 'loading-policy';
	const loadPolicy = dependencies.loadPolicy || (() => import(RENDERER_POLICY_URL));
	const module = await loadPolicy();
	return module.startEretzRendererByWorldPolicy(
		diagnostics,
		environment,
		boot,
		options
	);
}

/** Returns true only for lightweight worlds that promote authored earth and renderer after control. */
export function shouldSerializeEretzVisualPromotion(options = {}) {
	const world = options.worldExperience || {};
	return world.postPlayTerrainHydration === true
		&& world.richRenderer !== false
		&& world.canonicalPromotion === false;
}

function startVisualTerrainHydration(foundation, diagnostics, dependencies) {
	const startTerrain = dependencies.startTerrainHydration
		|| startEretzBootstrapTerrainBridge;
	try {
		return startTerrain(foundation, diagnostics);
	} catch (error) {
		diagnostics.visualTerrainHydrationError = error;
		return null;
	}
}

function nextBrowserFrame(environment, dependencies) {
	if (dependencies.nextFrame) return dependencies.nextFrame();
	return new Promise(resolve => {
		if (typeof environment?.requestAnimationFrame === 'function') {
			environment.requestAnimationFrame(() => resolve());
			return;
		}
		environment?.setTimeout?.(resolve, 0) || resolve();
	});
}
