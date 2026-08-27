//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
	browserFetchCancelSource,
	browserFetchReadSource,
	browserFetchStartSource
} = require("../../apps/tunnel/agent/tools/relay/browserFetchPageSource.js");

/**
 * The logged-in browser receives the authenticated river, while the Awtsmoos
 * reveals it through bounded CDP packets rather than one truncatable page value.
 */
const originalFetch = globalThis.fetch;
const source = deterministicBytes(3 * 1024 * 1024 + 701);
let capturedBody = null;
globalThis.fetch = async (url, options = {}) => {
	capturedBody = options.body || null;
	return new Response(source, {
		status: 200,
		headers: { "content-type": "application/json" }
	});
};
globalThis.__awtsmoosBrowserRelayStreams = new Map();

const started = await browserFetchStartSource(
	"https://chatgpt.com/backend-api/conversation/test",
	{ method: "GET" },
	"BH_BROWSER_PACKET_TEST"
);
assert.equal(started.ok, true);
const chunks = [];
while (true) {
	const packet = await browserFetchReadSource("BH_BROWSER_PACKET_TEST");
	if (packet.done) break;
	assert.ok(packet.byteLength > 0);
	assert.ok(packet.byteLength <= 128 * 1024);
	chunks.push(decodeDataUrl(packet.chunk));
}
const rebuilt = Buffer.concat(chunks);
assert.deepEqual(rebuilt, source);
assert.equal(
	globalThis.__awtsmoosBrowserRelayStreams.has("BH_BROWSER_PACKET_TEST"),
	false
);

const requestBody = Buffer.from("BH_BINARY_REQUEST_BODY");
await browserFetchStartSource(
	"https://chatgpt.com/backend-api/test",
	{
		method: "POST",
		body: {
			type: "base64",
			data: requestBody.toString("base64")
		}
	},
	"BH_BROWSER_BINARY_TEST"
);
assert.deepEqual(Buffer.from(capturedBody), requestBody);
const cancelled = await browserFetchCancelSource("BH_BROWSER_BINARY_TEST");
assert.equal(cancelled.cancelled, true);
globalThis.fetch = originalFetch;

console.log(JSON.stringify({
	result: "BH_BROWSER_RELAY_CHUNK_CONTRACT_OK",
	bytes: rebuilt.length,
	packets: chunks.length,
	maxPacketBytes: 128 * 1024,
	hash: sha256(rebuilt),
	binaryRequestDecoded: true,
	cancelledCleanly: true
}));

function deterministicBytes(length) {
	const bytes = Buffer.allocUnsafe(length);
	for (let index = 0; index < length; index += 1) {
		bytes[index] = (index * 13 + 19) & 255;
	}
	return bytes;
}

function decodeDataUrl(value) {
	return Buffer.from(String(value).split(",", 2)[1], "base64");
}

function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
