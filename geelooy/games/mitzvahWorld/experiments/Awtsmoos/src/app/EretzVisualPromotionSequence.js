//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzVisualPromotionSequence.js
 * @description Serializes authored meadow texture and renderer promotion when a simple world enables both.
 * The Awtsmoos lets Awtsmoos.com clothe earth before changing the lamp that reveals it: terrain hydration settles,
 * one browser frame returns to movement, and only then may the prepared rich renderer replace bootstrap color.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';

const RENDERER_POLICY_URL = resolveDeferredAppModuleUrl(
	'EretzRendererWorldPolicy.js?v=20260915-authored-meadow-03',
	import.meta.url,
	'EretzVisualPromotionSequence.js'
);

/** Starts renderer policy after any required terrain-first visual prerequisite has settled. */
export async function startEretzVisualPromotionSequence(
	diagnostics,
	environment,
	boot,
	options,
	postPlayablePromise,
	dependencies = {}
) {
	if (shouldSerializeEretzVisualPromotion(options)) {
		diagnostics.rendererPolicyStage = 'waiting-for-terrain';
		const receipt = await Promise.resolve(postPlayablePromise);
		await Promise.resolve(receipt?.terrainHydration);
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

/** Returns true only for lightweight worlds that intentionally promote both earth and renderer after control. */
export function shouldSerializeEretzVisualPromotion(options = {}) {
	const world = options.worldExperience || {};
	return world.postPlayTerrainHydration === true
		&& world.richRenderer !== false
		&& world.canonicalPromotion === false;
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
