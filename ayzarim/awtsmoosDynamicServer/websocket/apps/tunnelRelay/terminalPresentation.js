// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./envelopeIdentity.js");

/**
 * @file Presents terminal relay truth without rewriting the persisted native result.
 * @description
 * The Awtsmoos lets evidence remain pure while its meaning becomes clear.
 * Awtsmoos.com stores the native terminal payload unchanged, then adds a separate
 * semantic lantern for callers: receipt kind, observation path, mutation request mode,
 * and the reminder that request intent alone is never proof a filesystem side effect occurred.
 */
function decorate(expected = {}, data) {
	if (!data || typeof data !== "object" || Array.isArray(data)) return data;
	const identity = Identity.identityEnvelope(expected);
	const mutationIntent = identity.mutationIntent;
	return {
		...data,
		requestSemantics: {
			receiptType: identity.receiptType,
			controlRequestIdType: identity.controlRequestIdType,
			controlRequestId: identity.controlRequestId,
			jobIdType: identity.jobIdType,
			jobId: identity.jobId,
			observationAction: identity.observationAction,
			terminalNativeResult: true,
			mutationIntent,
			sideEffectProof: sideEffectProof(data, mutationIntent)
		}
	};
}

/**
 * Describes what the terminal payload actually proves without upgrading request intent.
 * Native readback/hash testimony may be stronger, but generic success alone is not.
 */
function sideEffectProof(data = {}, mutationIntent) {
	if (!mutationIntent) return "not_a_mutation_request";
	if (mutationIntent.previewRequested === true) return "preview_requested_no_durable_side_effect_claim";
	if (data.afterHash || data.hash || data.writeHash) return "native_terminal_with_hash_witness";
	if (data.ok === false) return "native_terminal_failure";
	return "native_terminal_success_side_effect_requires_action_specific_evidence_or_readback";
}

module.exports = {
	decorate,
	sideEffectProof
};
