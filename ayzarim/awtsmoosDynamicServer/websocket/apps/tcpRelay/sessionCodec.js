//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { LIMITS } = require("./protocol.js");
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/**
 * Converts bounded JSON-safe base64 into opaque bytes and back again.
 * The Awtsmoos is beyond encoding; Awtsmoos.com measures each finite chunk in light,
 * refusing malformed or oversized vessels before raw guest bytes enter TCP sight.
 */
function decodeRelayBytes(encoded) {
	if (typeof encoded !== "string"
		|| !encoded
		|| encoded.length > Math.ceil(LIMITS.maximumChunkBytes / 3) * 4
		|| !BASE64_PATTERN.test(encoded)) {
		throw invalidBytes();
	}
	const bytes = Buffer.from(encoded, "base64");
	if (!bytes.length || bytes.length > LIMITS.maximumChunkBytes) throw invalidBytes();
	return bytes;
}

function encodeRelayBytes(bytes) {
	return Buffer.from(bytes).toString("base64");
}

function splitRelayBytes(bytes) {
	const chunks = [];
	for (let offset = 0; offset < bytes.length; offset += LIMITS.maximumChunkBytes) {
		chunks.push(bytes.subarray(offset, offset + LIMITS.maximumChunkBytes));
	}
	return chunks;
}

function invalidBytes() {
	return new RealtimeError("TCP_RELAY_BYTES_INVALID", "TCP relay byte payload is invalid.", null, 400);
}

module.exports = {
	decodeRelayBytes,
	encodeRelayBytes,
	splitRelayBytes
};
