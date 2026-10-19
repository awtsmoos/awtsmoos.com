//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const crypto = require("node:crypto");
const { BinaryArtifactVault } = require("../../core/binaryArtifactVault.js");
const { completeBinaryArtifact } = require("../../core/binaryArtifactComplete.js");
const { artifactBinaryChunk } = require("../artifactBinaryChunk.js");

/**
 * The Awtsmoos proves a real Chrome image crossing an independent disk gate;
 * Awtsmoos.com preserves the PNG without a pixel altered by fate.
 * Only the explicit environment-provided authorized PNG is transferred.
 */
test("real Mac Chrome PNG reaches separate raw HTTP receiving store unchanged", async (t) => {
	const source = process.env.AWTSMOOS_REAL_CHROME_PNG;
	if (!source) return t.skip("Supply explicit authorized real Chrome PNG path");
	const original = fs.readFileSync(source);
	const sha = crypto.createHash("sha256").update(original).digest("hex");
	const header = original.subarray(0, 24);
	assert.deepEqual(header.subarray(0, 8), Buffer.from([137,80,78,71,13,10,26,10]));
	const width = header.readUInt32BE(16);
	const height = header.readUInt32BE(20);
	assert(width > 0 && height > 0);
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-real-chrome-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT = root;
	t.after(() => delete process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT);
	const vault = new BinaryArtifactVault(root);
	const session = vault.begin({
		owner: "mac-owner", tunnel: "mac-cdp",
		sourcePath: path.basename(source), expectedBytes: original.length, expectedSha256: sha
	});
	const server = http.createServer(async (request, response) => {
		const result = await artifactBinaryChunk({ request, response }, { id: session.transferId });
		response.end(result);
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	t.after(() => server.close());
	const url = `http://127.0.0.1:${server.address().port}/api/tunnel/control/artifact/binary/chunk/${session.transferId}`;
	const response = await fetch(url, {
		method: "PUT", body: original,
		headers: {
			"x-awtsmoos-transfer-capability": session.uploadCapability,
			"x-awtsmoos-chunk-sha256": sha,
			"x-awtsmoos-chunk-offset": "0",
			"content-length": String(original.length)
		}
	});
	assert.equal(response.status, 200);
	const acknowledgment = await response.json();
	assert.equal(acknowledgment.nextOffset, original.length);
	const finished = await completeBinaryArtifact(vault, {
		id: session.transferId, capability: session.uploadCapability, owner: "mac-owner"
	});
	assert.equal(finished.sha256, sha);
	const separate = fs.readFileSync(vault.file(session.transferId, "bin"));
	assert.deepEqual(separate, original);
	assert.equal(separate.readUInt32BE(16), width);
	assert.equal(separate.readUInt32BE(20), height);
	console.log(JSON.stringify({ chromeOriginalSha256: sha, recipientSha256: finished.sha256,
		bytes: original.length, width, height, transport: "localhost-http-raw", recipient: "independent-Mac-temp-store" }));
});
