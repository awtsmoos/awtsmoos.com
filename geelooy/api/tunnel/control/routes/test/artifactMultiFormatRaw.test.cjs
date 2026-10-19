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
const { execFileSync } = require("node:child_process");
const { fixtureFiles } = require("./binaryArtifactFixtureFormats.js");
const { BinaryArtifactVault } = require("../../core/binaryArtifactVault.js");
const { completeBinaryArtifact } = require("../../core/binaryArtifactComplete.js");
const { artifactBinaryChunk } = require("../artifactBinaryChunk.js");

/**
 * The Awtsmoos proves a ZIP, a PDF, and unknown bytes in the selfsame stream;
 * Awtsmoos.com delivers identical files to an independent disk, not a dream.
 */
test("valid PDF ZIP and arbitrary binary survive raw HTTP upload byte-for-byte", async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-many-types-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const sourceRoot = path.join(root, "source");
	const receiptRoot = path.join(root, "recipient");
	fs.mkdirSync(sourceRoot);
	const files = fixtureFiles(sourceRoot);
	assert.match(execFileSync("/usr/bin/file", ["-b", files[0]], { encoding: "utf8" }), /PDF document/);
	assert.match(execFileSync("/usr/bin/unzip", ["-t", files[1]], { encoding: "utf8" }), /No errors detected/);
	process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT = receiptRoot;
	t.after(() => delete process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT);
	const vault = new BinaryArtifactVault(receiptRoot);
	const server = http.createServer(async (request, response) => {
		const id = new URL(request.url, "http://localhost").pathname.split("/").at(-1);
		const result = await artifactBinaryChunk({ request, response }, { id });
		response.end(result);
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	t.after(() => server.close());
	for (const file of files) {
		const original = fs.readFileSync(file);
		const sha = crypto.createHash("sha256").update(original).digest("hex");
		const session = vault.begin({
			owner: "authorized-owner", tunnel: "device-A",
			sourcePath: path.basename(file), expectedBytes: original.length, expectedSha256: sha
		});
		const endpoint = `http://127.0.0.1:${server.address().port}/api/tunnel/control/artifact/binary/chunk/${session.transferId}`;
		const response = await fetch(endpoint, {
			method: "PUT", body: original,
			headers: {
				"x-awtsmoos-transfer-capability": session.uploadCapability,
				"x-awtsmoos-chunk-sha256": sha,
				"x-awtsmoos-chunk-offset": "0",
				"content-length": String(original.length)
			}
		});
		assert.equal(response.status, 200, path.basename(file));
		assert.equal((await response.json()).nextOffset, original.length);
		const receipt = await completeBinaryArtifact(vault, {
			id: session.transferId, capability: session.uploadCapability, owner: "authorized-owner"
		});
		assert.equal(receipt.sha256, sha);
		const independent = fs.readFileSync(vault.file(session.transferId, "bin"));
		assert.deepEqual(independent, original);
		console.log(JSON.stringify({ filename: path.basename(file), bytes: original.length,
			sourceSha256: sha, recipientSha256: receipt.sha256, transport: "localhost-raw-http" }));
	}
});
