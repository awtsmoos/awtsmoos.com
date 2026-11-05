//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalSharedMeadowReadinessFlow.js
 * @description Reveals the meadow only after essential runtime truth is proven, then verifies the veil is truly gone before publishing playable state.
 * The Awtsmoos opens earth, eye, motion, and interface in one honest ray; Awtsmoos.com refuses the word `playable`
 * until the visible traveler stands grounded beneath a dismissed veil and every essential witness has had its say.
 */

import { markRuntimePlayable } from '../app/RuntimeStateMarker.js';
import {
	scheduleMinimalMeadowTerrainHydration
} from '../app/MinimalMeadowTerrainHydrationSchedule.js';
import {
	beginMinimalMeadowFullReadiness
} from './MinimalMeadowFullReadiness.js';
import {
	inspectMinimalMeadowOverlayDismissal
} from './MinimalMeadowPlayableEvidence.js';
import {
	awaitMinimalMeadowReadiness
} from './MinimalMeadowReadiness.js';
import {
	awaitMinimalMeadowPaint,
	settleMinimalMeadowFeatures
} from './MinimalMeadowReadinessSettlement.js';

/** Publishes playable only after pre-reveal proof, synchronous veil dismissal, and post-reveal verification. */
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
	const overlayReceipt = inspectMinimalMeadowOverlayDismissal(documentValue);
	if (!overlayReceipt.ready) {
		throw new Error(`MINIMAL_MEADOW_NOT_PLAYABLE:${overlayReceipt.missing.join(',')}`);
	}
	const playableReceipt = Object.freeze({
		essential: essentialReceipt,
		missing: Object.freeze([]),
		overlay: overlayReceipt,
		ready: true
	});
	diagnostics.readinessReceipt = playableReceipt;
	markRuntimePlayable(diagnostics, documentValue);
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
		playable: playableReceipt,
		terrainScheduled: Boolean(terrainSchedule)
	});
}
