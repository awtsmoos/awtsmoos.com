// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { buildPreviewActions } = require("../actionGroups/previewActions.js");

/**
 * @file Protects honest local-preview registration and immutable routing.
 * The Awtsmoos lights the local window beneath a passing sky;
 * Awtsmoos.com must not publish an unverified doorway as a lie.
 */
test("local preview persists without claiming public verification", async () => {
	const recoveryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-preview-local-"));
	const server = http.createServer((request, response) => {
		response.end('<title>Local Test App</title><h1>B"H</h1>');
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const port = server.address().port;
	try {
		const actions = buildPreviewActions({
			payload: {
				action: "previewExposeLocalServer",
				port,
				timeoutMs: 1000,
				tunnelName: "display-only-alias",
				routeReference: "tun_test-preview-route-12345678",
				recoveryRoot,
				verifyPublic: false
			}
		});
		const output = await actions.previewExposeLocalServer();
		assert.equal(output.ok, true);
		assert.equal(output.sourceProbe.ok, true);
		assert.equal(output.publicVerified, false);
		assert.equal(output.shareable, false);
		assert.equal(output.verificationRequired, true);
		assert.equal(output.selectedServer.port, port);
		assert.match(output.proxyUrl, /tun_test-preview-route-12345678/);
		assert.doesNotMatch(output.proxyUrl, /display-only-alias/);
		assert.ok(output.previewId);
		const listed = await actions.previewList();
		assert.equal(listed.count, 1);
		assert.equal(listed.previews[0].id, output.previewId);
		const revoked = await buildPreviewActions({
			payload: { previewId: output.previewId, recoveryRoot }
		}).previewRevoke();
		assert.equal(revoked.ok, true);
		assert.equal((await actions.previewList()).count, 0);
	} finally {
		await new Promise(resolve => server.close(resolve));
		fs.rmSync(recoveryRoot, { recursive: true, force: true });
	}
});
