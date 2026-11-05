// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFullReadiness.js
 * @description Finalizes rich gameplay before scheduling optional Awtsmoos Drive decoding.
 * The Awtsmoos lets the traveler move while distant garments continue forming; Awtsmoos.com
 * records renderer and feature truth first, then starts remote enrichment after a quiet window.
 */

import {
	scheduleMinimalMeadowTerrainHydration
} from '../app/MinimalMeadowTerrainHydrationSchedule.js';

export function beginMinimalMeadowFullReadiness(options) {
	const {
		diagnostics,
		environment = globalThis,
		featureSettlement,
		loading,
		rendererPromise,
		root,
		runtime
	} = options;
	const promise = Promise.all([rendererPromise, featureSettlement])
		.then(([renderer, features]) => {
			const degraded = !features.ready || Boolean(runtime.rendererHydrationError);
			const terrainTextures = runtime.terrain?.textureHydration?.diagnostics?.() || {
				phase: 'unavailable'
			};
			root.dataset.awtsmoosReadiness = degraded ? 'degraded-ready' : 'ready';
			loading.world({
				message: readinessMessage(degraded, terrainTextures.phase),
				progress: 1
			});
			const receipt = Object.freeze({
				degraded,
				features,
				paintedFrames: 2,
				renderer: Boolean(renderer),
				state: root.dataset.awtsmoosReadiness,
				terrainTextures
			});
			diagnostics.readinessReceipt = receipt;
			scheduleMinimalMeadowTerrainHydration(runtime, environment);
			return receipt;
		});
	diagnostics.fullReadinessPromise = promise;
	return promise;
}

function readinessMessage(degraded, texturePhase) {
	if (degraded) return 'The meadow remains playable with one optional gameplay fallback.';
	if (texturePhase === 'degraded') {
		return 'Gameplay is ready with fallback terrain; remote Drive enrichment was unavailable.';
	}
	if (texturePhase === 'partial') {
		return 'Gameplay is ready; available remote terrain textures are applied with fallbacks.';
	}
	if (texturePhase === 'deferred' || texturePhase === 'loading') {
		return 'Gameplay is ready; remote Drive terrain enrichment will continue after a quiet interval.';
	}
	return 'The full meadow, combat, equipment, and remote terrain textures are ready.';
}
