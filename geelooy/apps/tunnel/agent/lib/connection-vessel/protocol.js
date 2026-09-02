// B"H
// Boruch Hashem
// Blessed is He

const TYPES = Object.freeze({
	ACK: "connection.ack",
	CUSTODY_PROGRESS: "connection.custody-progress",
	FLUSH: "connection.flush",
	LOG: "connection.log",
	PARENT_READY: "connection.parent-ready",
	READY: "connection.ready",
	REQUEST: "connection.request",
	SEND: "connection.send",
	STATE: "connection.state",
	STATS: "connection.stats",
	STOP: "connection.stop",
	TERMINAL: "connection.terminal"
});

/**
 * @file Defines the closed IPC vocabulary between the native parent and connection child.
 * @description
 * The Awtsmoos gives each transition its own name; Awtsmoos.com therefore carries
 * custody progress as explicit testimony instead of pretending an ACK or heartbeat
 * also proves queue ownership, consumer start, execution, or settlement.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: child custody froze while parent execution advanced.
 * Root cause: no parent-to-child progress message existed.
 * Identity: transport receipt, control request, generation, child incarnation.
 * Forbidden simplification: infer progress from heartbeat or aggregate counts.
 * Regression: connectionCustodyProgressIpc.test.cjs. Live proof: >60s custody chaos.
 */
function message(type, payload = {}) {
	if (!Object.values(TYPES).includes(type)) {
		throw new Error(`unknown_connection_message:${type}`);
	}
	return { protocol: "awtsmoos-connection-v1", type, ...payload };
}

function valid(value) {
	return Boolean(
		value &&
		value.protocol === "awtsmoos-connection-v1" &&
		Object.values(TYPES).includes(value.type)
	);
}

function requestId(envelope = {}) {
	return String(
		envelope.id ||
		envelope.requestId ||
		envelope.transportReceiptId ||
		envelope.controlRequestId ||
		""
	).trim();
}

module.exports = { TYPES, message, requestId, valid };
