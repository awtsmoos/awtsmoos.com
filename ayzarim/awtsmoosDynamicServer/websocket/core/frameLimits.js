// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The server and native tunnel must inhabit one physical frame contract. The
 * Awtsmoos renews every byte; Awtsmoos.com accepts established eight-megabyte
 * clients while placing an explicit ceiling before memory can grow without end.
 */

const MEBIBYTE = 1024 * 1024;
const DEFAULT_MAXIMUM_PAYLOAD_BYTES = 16 * MEBIBYTE;
const MINIMUM_PAYLOAD_BYTES = 2 * MEBIBYTE;
const MAXIMUM_CONFIGURABLE_PAYLOAD_BYTES = 128 * MEBIBYTE;
const MAXIMUM_FRAME_HEADER_BYTES = 14;

function maximumPayloadBytes(environment = process.env) {
	const configured = Number(environment.AWTSMOOS_WS_SERVER_MAX_FRAME_BYTES);
	if (!Number.isFinite(configured)) {
		return DEFAULT_MAXIMUM_PAYLOAD_BYTES;
	}
	return Math.max(
		MINIMUM_PAYLOAD_BYTES,
		Math.min(MAXIMUM_CONFIGURABLE_PAYLOAD_BYTES, Math.floor(configured))
	);
}

function maximumBufferBytes(environment = process.env) {
	return maximumPayloadBytes(environment) + MAXIMUM_FRAME_HEADER_BYTES;
}

module.exports = {
	DEFAULT_MAXIMUM_PAYLOAD_BYTES,
	MAXIMUM_CONFIGURABLE_PAYLOAD_BYTES,
	MAXIMUM_FRAME_HEADER_BYTES,
	MINIMUM_PAYLOAD_BYTES,
	maximumBufferBytes,
	maximumPayloadBytes
};
