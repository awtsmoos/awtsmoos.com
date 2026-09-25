// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Session = require("../tools/fs/transfer/transferSession.js");

/**
 * @file Proves chunked transfer sessions: resume, integrity, conflicts, atomic commit.
 * @description
 * The Awtsmoos must carry files across flaps without loss or duplication.
 * Awtsmoos.com proves: interrupted uploads resume from the manifest, corrupt
 * chunks are rejected, name collisions never clobber, identical re-uploads are
 * idempotent, finalized receipts make finalize idempotent, and downloads
 * detect a changing source.
 */

const sha256Hex = buffer => crypto.createHash("sha256").update(buffer).digest("hex");

async function makeRoot() {
	const root = await fsp.mkdtemp(path.join(fs.realpathSync(os.tmpdir()), "xfer-test-"));
	return {
		root,
		config: { root, tools: { fsRead: true, fsWrite: true }, allowWrite: true }
	};
}

function chunkify(buffer, chunkBytes) {
	const chunks = [];
	for (let offset = 0; offset < buffer.length; offset += chunkBytes) {
		chunks.push(buffer.subarray(offset, offset + chunkBytes));
	}
	if (!chunks.length) chunks.push(buffer.subarray(0, 0));
	return chunks;
}

async function expectCode(promise, code) {
	try {
		await promise;
	} catch (error) {
		assert.equal(error.code, code, `expected ${code}, got ${error.code}: ${error.message}`);
		return error;
	}
	assert.fail(`expected throw with code ${code}`);
}

async function testUploadHappyPath() {
	const { root, config } = await makeRoot();
	const data = crypto.randomBytes(1_300_000); // ~1.3MB -> 3 chunks of 512KB
	const chunkBytes = 512 * 1024;
	const chunks = chunkify(data, chunkBytes);
	const init = await Session.initUpload(config, {
		transferId: "happy-1", destPath: "docs/report.bin",
		totalSize: data.length, chunkBytes,
		fileSha256: sha256Hex(data),
		chunkHashes: chunks.map(sha256Hex)
	});
	assert.equal(init.ok, true);
	assert.equal(init.chunkCount, 3);
	assert.equal(init.resumed, false);

	for (let i = 0; i < chunks.length; i++) {
		const got = await Session.putChunk(config, {
			transferId: "happy-1", destPath: "docs/report.bin",
			index: i, data64: chunks[i].toString("base64"), chunkSha256: sha256Hex(chunks[i])
		});
		assert.equal(got.ok, true);
		assert.equal(got.receivedCount, i + 1);
	}
	const done = await Session.finalizeTransfer(config, {
		transferId: "happy-1", destPath: "docs/report.bin", direction: "upload"
	});
	assert.equal(done.ok, true);
	assert.equal(done.verified, true);
	assert.equal(done.sha256, sha256Hex(data));
	assert.equal(done.bytes, data.length);
	assert.deepEqual(await fsp.readFile(path.join(root, "docs/report.bin")), data);
	// Session dir must be gone; receipt must exist for idempotent finalize.
	const again = await Session.finalizeTransfer(config, {
		transferId: "happy-1", destPath: "docs/report.bin", direction: "upload"
	});
	assert.equal(again.alreadyFinalized, true);
	assert.equal(again.path, done.path);
	await fsp.rm(root, { recursive: true, force: true });
	return "uploadHappyPath";
}

async function testResumeAfterInterruption() {
	const { root, config } = await makeRoot();
	const data = crypto.randomBytes(2_100_000);
	const chunkBytes = 512 * 1024;
	const chunks = chunkify(data, chunkBytes);
	const n = chunks.length;
	await Session.initUpload(config, {
		transferId: "resume-1", destPath: "big.bin",
		totalSize: data.length, chunkBytes,
		fileSha256: sha256Hex(data), chunkHashes: chunks.map(sha256Hex)
	});
	// Send all but the last chunk, then "the tunnel flaps": a fresh init call
	// with the same transferId must re-attach, not restart.
	for (let i = 0; i < n - 1; i++) {
		await Session.putChunk(config, {
			transferId: "resume-1", destPath: "big.bin",
			index: i, data64: chunks[i].toString("base64"), chunkSha256: sha256Hex(chunks[i])
		});
	}
	const reinit = await Session.initUpload(config, {
		transferId: "resume-1", destPath: "big.bin",
		totalSize: data.length, chunkBytes,
		fileSha256: sha256Hex(data), chunkHashes: chunks.map(sha256Hex)
	});
	assert.equal(reinit.resumed, true);
	assert.equal(reinit.receivedCount, n - 1);
	const status = await Session.transferStatus(config, { transferId: "resume-1", destPath: "big.bin" });
	assert.equal(status.complete, false);
	assert.deepEqual(status.missing, [[n - 1]]);
	// A duplicate chunk (replay) must be accepted idempotently.
	await Session.putChunk(config, {
		transferId: "resume-1", destPath: "big.bin",
		index: 0, data64: chunks[0].toString("base64"), chunkSha256: sha256Hex(chunks[0])
	});
	const status2 = await Session.transferStatus(config, { transferId: "resume-1", destPath: "big.bin" });
	assert.equal(status2.receivedCount, n - 1, "replay of a stored chunk must not double-count");
	// Finish and verify.
	await Session.putChunk(config, {
		transferId: "resume-1", destPath: "big.bin",
		index: n - 1, data64: chunks[n - 1].toString("base64"), chunkSha256: sha256Hex(chunks[n - 1])
	});
	const done = await Session.finalizeTransfer(config, {
		transferId: "resume-1", destPath: "big.bin", direction: "upload"
	});
	assert.equal(done.verified, true);
	assert.deepEqual(await fsp.readFile(path.join(root, "big.bin")), data);
	await fsp.rm(root, { recursive: true, force: true });
	return "resumeAfterInterruption";
}

