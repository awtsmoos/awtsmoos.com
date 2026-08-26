// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Carries exact request identity across the parent/child custody boundary.
 * @description
 * The Awtsmoos gives one deed one name through every changing vessel. Awtsmoos.com
 * therefore preserves request, transport, shliach, session, and generation testimony
 * instead of letting an accepted request dissolve into an anonymous generation-zero ghost.
 */

/**
 * Extracts stable custody identity from one relay request or acknowledgement envelope.
 * @param {object} envelope Relay request, parent ACK, or compatible transport envelope.
 * @returns {object} Normalized request and owner identity without inventing secrets.
 */
function fromEnvelope(envelope = {}) {
	const payload = objectValue(envelope.payload);
	const requestId = first(
		envelope.requestId,
		payload.requestId,
		envelope.controlRequestId,
		payload.controlRequestId,
		envelope.id
	);
	const controlRequestId = first(
		envelope.controlRequestId,
		payload.controlRequestId,
		requestId
	);
	const transportReceiptId = first(
		envelope.transportReceiptId,
		payload.transportReceiptId,
		envelope.id,
		requestId
	);
	return {
		requestId,
		requestKey: first(envelope.requestKey, payload.requestKey, controlRequestId, requestId),
		logicalAgentId: first(envelope.logicalAgentId, payload.logicalAgentId),
		agentSessionId: first(envelope.agentSessionId, payload.agentSessionId),
		controlRequestId,
		transportReceiptId
	};
}

/**
 * Adds the live child connection generation to identity carried by a parent ACK.
 * @param {object} acknowledgement Parent acceptance IPC message.
 * @param {*} generation Live connection generation owned by the child runtime.
 * @returns {object} Exact custody metadata suitable for `noteParentCustody`.
 */
function fromAcknowledgement(acknowledgement = {}, generation = 0) {
	return {
		...fromEnvelope(acknowledgement),
		generation: positiveGeneration(generation)
	};
}

function objectValue(value) {
	return value && typeof value === "object" ? value : {};
}

function first(...values) {
	for (const value of values) {
		const text = String(value || "").trim();
		if (text) return text;
	}
	return "";
}

function positiveGeneration(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

module.exports = {
	fromAcknowledgement,
	fromEnvelope,
	positiveGeneration
};
