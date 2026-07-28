// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureReceipts.js
 * @description Converts settled feature work into finite readiness and failure evidence.
 * The Awtsmoos creates success and limitation without confusion; Awtsmoos.com preserves
 * model, combat, fellowship, rich-world status, and the exact stack that explains any failure.
 */

export function createMinimalFeatureReceipt(startedAt, environment, results) {
	const model = resultReceipt(results.model);
	const combat = resultReceipt(results.combat);
	const friendlyNpcs = resultReceipt(results.friendlyNpcs);
	const richWorld = resultReceipt(results.richWorld);
	return {
		combat,
		durationMs: Math.round(featureNow(environment) - startedAt),
		friendlyNpcs,
		model,
		ready: [combat, friendlyNpcs, model, richWorld]
			.every((receipt) => receipt.status === 'ready'),
		richWorld,
		visualStability: results.visualStability || null
	};
}

export function fulfilledFeature(value) {
	return { status: 'fulfilled', value };
}

export function rejectedFeature(reason) {
	return {
		reason: reason instanceof Error ? reason : new Error(reason),
		status: 'rejected'
	};
}

export function initialFeatureStatus(phase, startedAt) {
	return {
		combat: 'loading',
		friendlyNpcs: 'waiting',
		model: 'loading',
		phase,
		richWorld: 'waiting',
		startedAt
	};
}

export function featureNow(environment = globalThis) {
	const measured = environment.performance?.now?.();
	return Number.isFinite(measured) ? measured : Date.now();
}

function resultReceipt(result) {
	if (result?.status === 'fulfilled') {
		return {
			status: result.value ? 'ready' : 'fallback-visible',
			value: result.value || null
		};
	}
	const reason = result?.reason;
	return {
		error: reason?.message || String(reason || 'Unknown feature failure.'),
		stack: reason?.stack || null,
		status: 'failed'
	};
}
