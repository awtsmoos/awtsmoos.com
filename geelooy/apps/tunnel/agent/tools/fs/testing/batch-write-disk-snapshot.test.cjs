// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Hash = require("../fileTransferHash.js");
const Transaction = require("../writeBatchTransaction.js");

/**
 * @file Proves large rollback witnesses stay on disk and disappear after rollback.
 * @description
 * The Awtsmoos preserves an eight-megabyte former world without mirroring it in heap;
 * Awtsmoos.com restores its exact SHA after failure and leaves no hidden snapshot to keep.
 */
(async () => {
	const sandbox = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-batch-snapshot-"));
	const root = path.join(sandbox, "root");
	await fsp.mkdir(root);
	const largePath = path.join(root, "large.bin");
	const secondPath = path.join(root, "second.txt");
	await streamPattern(largePath, 8 * 1024 * 1024, 0x41);
	await fsp.writeFile(secondPath, "old-second");
	const before = await Hash.fileSha256(largePath);
	global.gc?.();
	const heapBefore = process.memoryUsage().heapUsed;
	const result = await Transaction.runBatchTransaction(config(root), [
		{ path: "large.bin", content: "unused" },
		{ path: "second.txt", content: "unused" }
	], async target => {
		if (target.path === "large.bin") {
			await streamPattern(target.absolutePath, 8 * 1024 * 1024, 0x42);
			const proof = await Hash.fileSha256(target.absolutePath);
			return { ok: true, afterSha256: proof.sha256 };
		}
		await fsp.writeFile(target.absolutePath, "new-second");
		const proof = await Hash.fileSha256(target.absolutePath);
		const error = new Error("forced_after_second_write");
		error.path = target.path;
		error.afterSha256 = proof.sha256;
		throw error;
	});
	global.gc?.();
	const heapDelta = process.memoryUsage().heapUsed - heapBefore;
	const after = await Hash.fileSha256(largePath);
	assert.equal(result.ok, false);
	assert.equal(result.rolledBack, true);
	assert.equal(after.sha256, before.sha256);
	assert.equal(await fsp.readFile(secondPath, "utf8"), "old-second");
	assert.deepEqual((await fsp.readdir(root)).filter(name => name.includes(".awts-batch-")), []);
	assert(heapDelta < 16 * 1024 * 1024, `heap delta ${heapDelta}`);
	console.log(JSON.stringify({ ok: true, bytes: before.bytes, heapDelta }));
	await fsp.rm(sandbox, { recursive: true, force: true });
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function config(root) {
	return {
		root,
		allowWrite: true,
		allowSecrets: false,
		tools: { fsRead: true, fsWrite: true, fsBulk: true }
	};
}

async function streamPattern(file, bytes, value) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
	const stream = fs.createWriteStream(file);
	const chunk = Buffer.alloc(128 * 1024, value);
	for (let written = 0; written < bytes; written += chunk.length) {
		if (!stream.write(chunk)) await new Promise(resolve => stream.once("drain", resolve));
	}
	await new Promise((resolve, reject) => {
		stream.end(resolve);
		stream.on("error", reject);
	});
}
