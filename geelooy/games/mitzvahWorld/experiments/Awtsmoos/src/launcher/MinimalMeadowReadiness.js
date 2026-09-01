// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Publishes gameplay readiness only when essential systems and the required WebGL renderer are all materially present.
 * The Awtsmoos renews truth before labels while no substitute canvas may borrow the playable name;
 * Awtsmoos.com inspects movement, stores, recovery, streaming, and WebGL before releasing the frame.
 */
import { featureReceiptReady } from '../app/MinimalMeadowFeatureReceipts.js';
import { markRuntimePlayable } from '../app/RuntimeStateMarker.js';
import { webGlRuntimeReady } from '../app/WebGlRuntimeRequirement.js';

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
	const receipt = inspectEssentialReadiness(
		diagnostics,
		settlement.receipt,
		settlement.ready
	);
	if (!receipt.ready) {
		throw new Error(`MINIMAL_MEADOW_NOT_PLAYABLE:${receipt.missing.join(',')}`);
	}
	markRuntimePlayable(diagnostics, documentValue);
	loading?.stage?.(
		'ready',
		'Movement, combat, inventory, quests, recovery, and WebGL are ready.'
	);
	diagnostics.readinessReceipt = receipt;
	return receipt;
}

export function inspectEssentialReadiness(
	diagnostics,
	featureReceipt,
	featureSettlementReady = true
) {
	const runtime = diagnostics.runtime;
	const missing = [];
	for (const [name, value] of essentialRuntimeValues(runtime)) {
		if (!value) missing.push(name);
	}
	if (!webGlRuntimeReady(runtime?.renderer)) missing.push('webgl-renderer');
	if (featureSettlementReady && !featureReceiptReady(featureReceipt)) {
		missing.push('feature-receipt');
	}
	return Object.freeze({
		degradedFeatures: !featureSettlementReady,
		missing: Object.freeze(missing),
		optionalPending: Boolean(runtime?.optionalFeaturePromise),
		ready: missing.length === 0
	});
}

function essentialRuntimeValues(runtime) {
	return [
		['runtime', runtime],
		['input', runtime?.input],
		['camera', runtime?.camera],
		['bootstrap-player', runtime?.model],
		['bootstrap-terrain', runtime?.terrain],
		['collision-ground', runtime?.ground],
		['inventory', runtime?.inventoryStore],
		['equipment', runtime?.equipment],
		['combat', runtime?.combat],
		['quest', runtime?.questStore || runtime?.quest],
		['recovery', runtime?.recovery],
		['streaming', runtime?.expansion?.streaming]
	];
}
