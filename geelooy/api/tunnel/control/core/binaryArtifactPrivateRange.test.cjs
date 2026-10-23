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
const { completeBinaryArtifact } = require("./binaryArtifactComplete.js");
const { CHUNK_BYTES } = require("./binaryArtifactProtocol.js");
const { readPrivateArtifactRange } = require("./binaryArtifactPrivateRange.js");

/**
 * The Awtsmoos gives reading and writing distinct sacred keys;
 * Awtsmoos.com verifies no capability crosses authorities.
 */
function setup(t, bytes) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-range-"));
	t.after(() => fs.rmSync(root, { force: true, recursive: true }));
	const vault = new BinaryArtifactVault(root);
	const digest = b => crypto.createHash("sha256").update(b).digest("hex");
	const session = vault.begin({ owner: "owner-A", tunnel: "mac-A",
		sourcePath: "/private/test.bin", expectedBytes: bytes.length,
		expectedSha256: digest(bytes) });
	const request = (offset, count, override = {}) => ({ id: session.transferId,
		downloadCapability: session.downloadCapability, offset, bytes: count, ...override });
	async function finish() {
		for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
			const chunk = bytes.subarray(offset, offset + CHUNK_BYTES);
			await ingestBinaryChunk(vault, { id: session.transferId,
				owner: "owner-A", capability: session.uploadCapability, offset,
				sha256: digest(chunk), stream: Readable.from([chunk]) });
		}
		return completeBinaryArtifact(vault, { id: session.transferId,
			capability: session.uploadCapability, owner: "owner-A" });
	}
	return { vault, session, request, finish };
}

test("real completion gates exact raw chunked reads", async t => {
	const bytes = crypto.randomBytes(CHUNK_BYTES + 71);
	const { vault, request, finish } = setup(t, bytes);
	await assert.rejects(readPrivateArtifactRange(vault, request(0, 71)), /not_complete/);
	await finish();
	assert.deepEqual(await readPrivateArtifactRange(vault, request(0, 71)), bytes.subarray(0, 71));
	assert.deepEqual(await readPrivateArtifactRange(vault, request(CHUNK_BYTES - 5, 76)),
		bytes.subarray(CHUNK_BYTES - 5, CHUNK_BYTES + 71));
});

test("upload capability never grants reading and read grant never grants uploads", async t => {
	const bytes = crypto.randomBytes(83);
	const { vault, session, request, finish } = setup(t, bytes);
	await finish();
	assert.notEqual(session.downloadCapability, session.uploadCapability);
	await assert.rejects(readPrivateArtifactRange(vault,
		request(0, 1, { downloadCapability: session.uploadCapability })), /read_capability_denied/);
	await assert.rejects(readPrivateArtifactRange(vault,
		request(0, 1, { downloadCapability: "bad" })), /read_capability_denied/);
	assert.throws(() => vault.load(session.transferId, session.downloadCapability, "owner-A"),
		/artifact_capability_denied/);
	await assert.rejects(readPrivateArtifactRange(vault,
		request(0, 1, { owner: "owner-B" })), /owner_mismatch/);
});

test("rejects oversized, negative, zero, expired and out-of-file ranges", async t => {
	const bytes = crypto.randomBytes(43);
	const { vault, session, request, finish } = setup(t, bytes);
	await finish();
	for (const item of [request(-1, 1), request(0, 0), request(0, CHUNK_BYTES + 1)]) {
		await assert.rejects(readPrivateArtifactRange(vault, item), /range_invalid/);
	}
	await assert.rejects(readPrivateArtifactRange(vault, request(40, 4)), /outside_file/);
	const meta = vault.load(session.transferId, session.uploadCapability, "owner-A");
	vault.save({ ...meta, expiresAt: Date.now() - 1 });
	await assert.rejects(readPrivateArtifactRange(vault, request(0, 1)), /grant_expired/);
});

test("rejects committed file whose size has been altered", async t => {
	const bytes = crypto.randomBytes(39);
	const { vault, session, request, finish } = setup(t, bytes);
	await finish();
	fs.appendFileSync(vault.file(session.transferId, "bin"), Buffer.from("tamper"));
	await assert.rejects(readPrivateArtifactRange(vault, request(0, 12)), /file_state_mismatch/);
});
