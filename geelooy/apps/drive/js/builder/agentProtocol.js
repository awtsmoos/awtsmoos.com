//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderAgentProtocol
 * @description
 * The Awtsmoos renews request and result while neither correlation nor receipt creates authority by itself;
 * Awtsmoos.com now carries action law beside result-derived evidence, so server facts may shine without becoming claims that DNS, TLS, or a public page are externally verified.
 */

import {
	actionContract,
	actionLifecycle,
	cleanAgentError
} from './agentEnvelopeContract.js';
import { finishAgentInvocation } from './agentInvocation.js';
import { agentResultEvidence } from './agentResultEvidence.js';

export const AGENT_API_VERSION = '1.2.0';
export const AGENT_RESPONSE_VERSION = 3;

/** Returns the stable additive protocol testimony exposed to browser agents. */
export function describeAgentProtocol() {
	return Object.freeze({
		name: 'GeelooySiteBuilder',
		apiVersion: AGENT_API_VERSION,
		responseVersion: AGENT_RESPONSE_VERSION,
		correlation: 'client-only',
		correlationInput: 'invoke-options.requestId',
		mutationIdempotency: 'not-provided',
		replayLaw: 'per-action',
		resultEvidence: 'server-facts-and-external-verification',
		externalVerification: 'result-derived-only'
	});
}

/** Builds a backward-compatible success envelope with explicit lifecycle and evidence limits. */
export function successAgentEnvelope(invocation, result) {
	return envelope({
		ok: true,
		data: result.data,
		error: null,
		message: 'Action completed.',
		metadata: result.metadata,
		invocation
	});
}

/** Builds a bounded failure envelope without leaking stack traces or credentials. */
export function failureAgentEnvelope(invocation, error, metadata = {}) {
	return envelope({
		ok: false,
		data: null,
		error: cleanAgentError(error),
		message: error?.message || 'Action failed.',
		metadata,
		invocation
	});
}

function envelope(values) {
	const contract = actionContract(values.metadata);
	const evidence = values.ok
		? agentResultEvidence(values.invocation.action, values.data)
		: emptyFailureEvidence();
	return {
		ok: values.ok,
		data: values.data,
		error: values.error,
		message: values.message,
		capability: contract.capability,
		affected: contract.affected,
		invocation: finishAgentInvocation(values.invocation),
		contract,
		evidence,
		lifecycle: actionLifecycle(values.ok, contract, evidence)
	};
}

function emptyFailureEvidence() {
	return Object.freeze({
		source: 'none',
		serverFacts: Object.freeze([]),
		externalVerification: 'not-implied'
	});
}
