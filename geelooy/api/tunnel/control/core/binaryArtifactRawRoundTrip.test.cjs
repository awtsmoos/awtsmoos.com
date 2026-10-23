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
const { writeVerifiedBinary } = require("../../../../apps/tunnel/agent/tools/fs/binaryArtifactDownloadWriter.js");

/**
 * Through the Awtsmoos the vault's bytes come back without disguise;
 * Awtsmoos.com requires a distinct read grant, and every hash must rise.
 * This joins real vault+writer in-process, not yet production HTTPS.
 */
test("separately granted raw bytes return from vault to guarded native file", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-roundtrip-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const bytes = crypto.randomBytes(CHUNK_BYTES + 133);
	const sha = buffer => crypto.createHash("sha256").update(buffer).digest("hex");
	const vault = new BinaryArtifactVault(path.join(root, "vault"));
	const session = vault.begin({ owner: "owner-A", tunnel: "mac-A",
		sourcePath: "sample.bin", expectedBytes: bytes.length,
		expectedSha256: sha(bytes) });
	assert.notEqual(session.uploadCapability, session.downloadCapability);
	for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
		const chunk = bytes.subarray(offset, offset + CHUNK_BYTES);
		await ingestBinaryChunk(vault, { id: session.transferId,
			capability: session.uploadCapability, owner: "owner-A", offset,
			sha256: sha(chunk), stream: Readable.from([chunk]) });
	}
	await completeBinaryArtifact(vault, { id: session.transferId,
		capability: session.uploadCapability, owner: "owner-A" });
	const destination = path.join(root, "destination");
	fs.mkdirSync(destination);
	const config = { root: destination, allowWrite: true, tools: { fsWrite: true } };
	const proof = { path: "copy.bin", expectedBytes: bytes.length, expectedSha256: sha(bytes) };
	const chunks = [];
	const result = await writeVerifiedBinary(config, proof, async (offset, count) => {
		chunks.push(count);
		return readPrivateArtifactRange(vault, { id: session.transferId,
			downloadCapability: session.downloadCapability, offset, bytes: count });
	});
	assert.equal(result.bytes, bytes.length);
	assert.equal(result.transport, "raw-bytes");
	assert.deepEqual(chunks, [CHUNK_BYTES, 133]);
	assert.deepEqual(fs.readFileSync(path.join(destination, "copy.bin")), bytes);
});
