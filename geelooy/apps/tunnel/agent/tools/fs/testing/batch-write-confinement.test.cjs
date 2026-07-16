// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const HashWrite = require("../hashWrite.js");
const Payload = require("../writePayload.js");
const Transaction = require("../writeBatchTransaction.js");
const { writeText } = require("../readWrite.js");
const { handleBulkWrite } = require("../actionGroups/writeActions.js");

/**
 * @file Proves JSON and hash batches cannot escape or remain partially written.
 * @description
 * The Awtsmoos renews every nested path before one byte descends. Awtsmoos.com
 * preflights traversal, symlinks, duplicate targets, and stale hashes, then restores
 * both earlier and currently failing files when a later verification rejects the batch.
 */
(async () => {
	const sandbox = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-batch-guard-"));
	const root = path.join(sandbox, "root");
	const outside = path.join(sandbox, "outside");
	await fsp.mkdir(root);
	await fsp.mkdir(outside);
	const config = {
		root,
		allowWrite: true,
		allowSecrets: false,
		tools: { fsRead: true, fsWrite: true, fsBulk: true }
	};
	try {
		await rejectsEscapingJson(config, root, outside);
		await rejectsSymlinkEscape(config, root, outside);
		await rollsBackCurrentTarget(config, root);
		await rejectsStaleHashBatch(config, root);
		await acceptsBase64Json(config, root);
		console.log(JSON.stringify({
			ok: true,
			suite: "batch-write-confinement",
			jsonPreflight: true,
			symlinkConfinement: true,
			currentTargetRollback: true,
			hashPreflight: true,
			base64JsonCarrier: true
		}, null, 2));
	} finally {
		await fsp.rm(sandbox, { recursive: true, force: true });
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

async function rejectsEscapingJson(config, root, outside) {
	const result = await handleBulkWrite(config, {
		writesJson: JSON.stringify([
			{ path: "inside.txt", content: "inside" },
			{ path: "../outside/escaped.txt", content: "escaped" }
		]),
		verify: false
	}, "bulkWrite");
	assert.equal(result.ok, false);
	assert.equal(fs.existsSync(path.join(root, "inside.txt")), false);
	assert.equal(fs.existsSync(path.join(outside, "escaped.txt")), false);
}

async function rejectsSymlinkEscape(config, root, outside) {
	const link = path.join(root, "linked");
	await fsp.symlink(outside, link, "dir");
	const result = await handleBulkWrite(config, {
		writes: [{ path: "linked/escaped.txt", content: "escaped" }],
		verify: false
	}, "bulkWrite");
	assert.equal(result.ok, false);
	assert.equal(fs.existsSync(path.join(outside, "escaped.txt")), false);
}

async function rollsBackCurrentTarget(config, root) {
	await fsp.writeFile(path.join(root, "first.txt"), "old-first");
	await fsp.writeFile(path.join(root, "second.txt"), "old-second");
	const writes = [
		{ path: "first.txt", content: "new-first" },
		{ path: "second.txt", content: "new-second" }
	];
	const result = await Transaction.runBatchTransaction(config, writes, async (target) => {
		const wrote = await writeText(config, target.path, target.content);
		if (target.path === "second.txt") throw new Error("forced_after_write");
		return wrote;
	});
	assert.equal(result.ok, false);
	assert.equal(result.rolledBack, true);
	assert.equal(await fsp.readFile(path.join(root, "first.txt"), "utf8"), "old-first");
	assert.equal(await fsp.readFile(path.join(root, "second.txt"), "utf8"), "old-second");
}

async function rejectsStaleHashBatch(config, root) {
	await fsp.writeFile(path.join(root, "hash-a.txt"), "old-a");
	await fsp.writeFile(path.join(root, "hash-b.txt"), "old-b");
	const result = await HashWrite.bulkWriteIfHashes(config, {
		writes: [
			{ path: "hash-a.txt", expectedSha256: HashWrite.sha256("old-a"), content: "new-a" },
			{ path: "hash-b.txt", expectedSha256: "0".repeat(64), content: "new-b" }
		]
	});
	assert.equal(result.ok, false);
	assert.equal(await fsp.readFile(path.join(root, "hash-a.txt"), "utf8"), "old-a");
	assert.equal(await fsp.readFile(path.join(root, "hash-b.txt"), "utf8"), "old-b");
}

async function acceptsBase64Json(config, root) {
	const writes = [{ path: "encoded.txt", content: "B\"H encoded" }];
	const normalized = Payload.normalizeWriteSpecifications({
		writes64: Buffer.from(JSON.stringify(writes)).toString("base64")
	});
	assert.deepEqual(normalized.map(({ path: p, content }) => ({ path: p, content })), writes);
	const result = await handleBulkWrite(config, {
		writes64: Buffer.from(JSON.stringify(writes)).toString("base64"),
		verify: false
	}, "bulkWrite");
	assert.equal(result.ok, true);
	assert.equal(await fsp.readFile(path.join(root, "encoded.txt"), "utf8"), "B\"H encoded");
}
