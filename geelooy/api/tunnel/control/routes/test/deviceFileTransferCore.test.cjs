// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const Bridge = require("../deviceFileTransferCore.js");

/**
 * @file Proves cross-device transfer resumes from destination truth without whole-file buffering.
 * @description The Awtsmoos joins two simulated devices by small witnessed fragments; Awtsmoos.com
 * lets the destination manifest, not server memory, decide the next byte after every interruption.
 */
test("bridge creates, pauses, resumes, and commits across devices", async () => {
	const bytes = crypto.randomBytes(2500000);
	const hash = sha(bytes);
	const calls = [];
	const destination = { transferId: "awtx_testtesttesttesttesttest", nextOffset: 0, totalBytes: bytes.length, chunkBytes: 1024 * 1024, complete: false };
	async function send(route, action, permission, params) {
		calls.push({ route, action, permission, params });
		if (action === "fileTransferSourceProof") return { totalBytes: bytes.length, sha256: hash };
		if (action === "fileTransferCreate") return { ...destination };
		if (action === "fileTransferStatus") return { ...destination };
		if (action === "fileTransferReadChunk") {
			const chunk = bytes.subarray(params.offset, Math.min(bytes.length, params.offset + params.maxBytes));
			return { offset: params.offset, content64: chunk.toString("base64"), sha256: sha(chunk) };
		}
		if (action === "fileTransferWriteChunk") {
			const chunk = Buffer.from(params.content64, "base64");
			destination.nextOffset = params.offset + chunk.length;
			destination.complete = destination.nextOffset >= destination.totalBytes;
			return { ...destination, receivedBytes: destination.nextOffset };
		}
		if (action === "fileTransferCommit") return { bytes: bytes.length, sha256: hash, state: "committed" };
		throw new Error(`unexpected:${action}`);
	}
	const first = await Bridge.pump({
		source: "route-source", destination: "route-destination",
		sourcePath: "movie.mp4", destinationPath: "copied.mp4", maxChunks: 1
	}, send);
	assert.equal(first.done, false);
	assert.equal(first.nextOffset, 1024 * 1024);
	assert.equal(first.continuation.transferId, destination.transferId);
	const second = await Bridge.pump({
		source: "route-source", destination: "route-destination",
		sourcePath: "movie.mp4", transferId: first.transferId, maxChunks: 8
	}, send);
	assert.equal(second.done, true);
	assert.equal(second.sha256, hash);
	assert.ok(calls.some(call => call.action === "fileTransferSourceProof" && call.permission === "tunnel.read"));
	assert.ok(calls.some(call => call.action === "fileTransferWriteChunk" && call.permission === "tunnel.write"));
	assert.equal(calls.filter(call => call.action === "fileTransferSourceProof").length, 1);
});

test("bridge bounds chunks per GET call", () => {
	assert.equal(Bridge.boundedChunks(0), Bridge.DEFAULT_MAX_CHUNKS);
	assert.equal(Bridge.boundedChunks(999), Bridge.MAX_CHUNKS);
	assert.equal(Bridge.boundedChunks(3), 3);
});

function sha(buffer) { return crypto.createHash("sha256").update(buffer).digest("hex"); }