async function testChunkIntegrity() {
	const { root, config } = await makeRoot();
	const data = crypto.randomBytes(600_000);
	const chunkBytes = 512 * 1024;
	const chunks = chunkify(data, chunkBytes);
	await Session.initUpload(config, {
		transferId: "integ-1", destPath: "f.bin",
		totalSize: data.length, chunkBytes,
		fileSha256: sha256Hex(data), chunkHashes: chunks.map(sha256Hex)
	});
	// Corrupted bytes with the true hash.
	const bad = Buffer.from(chunks[0]);
	bad[10] ^= 0xff;
	await expectCode(Session.putChunk(config, {
		transferId: "integ-1", destPath: "f.bin",
		index: 0, data64: bad.toString("base64"), chunkSha256: sha256Hex(chunks[0])
	}), "chunk_hash_mismatch");
	// True bytes with a lying hash.
	await expectCode(Session.putChunk(config, {
		transferId: "integ-1", destPath: "f.bin",
		index: 0, data64: chunks[0].toString("base64"), chunkSha256: sha256Hex(bad)
	}), "chunk_hash_mismatch");
	// Wrong length (manifest without chunkHashes: hash verifies, length must not).
	await Session.initUpload(config, {
		transferId: "integ-2", destPath: "g.bin",
		totalSize: data.length, chunkBytes,
		fileSha256: sha256Hex(data)
	});
	const short = chunks[0].subarray(0, 100);
	await expectCode(Session.putChunk(config, {
		transferId: "integ-2", destPath: "g.bin",
		index: 0, data64: short.toString("base64"), chunkSha256: sha256Hex(short)
	}), "chunk_length_mismatch");
	const status = await Session.transferStatus(config, { transferId: "integ-1", destPath: "f.bin" });
	assert.equal(status.receivedCount, 0, "rejected chunks must not be stored");
	await fsp.rm(root, { recursive: true, force: true });
	return "chunkIntegrity";
}

async function testConflictSafeNaming() {
	const { root, config } = await makeRoot();
	await fsp.writeFile(path.join(root, "photo.png"), Buffer.from("original-content"));
	const data = crypto.randomBytes(100_000);
	const chunkBytes = 512 * 1024;
	const chunks = chunkify(data, chunkBytes);
	const init = await Session.initUpload(config, {
		transferId: "conflict-1", destPath: "photo.png",
		totalSize: data.length, chunkBytes,
		fileSha256: sha256Hex(data), chunkHashes: chunks.map(sha256Hex)
	});
	assert.match(init.path, /photo \(2\)\.png$/, "collision must reserve Finder-style name");
	for (let i = 0; i < chunks.length; i++) {
		await Session.putChunk(config, {
			transferId: "conflict-1", destPath: "photo.png",
			index: i, data64: chunks[i].toString("base64"), chunkSha256: sha256Hex(chunks[i])
		});
	}
	const done = await Session.finalizeTransfer(config, {
		transferId: "conflict-1", destPath: "photo.png", direction: "upload"
	});
	assert.match(done.path, /photo \(2\)\.png$/);
	assert.equal((await fsp.readFile(path.join(root, "photo.png"), "utf8")), "original-content");
	assert.deepEqual(await fsp.readFile(path.join(root, "photo (2).png")), data);
	await fsp.rm(root, { recursive: true, force: true });
	return "conflictSafeNaming";
}

