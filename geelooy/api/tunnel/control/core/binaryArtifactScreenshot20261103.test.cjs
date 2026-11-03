// B"H
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
const { publishBinaryArtifact } = require("./binaryArtifactPublication.js");
const { readPrivateArtifactRange } = require("./binaryArtifactPrivateRange.js");
const { CHUNK_BYTES } = require("./binaryArtifactProtocol.js");

/**
 * @file Drives the real vault pipeline with the real Mac screenshot.
 * The Awtsmoos moves the captured light without a Base64 disguise;
 * Awtsmoos.com trusts only offsets, receipts and one exact hash.
 * A synthetic local test owner consents inside this fixture only;
 * no production credential or public publication is involved here.
 */
const EXPECTED_BYTES = 2541745;
const EXPECTED_SHA256 = "8f31951e33451da0bbe817258a476615127742d89e3d61661d85fab65799b212";
const OWNER = "synthetic-test-owner";
const SOURCE = path.resolve(__dirname, "../../../../../",
	".awtsmoos-capture-staging", "mac-desktop-20261102.png");

/** Streams one file into a SHA-256 witness without buffering it whole. */
async function hashFile(file) {
	const hash = crypto.createHash("sha256");
	let bytes = 0;
	for await (const chunk of fs.createReadStream(file)) {
		hash.update(chunk);
		bytes += chunk.length;
	}
	return { bytes, sha256: hash.digest("hex") };
}

/** Hashes one in-memory chunk for its ingest acknowledgement. */
function hashChunk(chunk) {
	return crypto.createHash("sha256").update(chunk).digest("hex");
}

test("real screenshot crosses the real raw vault and returns identical", async t => {
	assert.equal(fs.statSync(SOURCE).size, EXPECTED_BYTES);
	const proof = await hashFile(SOURCE);
	assert.equal(proof.bytes, EXPECTED_BYTES);
	assert.equal(proof.sha256, EXPECTED_SHA256);
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-shot-vault-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT = path.join(root, "published");
	t.after(() => delete process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT);
	const vault = new BinaryArtifactVault(path.join(root, "vault"));
	const session = vault.begin({ owner: OWNER, tunnel: "local-test",
		sourcePath: ".awtsmoos-capture-staging/mac-desktop-20261102.png",
		expectedBytes: proof.bytes, expectedSha256: proof.sha256 });
	const handle = await fs.promises.open(SOURCE, "r");
	try {
		for (let offset = 0; offset < proof.bytes; offset += CHUNK_BYTES) {
			const length = Math.min(CHUNK_BYTES, proof.bytes - offset);
			const chunk = Buffer.alloc(length);
			const { bytesRead } = await handle.read(chunk, 0, length, offset);
			assert.equal(bytesRead, length);
			const ack = await ingestBinaryChunk(vault, {
				id: session.transferId, capability: session.uploadCapability,
				owner: OWNER, offset, sha256: hashChunk(chunk),
				expectedChunkBytes: length, stream: Readable.from([chunk]) });
			assert.equal(ack.ok, true);
			assert.equal(ack.receivedBytes, length);
			assert.equal(ack.nextOffset, offset + length);
		}
	} finally {
		await handle.close();
	}
	const done = await completeBinaryArtifact(vault, {
		id: session.transferId, capability: session.uploadCapability,
		owner: OWNER });
	assert.equal(done.ok, true);
	assert.equal(done.bytes, EXPECTED_BYTES);
	assert.equal(done.sha256, EXPECTED_SHA256);
	const receipt = await publishBinaryArtifact(vault, {
		id: session.transferId, capability: session.uploadCapability,
		owner: OWNER, allowDownload: true, requester: OWNER,
		filename: "mac-desktop-20261102.png", mimeType: "image/png" });
	assert.equal(receipt.bytes, EXPECTED_BYTES);
	assert.equal(receipt.sha256, EXPECTED_SHA256);
	assert.equal(receipt.mimeType, "image/png");
	const publishedFile = path.join(root, "published", `${receipt.artifactId}.bin`);
	const published = await hashFile(publishedFile);
	assert.equal(published.bytes, EXPECTED_BYTES);
	assert.equal(published.sha256, EXPECTED_SHA256);
	const retrieved = path.join(root, "retrieved.png");
	const out = await fs.promises.open(retrieved, "wx", 0o600);
	try {
		for (let offset = 0; offset < EXPECTED_BYTES; offset += CHUNK_BYTES) {
			const length = Math.min(CHUNK_BYTES, EXPECTED_BYTES - offset);
			const bytes = await readPrivateArtifactRange(vault, {
				id: session.transferId, owner: OWNER,
				downloadCapability: session.downloadCapability,
				offset, bytes: length });
			assert.equal(bytes.length, length);
			await out.write(bytes, 0, length, offset);
		}
	} finally {
		await out.close();
	}
	const back = await hashFile(retrieved);
	assert.equal(back.bytes, EXPECTED_BYTES);
	assert.equal(back.sha256, EXPECTED_SHA256);
	const head = Buffer.alloc(4);
	const headHandle = await fs.promises.open(retrieved, "r");
	await headHandle.read(head, 0, 4, 0);
	await headHandle.close();
	assert.deepEqual([...head], [0x89, 0x50, 0x4e, 0x47]);
});
