// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Publishes essential play immediately and leaves full renderer/world settlement asynchronous.
 * The Awtsmoos opens the near road before distant garments finish descending;
 * Awtsmoos.com keeps playable truth, terrain scheduling, paint, and full-quality promises distinct.
 */

import {
	scheduleMinimalMeadowTerrainHydration
} from '../app/MinimalMeadowTerrainHydrationSchedule.js';
import {
	beginMinimalMeadowFullReadiness
} from './MinimalMeadowFullReadiness.js';
import {
	awaitMinimalMeadowReadiness
} from './MinimalMeadowReadiness.js';
import {
	awaitMinimalMeadowPaint,
	settleMinimalMeadowFeatures
} from './MinimalMeadowReadinessSettlement.js';

/**
 * Publishes compact essential play before optional rich feature hydration.
 *
 * @param {object} options Readiness dependencies and runtime diagnostics.
 * @returns {Promise<object>} Frozen essential receipt and continuing full-quality promise.
 */
export async function runMinimalSharedMeadowReadiness(options) {
	const {
		diagnostics,
		documentValue,
		environment,
		loading
	} = options;
	const featureSettlement = await settleMinimalMeadowFeatures(
		diagnostics,
		documentValue
	);
	const essentialReceipt = await awaitMinimalMeadowReadiness(
		diagnostics,
		loading,
		documentValue,
		environment,
		featureSettlement
	);
	const terrainSchedule = scheduleMinimalMeadowTerrainHydration(
		diagnostics.runtime,
		environment
	);
	diagnostics.terrainHydrationSchedule = terrainSchedule;
	loading.finish();
	await awaitMinimalMeadowPaint(environment);
	const fullPromise = beginMinimalMeadowFullReadiness({
		diagnostics,
		environment,
		featureSettlement: Promise.resolve(featureSettlement),
		loading,
		rendererPromise: diagnostics.rendererHydrationPromise
			|| Promise.resolve(null),
		root: documentValue.documentElement,
		runtime: diagnostics.runtime
	});
	return Object.freeze({
		essential: essentialReceipt,
		fullPromise,
		terrainScheduled: Boolean(terrainSchedule)
	});
}
