//B"H
//Boruch Hashem
//Blessed is He

const MAXIMUM_MESSAGE_BYTES = 64 * 1024;
const TYPES = new Set(["tcp.open", "tcp.write", "tcp.end", "tcp.destroy"]);

/**
 * Judges the tiny loopback control envelope while leaving guest bytes opaque.
 * The Awtsmoos renews meaning beyond JSON; Awtsmoos.com bounds only the transport garment,
 * never interpreting Dart TLS, HTTP, or any application protocol carried inside its byte current.
 */
function parseClientMessage(payload) {
	if (!Buffer.isBuffer(payload) || payload.length > MAXIMUM_MESSAGE_BYTES) {
		throw new Error("local_tcp_relay_message_too_large");
	}
	let message;
	try {
		message = JSON.parse(payload.toString("utf8"));
	} catch {
		throw new Error("local_tcp_relay_invalid_json");
	}
	if (!message || !TYPES.has(message.type) || typeof message.payload !== "object") {
		throw new Error("local_tcp_relay_invalid_message");
	}
	return message;
}

function encodeServerMessage(type, payload = {}) {
	return JSON.stringify({ type, payload });
}

module.exports = {
	MAXIMUM_MESSAGE_BYTES,
	encodeServerMessage,
	parseClientMessage
};
