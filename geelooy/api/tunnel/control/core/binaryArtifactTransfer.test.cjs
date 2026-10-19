//B"H
// Boruch Hashem
// Blessed is He
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { Readable } = require("node:stream");
const { BinaryArtifactVault } = require("./binaryArtifactVault.js");
const { ingestBinaryChunk } = require("./binaryArtifactIngest.js");
const { completeBinaryArtifact, removeBinaryArtifact } = require("./binaryArtifactComplete.js");
const { CHUNK_BYTES, MAX_BYTES } = require("./binaryArtifactProtocol.js");

/** Awtsmoos.com measures real binary evidence, not a preview of its face. */
function harness(context, bytes) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-binary-"));
	context.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const vault = new BinaryArtifactVault(root);
	const digest = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
	const session = vault.begin({ owner: "owner-A", tunnel: "mac-A", sourcePath: "/tmp/capture.png", expectedBytes: bytes.length, expectedSha256: digest(bytes) });
	const request = (buffer, offset = 0, options = {}) => ({
		id: session.transferId, capability: session.uploadCapability, owner: "owner-A", offset,
		sha256: digest(buffer), stream: Readable.from([buffer]), ...options
	});
	return { vault, digest, session, request };
}

test("raw two-chunk transfer preserves bytes and SHA", async (context) => {
	const bytes = crypto.randomBytes(CHUNK_BYTES + 143);
	const { vault, session, request, digest } = harness(context, bytes);
	const first = await ingestBinaryChunk(vault, request(bytes.subarray(0, CHUNK_BYTES)));
	assert.equal(first.nextOffset, CHUNK_BYTES);
	await assert.rejects(completeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability }), /incomplete/);
	await ingestBinaryChunk(vault, request(bytes.subarray(CHUNK_BYTES), CHUNK_BYTES));
	const proof = await completeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability });
	assert.equal(proof.sha256, digest(bytes));
	assert.deepEqual(fs.readFileSync(vault.file(session.transferId, "bin")), bytes);
	assert.equal((await completeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability })).state, "complete");
});

test("corrupt chunk rolls back and resumes at durable offset", async (context) => {
	const bytes = crypto.randomBytes(50000);
	const { vault, session, request } = harness(context, bytes);
	await assert.rejects(ingestBinaryChunk(vault, request(bytes, 0, { sha256: "0".repeat(64) })), /chunk_digest_mismatch/);
	assert.equal(vault.load(session.transferId, session.uploadCapability).nextOffset, 0);
	assert.equal(fs.statSync(vault.file(session.transferId, "part")).size, 0);
	assert.equal((await ingestBinaryChunk(vault, request(bytes))).nextOffset, bytes.length);
});

test("owner, bearer and replay isolation", async (context) => {
	const bytes = crypto.randomBytes(64);
	const { vault, session, request } = harness(context, bytes);
	await assert.rejects(ingestBinaryChunk(vault, request(bytes, 0, { owner: "owner-B" })), /owner_mismatch/);
	await assert.rejects(ingestBinaryChunk(vault, request(bytes, 0, { capability: "a".repeat(64) })), /capability_denied/);
	await ingestBinaryChunk(vault, request(bytes));
	await assert.rejects(ingestBinaryChunk(vault, request(bytes)), /offset_conflict/);
	assert.throws(() => vault.file("../../etc/passwd", "bin"), /transfer_id_invalid/);
});

test("cancellation removes completed binary and metadata", async (context) => {
	const bytes = crypto.randomBytes(42);
	const { vault, session, request } = harness(context, bytes);
	await ingestBinaryChunk(vault, request(bytes));
	await completeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability });
	const result = await removeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability, owner: "owner-A" });
	assert.equal(result.cancelled, true);
	assert.equal(fs.existsSync(vault.file(session.transferId, "bin")), false);
});

test("size limit rejects allocation", (context) => {
	const { vault } = harness(context, Buffer.from([9]));
	assert.throws(() => vault.begin({ owner: "owner-A", tunnel: "mac-A", sourcePath: "x", expectedBytes: MAX_BYTES + 1, expectedSha256: "1".repeat(64) }), /out_of_bounds/);
});
