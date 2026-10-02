// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Chunk = require("../fileTransferChunkWrite.js");
const Store = require("../fileTransferStore.js");
const Batch = require("../writeBatchTransfers.js");

/**
 * @file Proves staged multi-megabyte transfers publish together or not at all.
 * @description
 * The Awtsmoos keeps both great rivers staged when one shore refuses the batch;
 * Awtsmoos.com restores the first shore, then retries the same uploads into one verified world.
 */
(async () => {
	const sandbox = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-batch-transfer-"));
	const root = path.join(sandbox, "root");
	await fsp.mkdir(root);
	const config = configuration(root);
	await fsp.writeFile(path.join(root, "a.txt"), "old-a");
	await fsp.writeFile(path.join(root, "b.txt"), "old-b");
	const bodyA = Buffer.alloc(2 * 1024 * 1024 + 17, 0x41);
	const bodyB = Buffer.alloc(3 * 1024 * 1024 + 29, 0x42);
	const first = await stage(config, "a.txt", bodyA, true);
	const second = await stage(config, "b.txt", bodyB, false);
	const failed = await Batch.bulkWriteTransfers(config, {
		transfers: [first.transferId, second.transferId]
	});
	assert.equal(failed.ok, false);
	assert.equal(failed.rolledBack, true);
	assert.equal(failed.stagedPreserved, true);
	assert.equal(await fsp.readFile(path.join(root, "a.txt"), "utf8"), "old-a");
	assert.equal(await fsp.readFile(path.join(root, "b.txt"), "utf8"), "old-b");
	assert.equal((await Store.load(config, first.transferId)).manifest.state, "receiving");
	assert.equal((await Store.load(config, second.transferId)).manifest.state, "receiving");
	const secondLoaded = await Store.load(config, second.transferId);
	secondLoaded.manifest.overwrite = true;
	await Store.save(secondLoaded.transfer, secondLoaded.manifest);
	const success = await Batch.bulkWriteTransfers(config, {
		transfers: [first.transferId, second.transferId]
	});
	assert.equal(success.ok, true);
	assert.equal(success.stagedPreserved, false);
	assert.equal(success.transferMetadataComplete, true);
	assert.deepEqual(success.metadataWarnings, []);
	assert.deepEqual(await fsp.readFile(path.join(root, "a.txt")), bodyA);
	assert.deepEqual(await fsp.readFile(path.join(root, "b.txt")), bodyB);
	await assertCommitted(config, first.transferId);
	await assertCommitted(config, second.transferId);
	console.log(JSON.stringify({ ok: true, bytes: bodyA.length + bodyB.length }));
	await fsp.rm(sandbox, { recursive: true, force: true });
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function configuration(root) {
	return {
		root,
		allowWrite: true,
		allowSecrets: false,
		tools: { fsRead: true, fsWrite: true, fsBulk: true }
	};
}

async function stage(config, target, body, overwrite) {
	const sha256 = crypto.createHash("sha256").update(body).digest("hex");
	const manifest = await Store.create(config, {
		path: target,
		totalBytes: body.length,
		chunkBytes: 64 * 1024,
		expectedSha256: sha256,
		overwrite
	});
	for (let offset = 0; offset < body.length; offset += 64 * 1024) {
		const bytes = body.subarray(offset, Math.min(body.length, offset + 64 * 1024));
		await Chunk.writeChunk(config, {
			transferId: manifest.transferId,
			offset,
			sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
			content64: bytes.toString("base64")
		});
	}
	return manifest;
}

async function assertCommitted(config, transferId) {
	const loaded = await Store.load(config, transferId);
	assert.equal(loaded.manifest.state, "committed");
	assert.equal(loaded.manifest.batchCommitted, true);
	await assert.rejects(fsp.stat(loaded.transfer.payload), error => error.code === "ENOENT");
}
