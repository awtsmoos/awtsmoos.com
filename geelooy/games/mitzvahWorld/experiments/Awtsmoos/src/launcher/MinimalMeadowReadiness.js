//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Publishes gameplay only after essential systems and visibly rendered first-play reality are all true.
 * The Awtsmoos refuses to call allocated objects a world; Awtsmoos.com waits for WebGL, the authored Chossid,
 * attached terrain, movement, and one successful gameplay frame before changing the public runtime state to playable.
 */

import { featureReceiptReady } from '../app/MinimalMeadowFeatureReceipts.js';
import { markRuntimePlayable } from '../app/RuntimeStateMarker.js';
import { webGlRuntimeReady } from '../app/WebGlRuntimeRequirement.js';
import {
	awaitMinimalMeadowVisibleReadiness,
	inspectMinimalMeadowVisibleReadiness
} from './MinimalMeadowVisibleReadiness.js';

/** Verifies essential services, then waits boundedly for visible rendered readiness. */
export async function awaitMinimalMeadowReadiness(
	diagnostics,
	loading,
	documentValue,
	environment = globalThis,
	featureSettlement = null
) {
	const settlement = featureSettlement || {
		ready: true,
		receipt: await diagnostics.featuresPromise
	};
	const structural = inspectStructuralReadiness(
		diagnostics,
		settlement.receipt,
		settlement.ready
	);
	if (structural.length) {
		throw new Error(`MINIMAL_MEADOW_NOT_PLAYABLE:${structural.join(',')}`);
	}
	const visible = await awaitMinimalMeadowVisibleReadiness(
		diagnostics.runtime,
		environment
	);
	const receipt = inspectEssentialReadiness(
		diagnostics,
		settlement.receipt,
		settlement.ready,
		visible
	);
	if (!receipt.ready) {
		throw new Error(`MINIMAL_MEADOW_NOT_PLAYABLE:${receipt.missing.join(',')}`);
	}
	markRuntimePlayable(diagnostics, documentValue);
	loading?.stage?.('ready', 'Authored Chossid, terrain, movement, and WebGL are visibly ready.');
	diagnostics.readinessReceipt = receipt;
	return receipt;
}

/** Returns one immutable receipt spanning essential services and visible rendered truth. */
export function inspectEssentialReadiness(
	diagnostics,
	featureReceipt,
	featureSettlementReady = true,
	visibleReceipt = null
) {
	const missing = inspectStructuralReadiness(
		diagnostics,
		featureReceipt,
		featureSettlementReady
	);
	const visible = visibleReceipt || inspectMinimalMeadowVisibleReadiness(diagnostics.runtime);
	for (const name of visible.missing) {
		if (!missing.includes(name)) missing.push(name);
	}
	return Object.freeze({
		degradedFeatures: !featureSettlementReady,
		missing: Object.freeze(missing),
		optionalPending: Boolean(diagnostics.runtime?.optionalFeaturePromise),
		ready: missing.length === 0,
		visible
	});
}

function inspectStructuralReadiness(diagnostics, featureReceipt, featureSettlementReady) {
	const runtime = diagnostics.runtime;
	const missing = [];
	for (const [name, value] of essentialRuntimeValues(runtime)) {
		if (!value) missing.push(name);
	}
	if (!webGlRuntimeReady(runtime?.renderer)) missing.push('webgl-renderer');
	if (featureSettlementReady && !featureReceiptReady(featureReceipt)) missing.push('feature-receipt');
	return missing;
}

function essentialRuntimeValues(runtime) {
	return [
		['runtime', runtime], ['input', runtime?.input], ['camera', runtime?.camera],
		['bootstrap-player', runtime?.model], ['bootstrap-terrain', runtime?.terrain],
		['collision-ground', runtime?.ground], ['inventory', runtime?.inventoryStore],
		['equipment', runtime?.equipment], ['combat', runtime?.combat],
		['quest', runtime?.questStore || runtime?.quest], ['recovery', runtime?.recovery],
		['streaming', runtime?.expansion?.streaming]
	];
}
