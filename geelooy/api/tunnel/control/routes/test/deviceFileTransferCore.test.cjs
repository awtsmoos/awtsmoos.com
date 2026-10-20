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
const Bridge = require("../deviceFileTransferCore.js");
const { BinaryArtifactVault } = require("../../core/binaryArtifactVault.js");
const { ingestBinaryChunk } = require("../../core/binaryArtifactIngest.js");
const { readPrivateArtifactRange } = require("../../core/binaryArtifactPrivateRange.js");
const { writeVerifiedBinary } = require("../../../../../apps/tunnel/agent/tools/fs/binaryArtifactDownloadWriter.js");

/**
 * The Awtsmoos carries authentic bytes through the proven custody stream;
 * Awtsmoos.com rejects all disguised Base64 and all false success dreams.
 * Real vault and real guarded writer; network HTTP remains a separate gate.
 */
test("controller binary pump uses only scoped raw actions and commits identical bytes", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-bridge-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const dest = path.join(root, "destination");
	fs.mkdirSync(dest);
	const source = crypto.randomBytes(1048576 + 41);
	const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
	const expectedHash = sha(source);
	const vault = new BinaryArtifactVault(path.join(root, "vault"));
	const seen = [];
	let uploadCapability;
	const send = async (route, action, scope, params) => {
		seen.push(action);
		if (action === "fileTransferSourceProof") {
			assert.equal(route, "source");
			assert.equal(scope, "tunnel.read");
			return { totalBytes: source.length, sha256: expectedHash };
		}
		if (action === "fileTransferUploadBinary") {
			assert.equal(scope, "tunnel.read");
			uploadCapability = params.uploadCapability;
			for (let offset = 0; offset < source.length; offset += 1048576) {
				const chunk = source.subarray(offset, offset + 1048576);
				await ingestBinaryChunk(vault, { id: params.transferId,
					owner: "owner-A", capability: params.uploadCapability, offset,
					sha256: sha(chunk), stream: Readable.from([chunk]) });
			}
			return { ok: true, bytes: source.length, sha256: expectedHash };
		}
		if (action === "fileTransferDownloadBinary") {
			assert.equal(route, "destination");
			assert.equal(scope, "tunnel.write");
			assert.notEqual(params.downloadCapability, uploadCapability);
			return writeVerifiedBinary({ root: dest, allowWrite: true,
				tools: { fsWrite: true } }, { path: params.path,
				expectedBytes: params.expectedBytes,
				expectedSha256: params.expectedSha256,
				overwrite: params.overwrite }, (offset, bytes) =>
				readPrivateArtifactRange(vault, { id: params.transferId,
					downloadCapability: params.downloadCapability, offset, bytes }));
		}
		throw Error(`unexpected_action:${action}`);
	};
	const input = { source: "source", destination: "destination",
		sourcePath: "source.bin", destinationPath: "copied.bin" };
	const result = await Bridge.pump(input, send, { owner: "owner-A", vault });
	assert.equal(result.done, true);
	assert.equal(result.transport, "raw-https-chunks");
	assert.deepEqual(seen, ["fileTransferSourceProof",
		"fileTransferUploadBinary", "fileTransferDownloadBinary"]);
	assert.deepEqual(fs.readFileSync(path.join(dest, "copied.bin")), source);
	await assert.rejects(Bridge.pump({ ...input, transferId: "old" }, send,
		{ owner: "owner-A", vault }), /legacy_transfer_resume_not_supported/);
	await assert.rejects(Bridge.pump(input, send, { vault }), /binary_transfer_owner_required/);
});

test("legacy chunk parameters are not a binary-data fallback", () => {
	assert.equal(Bridge.boundedChunks(1000), Bridge.MAX_CHUNKS);
	assert.equal(Bridge.boundedChunks(0), Bridge.DEFAULT_MAX_CHUNKS);
});
