// B"H

const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const { verify } = require("../preview/publicProbe.js");

/**
 * @file Proves public preview readiness requires a real remote response witness.
 */
test("public probe verifies marker and rejects mismatched testimony", async () => {
	const marker = `awtsmoos-public-${Date.now()}`;
	const server = http.createServer((request, response) => {
		response.setHeader("content-type", "text/plain");
		response.end(`B\"H ${marker}`);
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const url = `http://127.0.0.1:${server.address().port}/public-proof`;
	try {
		const verified = await verify(url, { expectedMarker: marker, timeoutMs: 2000 });
		assert.equal(verified.ok, true);
		assert.equal(verified.verified, true);
		assert.ok(verified.bytes > marker.length);
		assert.match(verified.sha256, /^[a-f0-9]{64}$/);
		const rejected = await verify(url, {
			expectedMarker: "different-marker",
			timeoutMs: 2000
		});
		assert.equal(rejected.ok, false);
		assert.equal(rejected.verified, false);
		assert.equal(rejected.error, "public_preview_proof_mismatch");
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
});
