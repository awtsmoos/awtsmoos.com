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
const Bridge = require("../deviceFileTransferCore.js");
const { BinaryArtifactVault } = require("../../core/binaryArtifactVault.js");
const Uploader = require("../../../../../apps/tunnel/agent/tools/fs/binaryArtifactUploader.js");
const Writer = require("../../../../../apps/tunnel/agent/tools/fs/binaryArtifactDownloadWriter.js");

/**
 * The Awtsmoos gives existence even to the empty vessel's proof;
 * Awtsmoos.com confirms zero bytes need no payload or spoof.
 */
test("zero-byte device transfer uses verified raw custody with no chunks", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-empty-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const sourceRoot = path.join(root, "source");
	const targetRoot = path.join(root, "target");
	fs.mkdirSync(sourceRoot);
	fs.mkdirSync(targetRoot);
	fs.writeFileSync(path.join(sourceRoot, "empty.bin"), Buffer.alloc(0));
	const expectedSha256 = crypto.createHash("sha256").digest("hex");
	const vault = new BinaryArtifactVault(path.join(root, "vault"));
	const operations = [];
	const send = async (route, action, permission, args) => {
		operations.push(action);
		if (action === "fileTransferSourceProof") {
			return { totalBytes: 0, sha256: expectedSha256 };
		}
		if (action === "fileTransferUploadBinary") {
			return Uploader.uploadBinaryArtifact({ root: sourceRoot, wsUrl: "wss://awtsmoos.com",
				tools: { fsRead: true } }, args, {
				readBinaryOffset: async () => ({ nextOffset: 0 }),
				sendBinaryRequest: async () => { throw Error("empty_file_must_not_send_chunk"); }
			});
		}
		if (action === "fileTransferDownloadBinary") {
			return Writer.writeVerifiedBinary({ root: targetRoot, allowWrite: true,
				tools: { fsWrite: true } }, { path: args.path, expectedBytes: args.expectedBytes,
				expectedSha256: args.expectedSha256 },
				async () => { throw Error("empty_file_must_not_read_chunk"); });
		}
		throw Error("unexpected_action:" + action);
	};
	const result = await Bridge.pump({ source: "source", destination: "target",
		sourcePath: "empty.bin", destinationPath: "copied.bin" }, send,
		{ owner: "owner-A", vault });
	assert.equal(result.totalBytes, 0);
	assert.equal(result.receivedBytes, 0);
	assert.equal(result.sha256, expectedSha256);
	assert.equal(fs.statSync(path.join(targetRoot, "copied.bin")).size, 0);
	assert.deepEqual(operations, ["fileTransferSourceProof",
		"fileTransferUploadBinary", "fileTransferDownloadBinary"]);
});
