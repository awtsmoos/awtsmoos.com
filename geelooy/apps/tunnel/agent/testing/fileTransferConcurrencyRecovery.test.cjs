// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { buildFileTransferActions } = require("../tools/fs/actionGroups/fileTransferActions.js");
const Store = require("../tools/fs/fileTransferStore.js");

/**
 * @file Proves concurrent chunk custody and interrupted commit recovery.
 * @description The Awtsmoos may reveal one file through many simultaneous fragments of light;
 * Awtsmoos.com keeps every range in one ledger and can finish a rename interrupted between manifest states at night.
 */
let root = "";
let config = null;

main()
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		if (root) {
			await fsp.rm(root, { recursive: true, force: true });
		}
	});

async function main() {
	root = await fsp.mkdtemp(path.join(os.tmpdir(), "transfer-concurrency-"));
	config = {
		root,
		allowWrite: true,
		allowSecrets: false,
		tools: { fsRead: true, fsWrite: true }
	};
	const bytes = Buffer.alloc(512 * 1024, 0x5a);
	const expectedSha256 = sha256(bytes);
	const transferId = await createTransfer("parallel.bin", bytes, expectedSha256);
	await Promise.all(chunks(bytes, 64 * 1024).map(chunk => writeChunk(transferId, chunk)));
	const status = await action({ action: "fileTransferStatus", transferId });
	assert.equal(status.complete, true);
	assert.equal(status.receivedBytes, bytes.length);
	assert.deepEqual(status.ranges, [[0, bytes.length]]);
	const committed = await action({ action: "fileTransferCommit", transferId });
	assert.equal(committed.state, "committed");
	assert.deepEqual(await fsp.readFile(path.join(root, "parallel.bin")), bytes);
	await proveInterruptedCommit(bytes, expectedSha256);
	console.log(JSON.stringify({ ok: true, bytes: bytes.length, concurrentChunks: 8, recoveredCommit: true }, null, 2));
}

async function proveInterruptedCommit(bytes, expectedSha256) {
	const transferId = await createTransfer("recovered.bin", bytes, expectedSha256);
	for (const chunk of chunks(bytes, 128 * 1024)) {
		await writeChunk(transferId, chunk);
	}
	const loaded = await Store.load(config, transferId);
	loaded.manifest.state = "committing";
	loaded.manifest.committingAt = new Date().toISOString();
	await Store.save(loaded.transfer, loaded.manifest);
	await fsp.rename(loaded.transfer.payload, path.join(root, "recovered.bin"));
	const recovered = await action({ action: "fileTransferCommit", transferId });
	assert.equal(recovered.state, "committed");
	assert.deepEqual(await fsp.readFile(path.join(root, "recovered.bin")), bytes);
}

async function createTransfer(targetPath, bytes, expectedSha256) {
	const created = await action({
		action: "fileTransferCreate",
		path: targetPath,
		totalBytes: bytes.length,
		expectedSha256,
		chunkBytes: 128 * 1024
	});
	return created.transferId;
}

async function writeChunk(transferId, chunk) {
	return action({
		action: "fileTransferWriteChunk",
		transferId,
		offset: chunk.offset,
		content64: chunk.bytes.toString("base64"),
		sha256: sha256(chunk.bytes)
	});
}

async function action(payload) {
	const actions = buildFileTransferActions({ config, payload });
	return actions[payload.action]();
}

function chunks(bytes, chunkBytes) {
	const result = [];
	for (let offset = 0; offset < bytes.length; offset += chunkBytes) {
		result.push({
			offset,
			bytes: bytes.subarray(offset, Math.min(offset + chunkBytes, bytes.length))
		});
	}
	return result;
}

function sha256(bytes) {
	return crypto.createHash("sha256").update(bytes).digest("hex");
}
