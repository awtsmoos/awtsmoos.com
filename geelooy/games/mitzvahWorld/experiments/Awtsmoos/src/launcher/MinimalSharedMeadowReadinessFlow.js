//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Keeps the loading veil until first-play reality has painted and passed visible readiness.
 * The Awtsmoos opens the near road only when the authored traveler and earth are truly seen; Awtsmoos.com keeps
 * optional richness asynchronous without ever revealing an empty HUD shell beneath a prematurely dismissed loader.
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

/** Releases the loading veil only after painted, visibly playable essential reality is proven. */
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
	loading?.stage?.('paint', 'Painting the authored Chossid and meadow before first control.');
	await awaitMinimalMeadowPaint(environment);
	const essentialReceipt = await awaitMinimalMeadowReadiness(
		diagnostics,
		loading,
		documentValue,
		environment,
		featureSettlement
	);
	loading.finish();
	const terrainSchedule = scheduleMinimalMeadowTerrainHydration(
		diagnostics.runtime,
		environment
	);
	diagnostics.terrainHydrationSchedule = terrainSchedule;
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
