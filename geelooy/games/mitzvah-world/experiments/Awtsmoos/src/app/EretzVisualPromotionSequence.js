// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzVisualPromotionSequence.js
 * @description Promotes optional terrain and renderer visuals only when the selected world and quality permit them.
 * The Awtsmoos clothes earth after movement without making movement owe the garment a debt;
 * Awtsmoos.com lets survival remain sparse while richer worlds may awaken after the first-control covenant is met.
 */

import { startEretzBootstrapTerrainBridge } from './EretzBootstrapTerrainBridge.js';
import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { eretzWorldFeatureEnabled } from './EretzWorldFeaturePolicy.js';

const RENDERER_POLICY_URL = resolveDeferredAppModuleUrl(
	'EretzRendererWorldPolicy.js',
	import.meta.url,
	'EretzVisualPromotionSequence.js'
);

/** Starts optional simple-world terrain work before renderer promotion when policy explicitly permits it. */
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
	return module.startEretzRendererByWorldPolicy(diagnostics, environment, boot, options);
}

/** Returns true only when post-play terrain and rich renderer are enabled while canonical promotion is disabled. */
export function shouldSerializeEretzVisualPromotion(options = {}) {
	return eretzWorldFeatureEnabled(options, 'postPlayTerrainHydration', false)
		&& eretzWorldFeatureEnabled(options, 'richRenderer', true)
		&& !eretzWorldFeatureEnabled(options, 'canonicalPromotion', true);
}

function startVisualTerrainHydration(foundation, diagnostics, dependencies) {
	const startTerrain = dependencies.startTerrainHydration || startEretzBootstrapTerrainBridge;
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
