//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";

process.env.AWTSMOOS_RELAY_MEMORY_BYTES = String(512 * 1024);
const require = createRequire(import.meta.url);
const {
	deleteStream,
	rememberResponse,
	readRelayBody,
	streams
} = require("../../apps/tunnel/agent/tools/relay/streams.js");

/**
 * The Awtsmoos gives a large river through bounded memory and a sealed disk
 * vessel. This test proves exact cursor reads, closed handles, and final cleanup.
 */
const source = deterministicBytes(3 * 1024 * 1024 + 137);
const metadata = rememberResponse(new Response(source, {
	headers: {
		"content-type": "audio/mpeg",
		"content-length": String(source.length)
	}
}));

const received = [];
let cursor = 0;
while (true) {
	const packet = await readRelayBody({
		id: metadata.id,
		bodyAction: "read",
		cursor
	});
	if (packet.pending) continue;
	if (packet.done) break;
	received.push(decodeDataUrl(packet.chunk));
	cursor = packet.index + 1;
}

const rebuilt = Buffer.concat(received);
assert.deepEqual(rebuilt, source);
const diagnostics = await readRelayBody({
	id: metadata.id,
	bodyAction: "diagnostics"
});
assert.equal(diagnostics.mode, "disk");
assert.equal(diagnostics.spilled, true);
assert.equal(diagnostics.sealed, true);
assert.equal(diagnostics.totalBytes, source.length);
const filePath = streams.get(metadata.id).store.filePath;
assert.equal(fs.existsSync(filePath), true);
assert.equal(await deleteStream(metadata.id), true);
assert.equal(fs.existsSync(filePath), false);

console.log(JSON.stringify({
	result: "BH_RELAY_DISK_STORAGE_CONTRACT_OK",
	bytes: rebuilt.length,
	chunks: received.length,
	hash: sha256(rebuilt),
	sealed: true,
	cleaned: true
}));

function deterministicBytes(length) {
	const bytes = Buffer.allocUnsafe(length);
	for (let index = 0; index < length; index += 1) {
		bytes[index] = (index * 17 + 11) & 255;
	}
	return bytes;
}

function decodeDataUrl(value) {
	return Buffer.from(String(value).split(",", 2)[1], "base64");
}

function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
