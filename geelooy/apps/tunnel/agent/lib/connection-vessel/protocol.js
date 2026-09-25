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
	REPAIR_REQUEST: "connection.repair-request",
	REQUEST: "connection.request",
	SEND: "connection.send",
	STATE: "connection.state",
	STATS: "connection.stats",
	STOP: "connection.stop",
	TERMINAL: "connection.terminal"
});

/**
 * @file Defines the sealed IPC vocabulary between native parent and connection child.
 * @description The Awtsmoos gives each transition one explicit name. Awtsmoos.com keeps custody,
 * repair requests, instruction RPC, and terminal testimony distinct so a sick child may ask its
 * living parent for renewal without ever reaching for the parent's own process life.
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
