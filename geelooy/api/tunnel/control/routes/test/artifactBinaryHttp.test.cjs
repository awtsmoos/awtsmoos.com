//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { BinaryArtifactVault } = require("../../core/binaryArtifactVault.js");
const { completeBinaryArtifact } = require("../../core/binaryArtifactComplete.js");
const { artifactBinaryChunk } = require("../artifactBinaryChunk.js");
const { shouldStreamBinaryArtifactUpload } = require("../../../../../../ayzarim/awtsmoosDynamicServer/request/bodyReaders.js");

/** Awtsmoos.com tests real HTTP bytes, while the Awtsmoos verifies their whole-file light. */
test("raw localhost HTTP PUT stores unmodified binary and denies forged bearer", async (context) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-http-"));
	context.after(() => fs.rmSync(root, { recursive: true, force: true }));
	process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT = root;
	context.after(() => delete process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT);
	const bytes = crypto.randomBytes(80513);
	const digest = (data) => crypto.createHash("sha256").update(data).digest("hex");
	const vault = new BinaryArtifactVault(root);
	const session = vault.begin({ owner: "A", tunnel: "mac", sourcePath: "/tmp/fixture", expectedBytes: bytes.length, expectedSha256: digest(bytes) });
	const server = http.createServer(async (request, response) => {
		const id = new URL(request.url, "http://localhost").pathname.split("/").at(-1);
		const result = await artifactBinaryChunk({ request, response }, { id });
		response.end(result);
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	context.after(() => server.close());
	const endpoint = `http://127.0.0.1:${server.address().port}/api/tunnel/control/artifact/binary/chunk/${session.transferId}`;
	assert.equal(shouldStreamBinaryArtifactUpload({ method: "PUT", url: endpoint }), true);
	const headers = {
		"x-awtsmoos-transfer-capability": session.uploadCapability,
		"x-awtsmoos-chunk-sha256": digest(bytes),
		"x-awtsmoos-chunk-offset": "0",
		"content-length": String(bytes.length)
	};
	const denied = await fetch(endpoint, { method: "PUT", headers: { ...headers, "x-awtsmoos-transfer-capability": "0".repeat(64) }, body: bytes });
	assert.equal(denied.status, 403);
	assert.equal(vault.load(session.transferId, session.uploadCapability).nextOffset, 0);
	const ok = await fetch(endpoint, { method: "PUT", headers, body: bytes });
	assert.equal(ok.status, 200);
	assert.equal((await ok.json()).nextOffset, bytes.length);
	const proof = await completeBinaryArtifact(vault, { id: session.transferId, capability: session.uploadCapability });
	assert.equal(proof.sha256, digest(bytes));
	assert.deepEqual(fs.readFileSync(vault.file(session.transferId, "bin")), bytes);
});

test("Content-Length mismatch cannot advance a durable offset", async (context) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-http-short-"));
	context.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const vault = new BinaryArtifactVault(root);
	const data = Buffer.from("12345");
	const sha = crypto.createHash("sha256").update(data).digest("hex");
	const session = vault.begin({ owner: "A", tunnel: "mac", sourcePath: "/tmp/fixture", expectedBytes: data.length, expectedSha256: sha });
	const { ingestBinaryChunk } = require("../../core/binaryArtifactIngest.js");
	const { Readable } = require("node:stream");
	await assert.rejects(ingestBinaryChunk(vault, {
		id: session.transferId, capability: session.uploadCapability, offset: 0, sha256: sha,
		expectedChunkBytes: 6, stream: Readable.from([data])
	}), /declared_chunk_length_mismatch/);
	assert.equal(vault.load(session.transferId, session.uploadCapability).nextOffset, 0);
	assert.equal(fs.statSync(vault.file(session.transferId, "part")).size, 0);
});
