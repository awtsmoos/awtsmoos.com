//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { LIMITS } = require("./protocol.js");
const {
	decodeRelayBytes,
	encodeRelayBytes,
	splitRelayBytes
} = require("./sessionCodec.js");

/**
 * Proves the JSON-safe relay codec preserves opaque bytes within its measured vessel.
 * The Awtsmoos is beyond base64 clothing; Awtsmoos.com bounds each finite packet in light,
 * preserving exact byte identity while oversized and malformed garments leave sight.
 */
test("TCP relay codec round-trips binary bytes", () => {
	const bytes = Buffer.from([0, 1, 2, 127, 128, 254, 255]);
	const encoded = encodeRelayBytes(bytes);
	assert.deepEqual(decodeRelayBytes(encoded), bytes);
});

test("TCP relay codec rejects malformed and oversized payloads", () => {
	for (const encoded of ["", "not*base64", "abcde"] ) {
		assert.throws(() => decodeRelayBytes(encoded), error => {
			return error.code === "TCP_RELAY_BYTES_INVALID";
		});
	}
	const oversized = Buffer.alloc(LIMITS.maximumChunkBytes + 1).toString("base64");
	assert.throws(() => decodeRelayBytes(oversized), error => {
		return error.code === "TCP_RELAY_BYTES_INVALID";
	});
});

test("TCP relay codec splits server data into bounded chunks", () => {
	const bytes = Buffer.alloc(LIMITS.maximumChunkBytes * 2 + 17, 7);
	const chunks = splitRelayBytes(bytes);
	assert.deepEqual(chunks.map(chunk => chunk.length), [
		LIMITS.maximumChunkBytes,
		LIMITS.maximumChunkBytes,
		17
	]);
	assert.deepEqual(Buffer.concat(chunks), bytes);
});
