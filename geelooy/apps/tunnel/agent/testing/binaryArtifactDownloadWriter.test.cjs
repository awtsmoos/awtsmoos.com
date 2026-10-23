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
const { writeVerifiedBinary } = require("../tools/fs/binaryArtifactDownloadWriter.js");

/**
 * By the Awtsmoos each raw byte crosses in the clear of truth;
 * Awtsmoos.com tests its faithful arrival with living proof.
 * Every test owns a temporary root; no production file is touched.
 */
function fixture(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-binary-writer-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	return { root, tools: { fsWrite: true }, allowWrite: true, allowSecrets: true };
}

/** @param {Buffer} bytes Exact binary content whose hash will be verified. */
function proof(bytes, name = "out.bin", overwrite = false) {
	return {
		path: name,
		expectedBytes: bytes.length,
		expectedSha256: crypto.createHash("sha256").update(bytes).digest("hex"),
		overwrite
	};
}

/** Provide raw bytes at the requested offset without encoding them. */
function reader(bytes) {
	return async (offset, count) => bytes.subarray(offset, offset + count);
}

test("writes multi-chunk raw binary without Base64 conversion", async t => {
	const config = fixture(t);
	const bytes = crypto.randomBytes(1048576 + 127);
	const received = [];
	const result = await writeVerifiedBinary(config, proof(bytes), async (offset, count) => {
		received.push(count);
		return reader(bytes)(offset, count);
	});
	assert.deepEqual(received, [1048576, 127]);
	assert.deepEqual(fs.readFileSync(path.join(config.root, "out.bin")), bytes);
	assert.equal(result.transport, "raw-bytes");
	assert.equal(result.performed, true);
});

test("zero-byte file verifies the empty SHA-256", async t => {
	const config = fixture(t);
	const bytes = Buffer.alloc(0);
	const result = await writeVerifiedBinary(config, proof(bytes), () => {
		throw Error("reader_must_not_run");
	});
	assert.equal(result.bytes, 0);
	assert.equal(fs.statSync(path.join(config.root, "out.bin")).size, 0);
});

test("rejects hash mismatch and leaves no partially published file", async t => {
	const config = fixture(t);
	const bytes = crypto.randomBytes(64);
	await assert.rejects(
		writeVerifiedBinary(config, proof(bytes), reader(Buffer.alloc(bytes.length))),
		/binary_download_sha256_mismatch/
	);
	assert.deepEqual(fs.readdirSync(config.root), []);
});

test("rejects short or non-buffer chunks without publishing", async t => {
	const config = fixture(t);
	const bytes = crypto.randomBytes(64);
	await assert.rejects(
		writeVerifiedBinary(config, proof(bytes), async () => "not-binary"),
		/binary_download_chunk_length_mismatch/
	);
	assert.deepEqual(fs.readdirSync(config.root), []);
});

test("no-overwrite refuses existing files and overwrite replaces safely", async t => {
	const config = fixture(t);
	const bytes = Buffer.from("new raw content");
	fs.writeFileSync(path.join(config.root, "out.bin"), "old content");
	await assert.rejects(
		writeVerifiedBinary(config, proof(bytes), reader(bytes)),
		/binary_download_destination_exists/
	);
	await writeVerifiedBinary(config, proof(bytes, "out.bin", true), reader(bytes));
	assert.deepEqual(fs.readFileSync(path.join(config.root, "out.bin")), bytes);
});

test("does not overwrite a destination symlink even inside root", async t => {
	const config = fixture(t);
	const target = path.join(config.root, "precious.txt");
	fs.writeFileSync(target, "preserve");
	fs.symlinkSync(target, path.join(config.root, "out.bin"));
	const bytes = Buffer.from("attacker data");
	await assert.rejects(
		writeVerifiedBinary(config, proof(bytes, "out.bin", true), reader(bytes)),
		/binary_download_unsafe_destination/
	);
	assert.equal(fs.readFileSync(target, "utf8"), "preserve");
});

test("disabled writes and outside-root targets fail closed", async t => {
	const config = fixture(t);
	const bytes = Buffer.from("content");
	await assert.rejects(
		writeVerifiedBinary({ ...config, allowWrite: false }, proof(bytes), reader(bytes)),
		/binary_download_writes_disabled/
	);
	await assert.rejects(
		writeVerifiedBinary(config, proof(bytes, "../escape.bin"), reader(bytes)),
		/path_outside_project_root/
	);
});
