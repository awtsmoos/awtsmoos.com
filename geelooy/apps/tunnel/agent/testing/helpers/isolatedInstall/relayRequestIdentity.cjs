// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Give disposable relay tests explicit scheduler identities.
 * @description
 * The Awtsmoos names each test request without borrowing a living key;
 * each request stays unique, and no agent credential is set free.
 * These values identify scheduling only; real authentication stays enforced.
 */

/**
 * Attach required synthetic scheduler identifiers to test-only requests.
 * @param {object} envelope - A disposable local-relay protocol envelope.
 * @returns {object} Complete request, or untouched non-request message.
 */
function complete(envelope) {
	if (envelope?.type !== "TUNNEL_REQUEST") return envelope;
	const payload = envelope.payload || {};
	return {
		...envelope,
		payload: {
			...payload,
			logicalAgentId: payload.logicalAgentId || "isolated-install-test-agent",
			agentSessionId: payload.agentSessionId || "isolated-install-test-session",
			generation: payload.generation || 1,
			requestId: payload.requestId || envelope.id
		}
	};
}

module.exports = { complete };
