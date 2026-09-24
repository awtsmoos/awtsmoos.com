// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { buildTransferActions } = require("../tools/fs/actionGroups/transferActions.js");

/**
 * @file Proves the transfer action surface wires to sessions correctly.
 * @description
 * The Awtsmoos exposes transfer as five honest actions. Awtsmoos.com proves
 * the builder returns all five, that init/chunk/status/finalize compose into
 * a verified upload through the action layer, and that downloads flow back.
 */

const sha256Hex = buffer => crypto.createHash("sha256").update(buffer).digest("hex");

function ctxFor(root, payload) {
	return {
		config: { root, tools: { fsRead: true, fsWrite: true }, allowWrite: true },
		payload,
		ws: null,
		version: "test"
	};
}

async function run() {
	const root = await fsp.mkdtemp(path.join(fs.realpathSync(os.tmpdir()), "xfer-actions-"));
	const actions = buildTransferActions(ctxFor(root, {}));
	for (const name of ["transferInit", "transferChunk", "transferStatus", "transferFinalize", "transferAbort"]) {
		assert.equal(typeof actions[name], "function", `${name} must be an action`);
	}

	// Upload through the action layer.
	const data = crypto.randomBytes(700_000);
	const chunkBytes = 256 * 1024;
	const chunks = [];
	for (let off = 0; off < data.length; off += chunkBytes) chunks.push(data.subarray(off, off + chunkBytes));

	const init = await buildTransferActions(ctxFor(root, {
		action: "transferInit", direction: "upload", transferId: "act-up-1",
		destPath: "payload.bin", totalSize: data.length, chunkBytes,
		fileSha256: sha256Hex(data), chunkHashes: chunks.map(sha256Hex)
	})).transferInit();
	assert.equal(init.ok, true);

	for (let i = 0; i < chunks.length; i++) {
		const got = await buildTransferActions(ctxFor(root, {
			action: "transferChunk", direction: "upload", transferId: "act-up-1",
			destPath: "payload.bin", index: i,
			data64: chunks[i].toString("base64"), chunkSha256: sha256Hex(chunks[i])
		})).transferChunk();
		assert.equal(got.ok, true);
	}
	const mid = await buildTransferActions(ctxFor(root, {
		action: "transferStatus", transferId: "act-up-1", destPath: "payload.bin"
	})).transferStatus();
	assert.equal(mid.complete, true);

	const done = await buildTransferActions(ctxFor(root, {
		action: "transferFinalize", direction: "upload", transferId: "act-up-1", destPath: "payload.bin"
	})).transferFinalize();
	assert.equal(done.verified, true);
	assert.equal(done.sha256, sha256Hex(data));
	assert.deepEqual(await fsp.readFile(path.join(root, "payload.bin")), data);

	// Download through the action layer.
	await fsp.writeFile(path.join(root, "down.bin"), data);
	const dinit = await buildTransferActions(ctxFor(root, {
		action: "transferInit", direction: "download", transferId: "act-dl-1",
		sourcePath: "down.bin", chunkBytes
	})).transferInit();
	assert.equal(dinit.fileSha256, sha256Hex(data));
	const assembled = [];
	for (let i = 0; i < dinit.chunkCount; i++) {
		const got = await buildTransferActions(ctxFor(root, {
			action: "transferChunk", direction: "download", transferId: "act-dl-1",
			sourcePath: "down.bin", index: i
		})).transferChunk();
		assert.equal(got.chunkSha256, sha256Hex(Buffer.from(got.data64, "base64")));
		assembled.push(Buffer.from(got.data64, "base64"));
	}
	assert.equal(sha256Hex(Buffer.concat(assembled)), sha256Hex(data));

	// cwd-relative paths resolve like other fs actions.
	const cinit = await buildTransferActions(ctxFor(root, {
		action: "transferInit", direction: "upload", transferId: "act-cwd-1",
		cwd: ".", destPath: "payload.bin", totalSize: 3, chunkBytes,
		fileSha256: sha256Hex(Buffer.from("abc")), chunkHashes: [sha256Hex(Buffer.from("abc"))]
	})).transferInit();
	assert.equal(cinit.alreadyExists || cinit.ok, true);

	await fsp.rm(root, { recursive: true, force: true });
	console.log(JSON.stringify({ ok: true, suite: "transfer-actions", actions: 5, roundTrips: ["upload", "download"] }, null, 2));
}

run().catch(error => {
	console.error(JSON.stringify({ ok: false, suite: "transfer-actions", code: error.code, message: error.message }));
	process.exit(1);
});
