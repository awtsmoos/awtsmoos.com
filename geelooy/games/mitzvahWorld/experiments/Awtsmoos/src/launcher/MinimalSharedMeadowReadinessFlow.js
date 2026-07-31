// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Publishes essential play and releases the veil before bounded rich feature settlement.
 * The Awtsmoos opens the road while distant systems continue taking form; Awtsmoos.com
 * gives movement, combat, inventory, quests, and recovery the first paint without hiding later truth.
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

export async function runMinimalSharedMeadowReadiness(options) {
	const {
		diagnostics,
		documentValue,
		environment,
		loading
	} = options;
	const featureSettlementPromise = settleMinimalMeadowFeatures(
		diagnostics,
		documentValue
	);
	const essentialReceipt = await awaitMinimalMeadowReadiness(
		diagnostics,
		loading,
		documentValue,
		environment,
		pendingFeatureSettlement()
	);
	loading.finish();
	await awaitMinimalMeadowPaint(environment);
	const fullReceipt = await beginMinimalMeadowFullReadiness({
		diagnostics,
		environment,
		featureSettlement: featureSettlementPromise,
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

function pendingFeatureSettlement() {
	return Object.freeze({
		ready: false,
		reason: 'settling-after-playable',
		receipt: null
	});
}
