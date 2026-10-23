//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { Readable } = require("node:stream");
const { performance } = require("node:perf_hooks");
const { BinaryArtifactVault } = require("./binaryArtifactVault.js");
const { ingestBinaryChunk } = require("./binaryArtifactIngest.js");
const { completeBinaryArtifact } = require("./binaryArtifactComplete.js");
const { readPrivateArtifactRange } = require("./binaryArtifactPrivateRange.js");
const { CHUNK_BYTES } = require("./binaryArtifactProtocol.js");
const { writeVerifiedBinary } = require("../../../../apps/tunnel/agent/tools/fs/binaryArtifactDownloadWriter.js");
const { createStressFixture, readStressSha256, assertStressFilesIdentical } = require("./binaryArtifactStressFixture.cjs");

/**
 * Awtsmoos.com gives the vault its light, each counted byte its place;
 * the Awtsmoos shows no claimed transfer without a real destination trace.
 * Exercise actual disk-backed vault ingestion and the native verified writer.
 */
test("bounded raw binary vault round trips preserve exact bytes", { timeout: 240000 }, async context => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-binary-stress-"));
	context.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const sizes = [0, 1, 255, 256, 4096, 65536, CHUNK_BYTES, CHUNK_BYTES + 1,
		10 * CHUNK_BYTES, 100 * CHUNK_BYTES];
	for (const byteCount of sizes) {
		await verifyRoundTrip(root, byteCount);
	}
});

/** Transfer a deterministic fixture through real vault modules and disk writer. */
async function verifyRoundTrip(root, byteCount) {
	const started = performance.now();
	const source = createStressFixture(root, byteCount);
	const vault = new BinaryArtifactVault(path.join(root, `vault-${byteCount}`));
	const session = vault.begin({
		owner: "stress-owner",
		tunnel: "stress-mac",
		sourcePath: source.path,
		expectedBytes: source.bytes,
		expectedSha256: source.sha256
	});
	assert.notEqual(session.uploadCapability, session.downloadCapability);
	const descriptor = fs.openSync(source.path, "r");
	let uploadChunks = 0;
	let downloadChunks = 0;
	let highestRss = process.memoryUsage().rss;
	try {
		for (let offset = 0; offset < byteCount; offset += CHUNK_BYTES) {
			const length = Math.min(CHUNK_BYTES, byteCount - offset);
			const chunk = Buffer.allocUnsafe(length);
			assert.equal(fs.readSync(descriptor, chunk, 0, length, offset), length);
			await ingestBinaryChunk(vault, {
				id: session.transferId,
				owner: "stress-owner",
				capability: session.uploadCapability,
				offset,
				sha256: crypto.createHash("sha256").update(chunk).digest("hex"),
				stream: Readable.from([chunk])
			});
			uploadChunks += 1;
			highestRss = Math.max(highestRss, process.memoryUsage().rss);
		}
	} finally {
		fs.closeSync(descriptor);
	}
	await completeBinaryArtifact(vault, {
		id: session.transferId,
		owner: "stress-owner",
		capability: session.uploadCapability
	});
	const destinationRoot = path.join(root, `destination-${byteCount}`);
	fs.mkdirSync(destinationRoot);
	const result = await writeVerifiedBinary({
		root: destinationRoot,
		allowWrite: true,
		tools: { fsWrite: true }
	}, {
		path: "verified.bin",
		expectedBytes: byteCount,
		expectedSha256: source.sha256
	}, async (offset, bytes) => {
		downloadChunks += 1;
		highestRss = Math.max(highestRss, process.memoryUsage().rss);
		return readPrivateArtifactRange(vault, {
			id: session.transferId,
			downloadCapability: session.downloadCapability,
			offset,
			bytes
		});
	});
	const destination = path.join(destinationRoot, "verified.bin");
	assert.equal(result.bytes, byteCount);
	assert.equal(fs.statSync(destination).size, byteCount);
	assert.equal(await readStressSha256(destination), source.sha256);
	assertStressFilesIdentical(assert, source.path, destination);
	const elapsedMs = performance.now() - started;
	console.log("BINARY_STRESS_EVIDENCE " + JSON.stringify({
		byteCount,
		sha256: source.sha256,
		uploadChunks,
		downloadChunks,
		elapsedMs: Number(elapsedMs.toFixed(2)),
		throughputMiBps: Number((byteCount / 1048576 / (elapsedMs / 1000)).toFixed(2)),
		highestObservedRss: highestRss
	}));
}
