// B"H
// Boruch Hashem
// Blessed is He

const TYPES = Object.freeze({
	ACK: "connection.ack",
	FLUSH: "connection.flush",
	LOG: "connection.log",
	PARENT_READY: "connection.parent-ready",
	PROGRESS: "connection.progress",
	READY: "connection.ready",
	REQUEST: "connection.request",
	SEND: "connection.send",
	STATE: "connection.state",
	STATS: "connection.stats",
	STOP: "connection.stop",
	TERMINAL: "connection.terminal"
});

/**
 * @file Seals the tiny IPC language between parent execution and the connection vessel.
 * @description
 * The Awtsmoos gives acceptance and execution progress distinct truthful breath;
 * Awtsmoos.com names every crossing so a reborn child cannot inherit an older shadow's debt.
 */
function message(type, payload = {}) {
	if (!Object.values(TYPES).includes(type)) {
		throw new Error(`unknown_connection_message:${type}`);
	}
	return {
		protocol: "awtsmoos-connection-v1",
		type,
		...payload
	};
}

/** Returns whether one candidate belongs to the sealed connection IPC language. */
function valid(value) {
	return Boolean(value) &&
		value.protocol === "awtsmoos-connection-v1" &&
		Object.values(TYPES).includes(value.type);
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
