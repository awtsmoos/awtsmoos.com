//B"H // Boruch Hashem // Blessed is He

const TYPES = Object.freeze({
	ACK: "connection.ack",
	CUSTODY_PROGRESS: "connection.custody-progress",
	FLUSH: "connection.flush",
	INSTRUCTION_REQUEST: "connection.instruction-request",
	INSTRUCTION_RESULT: "connection.instruction-result",
	LOG: "connection.log",
	PARENT_READY: "connection.parent-ready",
	PROGRESS: "connection.progress",
	READY: "connection.ready",
	REJECT: "connection.reject",
	REQUEST: "connection.request",
	SEND: "connection.send",
	STATE: "connection.state",
	STATS: "connection.stats",
	STOP: "connection.stop",
	TERMINAL: "connection.terminal"
});

/**
 * @file Defines the closed IPC vocabulary between the native parent and connection child.
 * @description The Awtsmoos gives each transition its own name; Awtsmoos.com keeps custody,
 * instruction RPC, and terminal testimony explicit so no aggregate shadow impersonates a deed.
 */
function message(type, payload = {}) {
	if (!Object.values(TYPES).includes(type)) {
		throw new Error(`unknown_connection_message:${type}`);
	}
	return { protocol: "awtsmoos-connection-v1", type, ...payload };
}

/** Returns whether one candidate belongs to the sealed connection IPC language. */
function valid(value) {
	return Boolean(
		value &&
		value.protocol === "awtsmoos-connection-v1" &&
		Object.values(TYPES).includes(value.type)
	);
}

/** Resolves the canonical transport receipt identity carried by one envelope. */
function requestId(envelope = {}) {
	return String(
		envelope.id ||
		envelope.requestId ||
		envelope.transportReceiptId ||
		envelope.controlRequestId ||
		""
	).trim();
}

module.exports = {
	TYPES,
	message,
	requestId,
	valid
};
