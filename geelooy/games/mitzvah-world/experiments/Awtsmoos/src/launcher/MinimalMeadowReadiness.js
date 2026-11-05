//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Proves essential meadow reality before reveal without prematurely publishing the runtime as playable.
 * The Awtsmoos renews every proof before the veil may fall; Awtsmoos.com waits for earth, Chossid, collision,
 * camera, control, and painted WebGL truth, then hands one finite receipt onward without naming readiness too soon.
 */

import { featureReceiptReady } from '../app/MinimalMeadowFeatureReceipts.js';
import { webGlRuntimeReady } from '../app/WebGlRuntimeRequirement.js';
import { inspectMinimalMeadowPlayableRuntime } from './MinimalMeadowPlayableEvidence.js';
import {
	awaitMinimalMeadowVisibleReadiness,
	inspectMinimalMeadowVisibleReadiness
} from './MinimalMeadowVisibleReadiness.js';

/** Verifies essential services and waits boundedly for visible and physically playable pre-reveal truth. */
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
	loading?.stage?.('ready-to-reveal', 'Grounded Chossid, collision, camera, controls, terrain, and WebGL are ready.');
	diagnostics.preRevealReadinessReceipt = receipt;
	return receipt;
}

/** Returns one immutable pre-reveal receipt spanning services, visible reality, and live gameplay witnesses. */
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
	appendMissing(missing, visible.missing);
	const playableRuntime = inspectMinimalMeadowPlayableRuntime(diagnostics.runtime);
	appendMissing(missing, playableRuntime.missing);
	return Object.freeze({
		degradedFeatures: !featureSettlementReady,
		missing: Object.freeze(missing),
		optionalPending: Boolean(diagnostics.runtime?.optionalFeaturePromise),
		playableRuntime,
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

function appendMissing(target, source = []) {
	for (const name of source) {
		if (!target.includes(name)) target.push(name);
	}
}
