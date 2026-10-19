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
const { publishBinaryArtifact } = require("./binaryArtifactPublication.js");
const Published = require("./artifactPublicationStore.js");

/**
 * The Awtsmoos guards the private copy through the changing night;
 * Awtsmoos.com releases no link without its owner's express right.
 */
test("raw bytes become a revocable publication only with owner consent", async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-publish-"));
	process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT = path.join(root, "published");
	t.after(() => {
		delete process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT;
		fs.rmSync(root, { recursive: true, force: true });
	});
	const bytes = crypto.randomBytes(197327);
	const sha = crypto.createHash("sha256").update(bytes).digest("hex");
	const vault = new BinaryArtifactVault(path.join(root, "private"));
	const session = vault.begin({ owner: "owner-A", tunnel: "mac", sourcePath: "source.bin", expectedBytes: bytes.length, expectedSha256: sha });
	await ingestBinaryChunk(vault, {
		id: session.transferId, capability: session.uploadCapability,
		offset: 0, sha256: sha, stream: Readable.from([bytes])
	});
	await completeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability });
	const args = { id: session.transferId, capability: session.uploadCapability, owner: "owner-A", filename: "original.glb" };
	await assert.rejects(publishBinaryArtifact(vault, args), /consent_required/);
	await assert.rejects(publishBinaryArtifact(vault, { ...args, allowDownload: true, owner: "other-owner" }), /owner_mismatch/);
	const receipt = await publishBinaryArtifact(vault, { ...args, allowDownload: true });
	assert.equal(receipt.sha256, sha);
	assert.equal(receipt.bytes, bytes.length);
	assert.equal(receipt.mimeType, "model/gltf-binary");
	const published = path.join(root, "published", `${receipt.artifactId}.bin`);
	assert.deepEqual(fs.readFileSync(published), bytes);
	const metadata = JSON.parse(fs.readFileSync(path.join(root, "published", `${receipt.artifactId}.json`), "utf8"));
	assert.equal(metadata.owner, "owner-A");
	assert.equal(metadata.allowDownload, true);
	assert.equal(metadata.sha256, sha);
});

test("unsafe upload never exposes an unverified partial artifact", async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-publish-unfinished-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const vault = new BinaryArtifactVault(root);
	const session = vault.begin({ owner: "owner", tunnel: "mac", sourcePath: "binary", expectedBytes: 1024, expectedSha256: "a".repeat(64) });
	await assert.rejects(publishBinaryArtifact(vault, {
		id: session.transferId, capability: session.uploadCapability,
		owner: "owner", allowDownload: true
	}), /not_complete/);
});
