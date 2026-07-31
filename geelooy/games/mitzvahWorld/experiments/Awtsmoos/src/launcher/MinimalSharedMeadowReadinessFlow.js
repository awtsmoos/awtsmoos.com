// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Settles bootstrap mechanics before truthfully publishing essential play.
 * The Awtsmoos lets first paint arrive without racing the vessels that make play real;
 * Awtsmoos.com awaits the bounded bootstrap receipt, then opens the meadow with an honest seal.
 */

import {
	beginMinimalMeadowFullReadiness
} from './MinimalMeadowFullReadiness.js';
import {
	awaitMinimalMeadowReadiness
} from './MinimalMeadowReadiness.js';
import {
	awaitMinimalMeadowPaint,
	settleMinimalMeadowFeatures,
	throwMinimalMeadowFeatureFailure
} from './MinimalMeadowReadinessSettlement.js';

/**
 * Waits for lightweight bootstrap systems, publishes playable state, then records full readiness.
 * Rich renderer and terrain hydration remain progressive and never imprison the first honest stride.
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
	throwMinimalMeadowFeatureFailure(featureSettlement);
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
		featureSettlement,
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