async function testIdenticalReuploadIsIdempotent() {
	const { root, config } = await makeRoot();
	const data = crypto.randomBytes(50_000);
	await fsp.writeFile(path.join(root, "same.bin"), data);
	const init = await Session.initUpload(config, {
		transferId: "idem-1", destPath: "same.bin",
		totalSize: data.length, chunkBytes: 512 * 1024,
		fileSha256: sha256Hex(data), chunkHashes: [sha256Hex(data)]
	});
	assert.equal(init.alreadyExists, true);
	assert.equal(init.verified, true);
	await fsp.rm(root, { recursive: true, force: true });
	return "identicalReuploadIdempotent";
}

async function testFingerprintMismatchRejected() {
	const { root, config } = await makeRoot();
	const data = crypto.randomBytes(100_000);
	await Session.initUpload(config, {
		transferId: "fp-1", destPath: "a.bin",
		totalSize: data.length, chunkBytes: 512 * 1024,
		fileSha256: sha256Hex(data), chunkHashes: [sha256Hex(data)]
	});
	const other = crypto.randomBytes(100_000);
	await expectCode(Session.initUpload(config, {
		transferId: "fp-1", destPath: "a.bin",
		totalSize: other.length, chunkBytes: 512 * 1024,
		fileSha256: sha256Hex(other), chunkHashes: [sha256Hex(other)]
	}), "transfer_fingerprint_mismatch");
	await fsp.rm(root, { recursive: true, force: true });
	return "fingerprintMismatchRejected";
}

async function testDownloadRoundTrip() {
	const { root, config } = await makeRoot();
	const data = crypto.randomBytes(1_400_000);
	await fsp.writeFile(path.join(root, "source.bin"), data);
	const init = await Session.initDownload(config, {
		transferId: "dl-1", sourcePath: "source.bin", chunkBytes: 512 * 1024
	});
	assert.equal(init.ok, true);
	assert.equal(init.fileSha256, sha256Hex(data));
	assert.equal(init.chunkCount, 3);
	const assembled = [];
	for (let i = 0; i < init.chunkCount; i++) {
		const got = await Session.getChunk(config, {
			transferId: "dl-1", sourcePath: "source.bin", index: i, direction: "download"
		});
		const bytes = Buffer.from(got.data64, "base64");
		assert.equal(sha256Hex(bytes), got.chunkSha256, "per-chunk hash must verify");
		assembled.push(bytes);
	}
	assert.equal(sha256Hex(Buffer.concat(assembled)), init.fileSha256);
	// Source changed mid-transfer must be detected.
	await fsp.writeFile(path.join(root, "source.bin"), Buffer.concat([data, Buffer.from("!")]));
	await expectCode(Session.getChunk(config, {
		transferId: "dl-1", sourcePath: "source.bin", index: 0, direction: "download"
	}), "source_changed");
	const closed = await Session.finalizeTransfer(config, {
		transferId: "dl-1", sourcePath: "source.bin", direction: "download"
	});
	assert.equal(closed.closed, true);
	await fsp.rm(root, { recursive: true, force: true });
	return "downloadRoundTrip";
}

async function testAbortAndValidation() {
	const { root, config } = await makeRoot();
	const data = crypto.randomBytes(10_000);
	await Session.initUpload(config, {
		transferId: "abort-1", destPath: "x.bin",
		totalSize: data.length, chunkBytes: 512 * 1024,
		fileSha256: sha256Hex(data), chunkHashes: [sha256Hex(data)]
	});
	const aborted = await Session.abortTransfer(config, { transferId: "abort-1", destPath: "x.bin" });
	assert.equal(aborted.aborted, true);
	const status = await Session.transferStatus(config, { transferId: "abort-1", destPath: "x.bin" });
	assert.equal(status.found, false);
	await expectCode(Session.initUpload(config, {
		transferId: "../evil", destPath: "x.bin", totalSize: 1, fileSha256: sha256Hex(Buffer.from("a"))
	}), "invalid_transfer_id");
	await expectCode(Session.initUpload(config, {
		transferId: "badhash-1", destPath: "x.bin", totalSize: 1, fileSha256: "not-a-hash"
	}), "invalid_sha256");
	await fsp.rm(root, { recursive: true, force: true });
	return "abortAndValidation";
}

async function run() {
	const results = [];
	for (const test of [
		testUploadHappyPath, testResumeAfterInterruption, testChunkIntegrity,
		testConflictSafeNaming, testIdenticalReuploadIsIdempotent,
		testFingerprintMismatchRejected, testDownloadRoundTrip, testAbortAndValidation
	]) {
		results.push(await test());
	}
	console.log(JSON.stringify({ ok: true, suite: "transfer-session", tests: results }, null, 2));
}

run().catch(error => {
	console.error(JSON.stringify({ ok: false, suite: "transfer-session", code: error.code, message: error.message }));
	process.exit(1);
});
