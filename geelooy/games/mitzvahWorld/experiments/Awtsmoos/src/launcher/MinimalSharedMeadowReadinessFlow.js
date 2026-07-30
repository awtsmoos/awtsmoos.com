// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Bounds feature settlement, publishes essential play, then settles rich readiness.
 * The Awtsmoos opens the road before every distant garment has descended in light;
 * Awtsmoos.com inspects real vessels after a bounded wait, then names the final state aright.
 */
import { beginMinimalMeadowFullReadiness } from './MinimalMeadowFullReadiness.js';
import { awaitMinimalMeadowReadiness } from './MinimalMeadowReadiness.js';
import {
	awaitMinimalMeadowPaint,
	settleMinimalMeadowFeatures
} from './MinimalMeadowReadinessSettlement.js';

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
		rendererPromise: diagnostics.rendererHydrationPromise || Promise.resolve(null),
		root: documentValue.documentElement,
		runtime: diagnostics.runtime
	});
	return Object.freeze({
		essential: essentialReceipt,
		full: fullReceipt
	});
}
