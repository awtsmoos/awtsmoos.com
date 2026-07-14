// B"H
// Boruch Hashem
// Blessed is He
/** @module SafeReplayPolicy @description Allows replay only for immutable, bounded, policy-safe jobs. */

/** Evaluates whether one job can be replayed safely. */
export function evaluateReplaySafety(job, policy = {}) {
	const reasons = [];
	if (!job?.inputHash) {
		reasons.push('missing-input-hash');
	}
	if (job?.destructive && policy.allowDestructive !== true) {
		reasons.push('destructive-action');
	}
	if (job?.usesSecrets && policy.allowSecrets !== true) {
		reasons.push('secret-dependent');
	}
	if (job?.externalSideEffects && policy.allowExternalSideEffects !== true) {
		reasons.push('external-side-effects');
	}
	if (!job?.environmentHash) {
		reasons.push('missing-environment-hash');
	}
	return Object.freeze({
		safe: reasons.length === 0,
		reasons: Object.freeze(reasons)
	});
}
