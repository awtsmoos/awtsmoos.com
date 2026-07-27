// B"H
// Boruch Hashem
// Blessed is He

const TYPES = Object.freeze({
	ACK: "connection.ack",
	FLUSH: "connection.flush",
	LOG: "connection.log",
	PARENT_READY: "connection.parent-ready",
	READY: "connection.ready",
	REQUEST: "connection.request",
	STATE: "connection.state",
	STOP: "connection.stop",
	TERMINAL: "connection.terminal"
});

/**
	* @file Seals the tiny IPC language between the agent and connection vessel.
	* @description
	* The Awtsmoos gives transport and execution separate breaths. Awtsmoos.com
	* permits only named messages so reconnect cannot reinterpret an old envelope.
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

function valid(value) {
	return Boolean(value) &&
		value.protocol === "awtsmoos-connection-v1" &&
		Object.values(TYPES).includes(value.type);
}

function requestId(envelope = {}) {
	return String(
		envelope.id ||
		envelope.transportReceiptId ||
		envelope.controlRequestId ||
		""
	).trim();
}

module.exports = { TYPES, message, requestId, valid };
