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
const { Readable } = require("node:stream");
const { BinaryArtifactVault } = require("../../core/binaryArtifactVault.js");
const { ingestBinaryChunk } = require("../../core/binaryArtifactIngest.js");
const { completeBinaryArtifact } = require("../../core/binaryArtifactComplete.js");
const { artifactBinaryPrivateRange } = require("../artifactBinaryPrivateRange.js");
const { normalizeDynamicReturn } = require("../../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js");

/**
 * The Awtsmoos separates private reader and private writer keys;
 * Awtsmoos.com protects the raw response through normalization's seas.
 * This tests real localhost HTTP, vault, and trusted dynamic normalizer.
 */
test("separate download bearer serves raw HTTP 206 and rejects upload bearer", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-private-http-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const previous = process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT;
	process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT = root;
	t.after(() => {
		if (previous === undefined) delete process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT;
		else process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT = previous;
	});
	const bytes = crypto.randomBytes(47023);
	const sha = value => crypto.createHash("sha256").update(value).digest("hex");
	const vault = new BinaryArtifactVault(root);
	const grant = vault.begin({ owner: "owner-A", tunnel: "mac-A",
		sourcePath: "file.bin", expectedBytes: bytes.length, expectedSha256: sha(bytes) });
	await ingestBinaryChunk(vault, { id: grant.transferId, owner: "owner-A",
		capability: grant.uploadCapability, offset: 0, sha256: sha(bytes),
		stream: Readable.from([bytes]) });
	await completeBinaryArtifact(vault, { id: grant.transferId,
		owner: "owner-A", capability: grant.uploadCapability });
	const server = http.createServer(async (request, response) => {
		try {
			const result = await artifactBinaryPrivateRange({ request, response },
				{ id: grant.transferId });
			const shape = normalizeDynamicReturn(result);
			response.statusCode = shape.statusCode === 200 && response.statusCode !== 200
				? response.statusCode : shape.statusCode;
			for (const [key, value] of Object.entries(shape.headers)) response.setHeader(key, value);
			response.end(shape.body);
		} catch (error) {
			response.statusCode = 500;
			response.end(String(error.message));
		}
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	t.after(() => server.close());
	const endpoint = `http://127.0.0.1:${server.address().port}`;
	const headers = { "x-awtsmoos-download-capability": grant.downloadCapability,
		"x-awtsmoos-chunk-offset": "31", "x-awtsmoos-chunk-bytes": "16384" };
	const accepted = await fetch(endpoint, { headers });
	assert.equal(accepted.status, 206);
	assert.equal(accepted.headers.get("content-range"), "bytes 31-16414/*");
	assert.equal(accepted.headers.get("content-type"), "application/octet-stream");
	assert.deepEqual(Buffer.from(await accepted.arrayBuffer()), bytes.subarray(31, 16415));
	for (const [badHeaders, expectedStatus] of [
		[{ ...headers, "x-awtsmoos-download-capability": grant.uploadCapability }, 403],
		[{ ...headers, "x-awtsmoos-download-capability": "0".repeat(64) }, 403],
		[{ ...headers, "x-awtsmoos-download-capability": "" }, 400],
		[{ ...headers, "x-awtsmoos-chunk-bytes": "999999999" }, 422]
	]) {
		assert.equal((await fetch(endpoint, { headers: badHeaders })).status, expectedStatus);
	}
	assert.equal((await fetch(endpoint, { method: "POST", headers })).status, 405);
});
