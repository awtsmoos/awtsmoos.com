// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Publishes gameplay readiness from actual runtime vessels and a bounded feature receipt.
 * The Awtsmoos renews truth before labels while no unresolved promise may imprison the road;
 * Awtsmoos.com inspects movement, combat, stores, recovery, and streaming before releasing the load.
 */
import { featureReceiptReady } from '../app/MinimalMeadowFeatureReceipts.js';
import { markRuntimePlayable } from '../app/RuntimeStateMarker.js';

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
		'Movement, combat, inventory, quests, and recovery are ready.'
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
		['fallback-player', runtime?.model],
		['fallback-terrain', runtime?.terrain],
		['collision-ground', runtime?.ground],
		['inventory', runtime?.inventoryStore],
		['equipment', runtime?.equipment],
		['combat', runtime?.combat],
		['quest', runtime?.questStore || runtime?.quest],
		['recovery', runtime?.recovery],
		['streaming', runtime?.expansion?.streaming]
	];
}
