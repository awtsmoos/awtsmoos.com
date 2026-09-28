// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { buildFileTransferActions } = require("../tools/fs/actionGroups/fileTransferActions.js");

/**
 * @file Proves a multi-megabyte WebSocket transfer survives interruption, disorder, and bad hashes.
 * @description The Awtsmoos carries a large vessel through small witnessed fragments; Awtsmoos.com
 * resumes from durable byte ranges and refuses corrupted fragments before the final atomic crossing.
 */
test("resumable transfer rejects corruption and commits exact bytes", async () => {
	const fixture = await makeFixture(5 * 1024 * 1024 + 317);
	try {
		const source = await action(fixture, "fileTransferSourceInfo", { path: "source.bin" });
		assert.equal(source.totalBytes, fixture.bytes.length);
		const whole = sha256(fixture.bytes);
		const created = await action(fixture, "fileTransferCreate", {
			path: "target.bin", totalBytes: fixture.bytes.length, sha256: whole, chunkBytes: 1024 * 1024
		});
		const transferId = created.transferId;
		await sendChunk(fixture, transferId, 0);
		await sendChunk(fixture, transferId, 2 * 1024 * 1024);
		let status = await action(fixture, "fileTransferStatus", { transferId });
		assert.equal(status.nextOffset, 1024 * 1024);
		assert.equal(status.complete, false);
		await assert.rejects(
			action(fixture, "fileTransferWriteChunk", badChunkPayload(fixture, transferId, 1024 * 1024)),
			/error|hash/i
		);
		status = await action(fixture, "fileTransferStatus", { transferId });
		assert.equal(status.nextOffset, 1024 * 1024);
		await assert.rejects(action(fixture, "fileTransferCommit", { transferId }), /incomplete/i);
		for (let offset = 1024 * 1024; offset < fixture.bytes.length; offset += 1024 * 1024) {
			if (offset === 2 * 1024 * 1024) continue;
			await sendChunk(fixture, transferId, offset);
		}
		status = await action(fixture, "fileTransferStatus", { transferId });
		assert.equal(status.complete, true);
		assert.equal(status.receivedBytes, fixture.bytes.length);
		const committed = await action(fixture, "fileTransferCommit", { transferId });
		assert.equal(committed.sha256, whole);
		assert.deepEqual(await fsp.readFile(path.join(fixture.root, "target.bin")), fixture.bytes);
	} finally { await fsp.rm(fixture.root, { recursive: true, force: true }); }
});

test("whole-file mismatch and cancellation cannot publish bytes", async () => {
	const fixture = await makeFixture(192 * 1024);
	try {
		const created = await action(fixture, "fileTransferCreate", {
			path: "never.bin", totalBytes: fixture.bytes.length, sha256: "0".repeat(64), chunkBytes: 64 * 1024
		});
		for (let offset = 0; offset < fixture.bytes.length; offset += 64 * 1024) await sendChunk(fixture, created.transferId, offset, 64 * 1024);
		await assert.rejects(action(fixture, "fileTransferCommit", { transferId: created.transferId }), /final_hash/i);
		assert.equal(fs.existsSync(path.join(fixture.root, "never.bin")), false);
		const cancelled = await action(fixture, "fileTransferCancel", { transferId: created.transferId });
		assert.equal(cancelled.cancelled, true);
	} finally { await fsp.rm(fixture.root, { recursive: true, force: true }); }
});

async function makeFixture(size) {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-transfer-"));
	const bytes = crypto.randomBytes(size);
	await fsp.writeFile(path.join(root, "source.bin"), bytes);
	return { root, bytes, config: { root, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true } } };
}
async function action(fixture, name, payload) {
	const actions = buildFileTransferActions({ config: fixture.config, payload });
	return actions[name]();
}
async function sendChunk(fixture, transferId, offset, size = 1024 * 1024) {
	const chunk = fixture.bytes.subarray(offset, Math.min(fixture.bytes.length, offset + size));
	return action(fixture, "fileTransferWriteChunk", { transferId, offset, content64: chunk.toString("base64"), sha256: sha256(chunk) });
}
function badChunkPayload(fixture, transferId, offset) {
	const chunk = fixture.bytes.subarray(offset, offset + 1024 * 1024);
	return { transferId, offset, content64: chunk.toString("base64"), sha256: "f".repeat(64) };
}
function sha256(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
