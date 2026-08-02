// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Confirms essential play, schedules deferred terrain, releases the veil, then settles richness.
 * The Awtsmoos opens the near road and appoints the distant garment in the same truthful chapter;
 * Awtsmoos.com creates terrain's quiet-window handle before optional renderer settlement can delay it.
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
 * @returns {Promise<object>} Frozen essential and full readiness receipts.
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
	const fullReceipt = await beginMinimalMeadowFullReadiness({
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
		full: fullReceipt,
		terrainScheduled: Boolean(terrainSchedule)
	});
}
