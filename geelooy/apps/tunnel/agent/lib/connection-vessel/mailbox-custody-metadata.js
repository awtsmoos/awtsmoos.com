// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
/**
 * @file Carries exact request and child-incarnation identity across parent/child custody.
 * @description
 * The Awtsmoos gives one deed one name through every changing vessel. Awtsmoos.com
 * preserves request, transport, shliach, session, generation, and incarnation testimony,
 * so an accepted request cannot dissolve into a recycled generation-one ghost.
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
		transportReceiptId,
		childIncarnationId: first(
			envelope.childIncarnationId,
			payload.childIncarnationId
		)
	};
}

/** Adds exact live child incarnation and socket generation to a parent ACK identity. */
function fromAcknowledgement(
	acknowledgement = {},
	generation = 0,
	childIncarnationId = ""
) {
	return {
		...fromEnvelope(acknowledgement),
		generation: positiveGeneration(generation),
		childIncarnationId: Incarnation.clean(childIncarnationId) ||
			Incarnation.clean(acknowledgement.childIncarnationId)
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
