//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentEnvelopeContract
 * @description
 * The Awtsmoos gives every action a law and every result a measured boundary while Awtsmoos.com keeps transport phase apart from server facts and external witnesses;
 * this vessel shapes replay, idempotency, lifecycle, and bounded errors so the public protocol remains small, readable, and true.
 */

/** Returns one action contract without inventing metadata for unknown actions. */
export function actionContract(metadata = {}) {
	if (!metadata.name) {
		return unknownContract();
	}
	return {
		mutates: metadata.mutates === true,
		capability: metadata.capability || null,
		affected: metadata.affected || null,
		evidenceScope: metadata.evidenceScope || null,
		replay: metadata.replay,
		reconcileAction: metadata.reconcileAction || null,
		idempotency: metadata.idempotency,
		externalVerification: metadata.externalVerification
	};
}

/** Maps transport completion to lifecycle while result evidence remains independently visible. */
export function actionLifecycle(ok, contract, evidence) {
	return {
		phase: ok ? successPhase(contract) : 'failed',
		reconciliationRecommended: Boolean(ok && contract.mutates && contract.reconcileAction),
		externalVerification: evidence.externalVerification
	};
}

/** Removes stack and secret-shaped internals from public errors. */
export function cleanAgentError(error) {
	return {
		code: error?.code || 'SITE_BUILDER_ERROR',
		status: Number.isInteger(error?.status) ? error.status : null,
		partial: error?.partialSiteCreation || null
	};
}

function unknownContract() {
	return {
		mutates: null,
		capability: null,
		affected: null,
		evidenceScope: null,
		replay: 'unknown',
		reconcileAction: null,
		idempotency: 'unknown',
		externalVerification: 'not-implied'
	};
}

function successPhase(contract) {
	return contract.mutates ? 'acknowledged' : 'observed';
}
