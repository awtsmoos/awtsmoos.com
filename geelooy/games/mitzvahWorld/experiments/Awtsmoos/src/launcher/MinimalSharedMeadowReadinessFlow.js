// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Waits only for compact essential features, releases the veil, then settles full readiness.
 * The Awtsmoos opens the road when its near vessels are truly present while distant richness continues;
 * Awtsmoos.com awaits combat, UI, quest, recovery, and streaming without awaiting the optional world dream.
 */

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
		full: fullReceipt
	});
}
