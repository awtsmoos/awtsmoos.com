// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Limits = require("./frameLimits.js");
const { readFrame } = require("./frameReader.js");
const { makeHeader } = require("./frameWriter.js");

/**
 * B"H
 *
 * The frame contract must accept installed eight-megabyte clients while
 * rejecting declared excess before the server accumulates an unbounded body.
 */
const legacyPayloadBytes = 8 * 1024 * 1024;
const payload = Buffer.alloc(legacyPayloadBytes, 97);
const frame = Buffer.concat([
	makeHeader(payload.length, 0x2),
	payload
]);
const parsed = readFrame(frame);

assert.equal(parsed.frame.payload.length, legacyPayloadBytes);
assert.equal(parsed.consumed, frame.length);
assert.equal(
	Limits.maximumPayloadBytes() >= legacyPayloadBytes,
	true
);
assert.equal(
	Limits.maximumBufferBytes() > Limits.maximumPayloadBytes(),
	true
);

const oversized = Limits.maximumPayloadBytes() + 1;
const header = Buffer.alloc(10);
header[0] = 0x82;
header[1] = 127;
header.writeBigUInt64BE(BigInt(oversized), 2);
assert.throws(
	() => readFrame(header),
	/websocket_payload_exceeds_limit/
);

assert.equal(
	Limits.maximumPayloadBytes({
		AWTSMOOS_WS_SERVER_MAX_FRAME_BYTES: "1"
	}),
	Limits.MINIMUM_PAYLOAD_BYTES
);
assert.equal(
	Limits.maximumPayloadBytes({
		AWTSMOOS_WS_SERVER_MAX_FRAME_BYTES: String(1024 * 1024 * 1024)
	}),
	Limits.MAXIMUM_CONFIGURABLE_PAYLOAD_BYTES
);

console.log(JSON.stringify({
	ok: true,
	suite: "websocket-frame-limits",
	acceptedLegacyBytes: legacyPayloadBytes,
	maximumPayloadBytes: Limits.maximumPayloadBytes()
}, null, 2));
